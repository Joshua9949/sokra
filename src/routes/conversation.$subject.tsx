import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";
import { Avatar } from "@/components/Avatar";
import { DeviceFrame } from "@/components/DeviceFrame";
import { SUBJECTS } from "@/lib/subjects";
import { PROVOCATIONS } from "@/lib/provocations";
import { supabase } from "@/integrations/supabase/client";
import { sendSokraMessage, mintCredential, declineCredential } from "@/lib/api/sokra.functions";

export const Route = createFileRoute("/conversation/$subject")({
  head: () => ({
    meta: [
      { title: "Conversation — Sokra" },
      { name: "description", content: "Talk with Sokra, the onchain intelligent teacher." },
    ],
  }),
  component: Conversation,
});

type Message = { id: string; role: "user" | "sokra"; content: string };
type Pending = { id: string; name: string; insight: string; excerpt: string };
type Minted = { name: string; insight: string; txHash: string; tokenId: string };

function Conversation() {
  const { subject } = Route.useParams();
  const navigate = useNavigate();
  const { wallet, user, loading } = useWallet();
  const subjectDef = useMemo(() => SUBJECTS.find((s) => s.id === subject), [subject]);

  const [convId, setConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [credCount, setCredCount] = useState(0);
  const [pending, setPending] = useState<Pending | null>(null);
  const [minting, setMinting] = useState(false);
  const [minted, setMinted] = useState<Minted | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!minted) return;
    const t = setTimeout(() => setMinted(null), 8000);
    return () => clearTimeout(t);
  }, [minted]);

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  useEffect(() => {
    if (!wallet || !subjectDef) return;
    (async () => {
      const { data: existing } = await supabase
        .from("sokra_conversations")
        .select("id, credential_count")
        .eq("wallet_address", wallet)
        .eq("subject", subject)
        .maybeSingle();

      let id = existing?.id as string | undefined;
      const creds = existing?.credential_count ?? 0;

      if (!id) {
        const { data: created } = await supabase
          .from("sokra_conversations")
          .insert({ wallet_address: wallet, subject })
          .select("id")
          .single();
        id = created!.id as string;
        const provocation = PROVOCATIONS[subject] ?? "Tell me where you'd like to start.";
        await supabase.from("sokra_messages").insert({
          conversation_id: id,
          role: "sokra",
          content: provocation,
        });
      }
      setConvId(id!);
      setCredCount(creds);

      const { data: msgs } = await supabase
        .from("sokra_messages")
        .select("id, role, content")
        .eq("conversation_id", id!)
        .order("created_at", { ascending: true });
      setMessages((msgs ?? []) as Message[]);

      const { data: pend } = await supabase
        .from("sokra_credentials")
        .select("id, name, insight, excerpt")
        .eq("wallet_address", wallet)
        .eq("subject", subject)
        .eq("mint_status", "pending")
        .order("earned_at", { ascending: false })
        .maybeSingle();
      if (pend) setPending(pend as Pending);
    })();
  }, [wallet, subject, subjectDef]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, pending, minted]);

  if (!wallet || !user || !subjectDef) return null;

  const send = async () => {
    const content = text.trim();
    if (!content || !convId || typing) return;
    setText("");

    const optimistic: Message = { id: crypto.randomUUID(), role: "user", content };
    setMessages((m) => [...m, optimistic]);
    setTyping(true);

    try {
      const res = await sendSokraMessage({
        data: { wallet, conversationId: convId, subject, message: content },
      });
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "sokra", content: res.reply }]);
      setCredCount(res.credentialCount);
      if (res.pending) setPending(res.pending);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Sokra could not respond.");
    } finally {
      setTyping(false);
    }
  };

  // Keep the composer above the on-screen keyboard (Visual Viewport API).
  useEffect(() => {
    const vp = typeof window !== "undefined" ? window.visualViewport : undefined;
    if (!vp) return;
    const handle = () => {
      const h = Math.max(0, window.innerHeight - vp.height);
      document.documentElement.style.setProperty("--keyboard-height", `${h}px`);
    };
    vp.addEventListener("resize", handle);
    vp.addEventListener("scroll", handle);
    return () => {
      vp.removeEventListener("resize", handle);
      vp.removeEventListener("scroll", handle);
      document.documentElement.style.setProperty("--keyboard-height", "0px");
    };
  }, []);

  const doMint = async () => {
    if (!pending || minting || !convId) return;
    setMinting(true);
    try {
      const res = await mintCredential({
        data: { wallet, credentialId: pending.id, conversationId: convId },
      });
      setMinted({
        name: res.credential.name,
        insight: res.credential.insight,
        txHash: res.credential.genlayer_tx_hash ?? "",
        tokenId: res.credential.token_id ?? "",
      });
      setCredCount(res.credentialCount);
      setPending(null);
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "sokra",
          content: `That one is yours now — signed onto GenLayer and soulbound to your wallet. Let's keep going.`,
        },
      ]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "The mint transaction failed.");
    } finally {
      setMinting(false);
    }
  };

  const doDecline = async () => {
    if (!pending) return;
    const id = pending.id;
    setPending(null);
    try {
      await declineCredential({ data: { wallet, credentialId: id } });
    } catch {
      /* silent */
    }
  };

  return (
    <DeviceFrame scroll={false}>
      <div
        className="flex items-center gap-3 border-b px-5 py-4"
        style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
      >
        <button onClick={() => navigate({ to: "/discover" })} className="text-text2 hover:text-text press-btn">
          <ArrowLeft size={18} />
        </button>
        <Avatar wallet={wallet} username={null} size={32}>
          <span className="font-display font-black text-white text-[14px]">S</span>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="font-display font-bold text-[14px] leading-tight flex items-center gap-1.5">
            <span className="text-[15px]">{subjectDef.emoji}</span>
            <span className="truncate">{subjectDef.name}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal animate-breathe" />
            <span className="font-mono text-[9px] text-teal tracking-[0.2em]">GENLAYER ACTIVE</span>
          </div>
        </div>
        <button
          onClick={() => navigate({ to: "/credentials" })}
          className="rounded-md border px-2.5 py-1 font-mono text-[9px] text-primary2 press-btn"
          style={{ background: "rgba(167,139,250,0.1)", borderColor: "var(--border2)" }}
        >
          🏅 {credCount}
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 flex flex-col gap-3 p-4 overflow-y-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`animate-msg-in ${m.role === "user" ? "self-end max-w-[85%]" : "self-start max-w-[85%]"}`}
          >
            <div
              className={`font-mono text-[8px] tracking-[0.15em] mb-1 ${m.role === "user" ? "text-right text-text3" : "text-primary"}`}
            >
              {m.role === "user" ? "YOU" : "SOKRA"}
            </div>
            <div
              className="font-sans text-[12px] px-3.5 py-3"
              style={{
                lineHeight: 1.6,
                color: "var(--text)",
                border: "1px solid",
                ...(m.role === "user"
                  ? {
                      borderRadius: "16px 4px 16px 16px",
                      background: "linear-gradient(135deg, rgba(167,139,250,0.2), rgba(245,158,11,0.15))",
                      borderColor: "rgba(167,139,250,0.2)",
                    }
                  : {
                      borderRadius: "4px 16px 16px 16px",
                      background: "var(--surface)",
                      borderColor: "var(--border)",
                    }),
              }}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="self-start max-w-[85%]">
            <div className="font-mono text-[8px] tracking-[0.15em] mb-1 text-primary">SOKRA</div>
            <div
              className="flex items-center gap-1.5 px-4 py-3.5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "4px 16px 16px 16px",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="block h-1.5 w-1.5 rounded-full bg-text3"
                  style={{ animation: `breathe 1s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mint prompt */}
      {pending && (
        <div className="px-4 pb-2">
          <div
            className="rounded-xl border p-3.5 animate-cred-in"
            style={{
              background: "linear-gradient(135deg, rgba(167,139,250,0.14), rgba(245,158,11,0.1))",
              borderColor: "var(--border2)",
            }}
          >
            <div className="font-mono text-[8px] tracking-[0.2em] text-primary">
              🏅 CREDENTIAL READY TO MINT
            </div>
            <div className="mt-1.5 font-display font-bold text-[14px]">{pending.name}</div>
            <div className="font-sans text-[11px] text-text2 mt-1" style={{ lineHeight: 1.5 }}>
              {pending.insight}
            </div>
            <div className="mt-3 flex gap-2">
              <button
                onClick={doMint}
                disabled={minting}
                className="flex-1 rounded-[10px] gradient-bg py-2.5 font-mono text-[9px] tracking-[0.18em] text-[#04050a] press-btn disabled:opacity-60"
              >
                {minting ? (
                  <span className="animate-pulse-soft">MINTING ONCHAIN…</span>
                ) : (
                  "MINT MY CREDENTIAL"
                )}
              </button>
              <button
                onClick={doDecline}
                disabled={minting}
                className="rounded-[10px] border px-3 font-mono text-[9px] tracking-[0.18em] text-text3 press-btn"
                style={{ borderColor: "var(--border)" }}
              >
                NOT NOW
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minted confirmation */}
      {minted && (
        <div className="px-4 pb-2">
          <div
            className="rounded-xl border p-3.5 animate-cred-in"
            style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.14), rgba(167,139,250,0.12))",
              borderColor: "rgba(245,158,11,0.35)",
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[8px] tracking-[0.2em] text-gold">
                🏅 CREDENTIAL MINTED ONCHAIN
              </span>
              <button onClick={() => setMinted(null)} className="font-mono text-[9px] text-text3">
                ✕
              </button>
            </div>
            <div className="mt-1.5 font-display font-bold text-[14px]">{minted.name}</div>
            <div className="font-sans text-[11px] text-text2 mt-1" style={{ lineHeight: 1.5 }}>
              {minted.insight}
            </div>
            <div className="mt-2 font-mono text-[8px] text-text3 truncate">
              {minted.tokenId} · tx {minted.txHash.slice(0, 14)}…{minted.txHash.slice(-6)}
            </div>
          </div>
        </div>
      )}

      <div className="border-t p-3" style={{ background: "var(--bg3)", borderColor: "var(--border)" }}>
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="Type your thoughts..."
            rows={1}
            className="flex-1 rounded-[10px] border bg-surface px-3 py-2.5 font-sans text-[11px] text-text outline-none transition-colors focus:border-primary resize-none"
            style={{ borderColor: "var(--border)", minHeight: 40, maxHeight: 120 }}
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="h-[34px] w-[34px] rounded-[10px] gradient-bg flex items-center justify-center press-btn disabled:opacity-40"
            aria-label="Send"
          >
            <ArrowUp size={16} className="text-[#04050a]" />
          </button>
        </div>
      </div>
    </DeviceFrame>
  );
}
