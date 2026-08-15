import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";
import { DeviceFrame } from "@/components/DeviceFrame";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";
import { mintCredential } from "@/lib/api/sokra.functions";
import { ShareableCard } from "@/components/ShareableCard";

export const Route = createFileRoute("/credentials")({
  head: () => ({
    meta: [
      { title: "Your credentials — Sokra" },
      { name: "description", content: "Soulbound proof of what you actually understand, minted on GenLayer." },
    ],
  }),
  component: Credentials,
});

type Cred = {
  id: string;
  subject: string;
  name: string;
  area: string;
  excerpt: string;
  insight: string;
  is_master: boolean;
  mint_status: string;
  token_id: string | null;
  genlayer_tx_hash: string | null;
  quality_score: number | null;
  quality_descriptor: string | null;
  earned_at: string;
};

function Credentials() {
  const navigate = useNavigate();
  const { wallet, loading } = useWallet();
  const [creds, setCreds] = useState<Cred[]>([]);
  const [detail, setDetail] = useState<Cred | null>(null);
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [sharing, setSharing] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  const load = async (w: string) => {
    const { data } = await supabase
      .from("sokra_credentials")
      .select("id, subject, name, area, excerpt, insight, is_master, mint_status, token_id, genlayer_tx_hash, quality_score, quality_descriptor, earned_at")
      .eq("wallet_address", w)
      .neq("mint_status", "declined")
      .order("earned_at", { ascending: false });
    setCreds((data ?? []) as Cred[]);
  };

  useEffect(() => {
    if (!wallet) return;
    load(wallet);
  }, [wallet]);

  if (!wallet) return null;

  const mint = async (c: Cred) => {
    setMintingId(c.id);
    try {
      await mintCredential({ data: { wallet, credentialId: c.id } });
      toast.success(`${c.name} minted onchain`);
      await load(wallet);
      setDetail(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Mint failed.");
    } finally {
      setMintingId(null);
    }
  };

  const share = async (c: Cred) => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const { toPng } = await import("html-to-image");
      const dataUrl = await toPng(cardRef.current, { quality: 0.95, pixelRatio: 2, backgroundColor: "#070810" });
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `sokra-${c.subject}-credential.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Sokra Credential" });
      } else {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = file.name;
        a.click();
      }
    } catch {
      toast.error("Could not generate card. Try again.");
    } finally {
      setSharing(false);
    }
  };

  const copyVerifyLink = async (c: Cred) => {
    await navigator.clipboard.writeText(`${window.location.origin}/verify/${c.token_id}`);
    toast.success("Verification link copied");
  };

  const mintedCount = creds.filter((c) => c.mint_status === "minted").length;

  const grouped: Record<string, Cred[]> = {};
  creds.forEach((c) => {
    grouped[c.subject] = grouped[c.subject] ?? [];
    grouped[c.subject].push(c);
  });
  const subjectsWith = SUBJECTS.filter((s) => grouped[s.id]?.length);

  return (
    <DeviceFrame>
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
      >
        <h1 className="font-display font-black text-[18px]">Credentials</h1>
        <span className="font-mono text-[10px] text-primary tracking-[0.2em]">
          {mintedCount} EARNED
        </span>
      </div>

      <div className="p-5">
        {subjectsWith.length === 0 ? (
          <div className="mt-12 text-center">
            <div className="text-[44px]">🪙</div>
            <p className="mt-4 font-display text-[16px]">No credentials yet.</p>
            <p className="mt-2 font-sans text-[12px] text-text2 max-w-[260px] mx-auto" style={{ lineHeight: 1.6 }}>
              Open a subject and start a conversation. Sokra offers a credential when you demonstrate understanding.
            </p>
          </div>
        ) : (
          subjectsWith.map((s) => (
            <div key={s.id} className="mb-6">
              <div className="flex items-center justify-between border-b py-3" style={{ borderColor: "var(--border)" }}>
                <div className="flex items-center gap-2">
                  <span>{s.emoji}</span>
                  <span className="font-display font-bold text-[14px]">{s.name}</span>
                </div>
                <span className="font-mono text-[9px] text-text3">{grouped[s.id].length} credentials</span>
              </div>
              <div className="space-y-2.5 mt-3">
                {grouped[s.id].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDetail(c)}
                    className="press w-full text-left rounded-xl border p-3.5 hover:-translate-y-[2px]"
                    style={{
                      background: "var(--surface)",
                      borderColor: c.mint_status === "minted" ? "rgba(167,139,250,0.25)" : "var(--border)",
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display font-bold text-[13px]">{c.name}</span>
                      <StatusChip status={c.mint_status} />
                    </div>
                    {c.quality_descriptor && (
                      <span
                        className="mt-2 inline-block rounded-full font-mono"
                        style={{
                          fontSize: 8,
                          padding: "2px 10px",
                          color: "var(--primary)",
                          background: "rgba(167,139,250,0.06)",
                          border: "1px solid rgba(167,139,250,0.12)",
                        }}
                      >
                        {c.quality_descriptor}
                      </span>
                    )}
                    <p
                      className="mt-2 border-l-2 pl-2.5 font-sans italic text-[11px] text-text2"
                      style={{ borderColor: s.color, lineHeight: 1.5 }}
                    >
                      "{c.excerpt}"
                    </p>
                    <p className="mt-2 font-mono text-[9px] text-gold tracking-[0.1em]">✦ {c.insight}</p>
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {detail && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setDetail(null)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.55)" }} />
          <div
            className="animate-sheet-up relative w-full rounded-t-2xl border-t p-5"
            style={{ background: "var(--bg3)", borderColor: "var(--border2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--border2)" }} />
            <div className="flex items-center justify-between gap-2">
              <div className="font-display font-black text-[18px]">{detail.name}</div>
              <StatusChip status={detail.mint_status} />
            </div>
            {detail.quality_descriptor && (
              <div className="mt-4">
                <div className="font-mono text-[9px] text-text3 tracking-[0.2em] uppercase mb-2">
                  How you understood it
                </div>
                <span
                  className="inline-block rounded-full font-mono text-[10px]"
                  style={{
                    padding: "4px 14px",
                    color: "var(--primary)",
                    background: "rgba(167,139,250,0.08)",
                    border: "1px solid rgba(167,139,250,0.15)",
                  }}
                >
                  {detail.quality_descriptor}
                </span>
              </div>
            )}
            <div className="mt-4">
              <div className="font-mono text-[9px] text-text3 tracking-[0.2em] uppercase mb-2">
                Sokra's observation
              </div>
              <p className="font-mono text-[9px] text-gold" style={{ letterSpacing: "0.05em", lineHeight: 1.6 }}>
                ✦ {detail.insight}
              </p>
            </div>
            <p
              className="mt-3 border-l-2 pl-3 font-sans italic text-[11px] text-text2"
              style={{ borderColor: "var(--primary)", lineHeight: 1.6 }}
            >
              "{detail.excerpt}"
            </p>
            <div className="mt-4 space-y-1.5 font-mono text-[9px] text-text3">
              <div>AREA · {detail.area}</div>
              {detail.quality_score != null && <div>DEPTH SCORE · {detail.quality_score}/100</div>}
              <div>EARNED · {new Date(detail.earned_at).toLocaleDateString()}</div>
              {detail.token_id && <div>TOKEN · {detail.token_id}</div>}
              {detail.genlayer_tx_hash && (
                <div className="truncate">TX · {detail.genlayer_tx_hash}</div>
              )}
            </div>
            <div className="mt-5 flex gap-2">
              {detail.mint_status === "pending" ? (
                <button
                  onClick={() => mint(detail)}
                  disabled={mintingId === detail.id}
                  className="flex-1 rounded-[10px] gradient-bg py-3 font-mono text-[9px] tracking-[0.18em] text-[#04050a] press-btn disabled:opacity-60"
                >
                  {mintingId === detail.id ? (
                    <span className="animate-pulse-soft">MINTING ONCHAIN…</span>
                  ) : (
                    "MINT MY CREDENTIAL"
                  )}
                </button>
              ) : (
                detail.token_id && (
                  <button
                    onClick={() => navigate({ to: "/verify/$tokenId", params: { tokenId: detail.token_id! } })}
                    className="flex-1 rounded-[10px] border py-3 font-mono text-[9px] tracking-[0.18em] text-primary press-btn"
                    style={{ borderColor: "var(--border2)" }}
                  >
                    VIEW VERIFICATION
                  </button>
                )
              )}
              <button
                onClick={() => setDetail(null)}
                className="rounded-[10px] border px-4 font-mono text-[9px] tracking-[0.18em] text-text3 press-btn"
                style={{ borderColor: "var(--border)" }}
              >
                CLOSE
              </button>
            </div>
            {detail.mint_status === "minted" && detail.token_id && (
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => share(detail)}
                  disabled={sharing}
                  className="flex-1 rounded-[10px] border py-3 font-mono text-[9px] tracking-[0.18em] text-text2 press-btn disabled:opacity-60"
                  style={{ borderColor: "var(--border)" }}
                >
                  {sharing ? "GENERATING YOUR CARD…" : "SHARE MY CREDENTIAL"}
                </button>
                <button
                  onClick={() => copyVerifyLink(detail)}
                  className="rounded-[10px] border px-4 font-mono text-[9px] tracking-[0.18em] text-text3 press-btn"
                  style={{ borderColor: "var(--border)" }}
                >
                  COPY LINK
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {detail && (
        <ShareableCard
          ref={cardRef}
          cred={detail}
          wallet={wallet}
          subjectName={SUBJECTS.find((s) => s.id === detail.subject)?.name ?? detail.subject}
        />
      )}
    </DeviceFrame>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string; border: string; pulse?: boolean }> = {
    minted: { label: "Verified", color: "var(--green)", bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.2)" },
    pending: { label: "Mint now", color: "var(--gold)", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)" },
    minting: { label: "Minting", color: "var(--primary)", bg: "rgba(167,139,250,0.12)", border: "var(--border2)", pulse: true },
  };
  const s = map[status] ?? map.minted;
  return (
    <span
      className={`font-mono uppercase tracking-[0.15em] rounded-full px-2 py-[2px] whitespace-nowrap ${s.pulse ? "animate-pulse-soft" : ""}`}
      style={{ fontSize: 7, background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}
