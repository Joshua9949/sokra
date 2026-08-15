import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function formatConversation(messages: { role: string; content: string }[]): string {
  if (!messages.length) return "No conversation history was supplied.";
  return messages
    .slice(-40)
    .map((message) => `${message.role === "user" ? "Learner" : "Sokra"}: ${message.content}`)
    .join("\n");
}

export const sendSokraMessage = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      wallet: z.string().min(4),
      conversationId: z.string().uuid(),
      subject: z.string().min(1),
      message: z.string().min(1).max(4000),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { runSokra } = await import("@/lib/sokra-engine.server");

    await supabaseAdmin.from("sokra_messages").insert({
      conversation_id: data.conversationId,
      role: "user",
      content: data.message,
    });

    const { data: msgs } = await supabaseAdmin
      .from("sokra_messages")
      .select("role, content")
      .eq("conversation_id", data.conversationId)
      .order("created_at", { ascending: true });

    const { data: creds } = await supabaseAdmin
      .from("sokra_credentials")
      .select("area")
      .eq("wallet_address", data.wallet)
      .eq("subject", data.subject);

    const history = (msgs ?? []).map((m) => ({
      role: m.role === "user" ? ("user" as const) : ("sokra" as const),
      content: m.content,
    }));

    const result = await runSokra(
      data.subject,
      history,
      (creds ?? []).map((c) => c.area),
    );

    await supabaseAdmin.from("sokra_messages").insert({
      conversation_id: data.conversationId,
      role: "sokra",
      content: result.reply,
    });

    let pending: null | { id: string; name: string; insight: string; excerpt: string } = null;

    if (result.credential) {
      const { data: row } = await supabaseAdmin
        .from("sokra_credentials")
        .insert({
          wallet_address: data.wallet,
          subject: data.subject,
          name: result.credential.name,
          area: result.credential.area,
          excerpt: result.credential.excerpt,
          insight: result.credential.insight,
          quality_score: null,
          quality_descriptor: null,
          mint_status: "pending",
        })
        .select("id, name, insight, excerpt")
        .single();
      if (row) pending = row;
    }

    const { data: conv } = await supabaseAdmin
      .from("sokra_conversations")
      .select("credential_count")
      .eq("id", data.conversationId)
      .maybeSingle();

    await supabaseAdmin
      .from("sokra_conversations")
      .update({
        message_count: history.length + 1,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", data.conversationId);

    return {
      reply: result.reply,
      pending,
      credentialCount: conv?.credential_count ?? 0,
    };
  });

export const mintCredential = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      wallet: z.string().min(4),
      credentialId: z.string().uuid(),
      conversationId: z.string().uuid().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { mintCredentialOnGenLayer } = await import("@/lib/genlayer.server");

    const { data: candidate, error: candidateError } = await supabaseAdmin
      .from("sokra_credentials")
      .select("id, wallet_address, subject, name, area, excerpt, insight, mint_status")
      .eq("id", data.credentialId)
      .eq("wallet_address", data.wallet)
      .eq("mint_status", "pending")
      .maybeSingle();

    if (candidateError || !candidate) {
      throw new Error("This credential is already being minted or is no longer pending.");
    }

    const { data: messages } = data.conversationId
      ? await supabaseAdmin
          .from("sokra_messages")
          .select("role, content")
          .eq("conversation_id", data.conversationId)
          .order("created_at", { ascending: true })
      : { data: [] as { role: string; content: string }[] };

    const { data: locked, error: lockError } = await supabaseAdmin
      .from("sokra_credentials")
      .update({ mint_status: "minting" })
      .eq("id", data.credentialId)
      .eq("wallet_address", data.wallet)
      .eq("mint_status", "pending")
      .select("id")
      .maybeSingle();

    if (lockError || !locked) {
      throw new Error("This credential is already being minted or is no longer pending.");
    }

    let chainCredential;
    try {
      chainCredential = await mintCredentialOnGenLayer({
        credentialId: candidate.id,
        wallet: candidate.wallet_address,
        subject: candidate.subject,
        name: candidate.name,
        area: candidate.area,
        excerpt: candidate.excerpt,
        insight: candidate.insight,
        conversation: formatConversation(messages ?? []),
      });
    } catch (error) {
      await supabaseAdmin
        .from("sokra_credentials")
        .update({ mint_status: "pending" })
        .eq("id", data.credentialId)
        .eq("wallet_address", data.wallet)
        .eq("mint_status", "minting");

      throw new Error(error instanceof Error ? error.message : "Could not mint this credential.");
    }

    const { data: row, error } = await supabaseAdmin
      .from("sokra_credentials")
      .update({
        mint_status: "minted",
        contract_address: chainCredential.contractAddress,
        genlayer_tx_hash: chainCredential.transactionHash,
        token_id: chainCredential.tokenId,
        quality_score: chainCredential.qualityScore,
        quality_descriptor: chainCredential.qualityDescriptor,
      })
      .eq("id", data.credentialId)
      .eq("wallet_address", data.wallet)
      .eq("mint_status", "minting")
      .select(
        "id, name, insight, subject, token_id, genlayer_tx_hash, quality_score, quality_descriptor, contract_address",
      )
      .single();

    if (error || !row) throw new Error("Could not mint this credential.");

    await supabaseAdmin
      .from("sokra_users")
      .update({ first_credential_earned: true })
      .eq("wallet_address", data.wallet);

    const { count } = await supabaseAdmin
      .from("sokra_credentials")
      .select("id", { count: "exact", head: true })
      .eq("wallet_address", data.wallet)
      .eq("subject", row.subject)
      .eq("mint_status", "minted");

    if (data.conversationId) {
      await supabaseAdmin
        .from("sokra_conversations")
        .update({ credential_count: count ?? 0 })
        .eq("id", data.conversationId);
    }

    return { credential: row, credentialCount: count ?? 0 };
  });

export const declineCredential = createServerFn({ method: "POST" })
  .inputValidator(z.object({ wallet: z.string().min(4), credentialId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin
      .from("sokra_credentials")
      .update({ mint_status: "declined" })
      .eq("id", data.credentialId)
      .eq("wallet_address", data.wallet);
    return { ok: true };
  });

export const verifyCredential = createServerFn({ method: "GET" })
  .inputValidator(z.object({ tokenId: z.string().min(3).max(64) }))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin
      .from("sokra_credentials")
      .select(
        "token_id, name, area, subject, insight, excerpt, earned_at, genlayer_tx_hash, wallet_address, quality_score",
      )
      .eq("token_id", data.tokenId.trim().toUpperCase())
      .eq("mint_status", "minted")
      .maybeSingle();
    if (!row) return { found: false as const };
    return { found: true as const, credential: row, verifiedAt: new Date().toISOString() };
  });
