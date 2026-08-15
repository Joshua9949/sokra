import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { SUBJECTS } from "@/lib/subjects";
import { verifyCredential } from "@/lib/api/sokra.functions";

export const Route = createFileRoute("/verify/$tokenId")({
  head: () => ({
    meta: [
      { title: "Verify a Sokra credential" },
      {
        name: "description",
        content: "Verify a Sokra credential directly against the GenLayer network. No intermediaries, no trust required.",
      },
      { property: "og:title", content: "Verify a Sokra credential" },
      { property: "og:description", content: "Onchain proof of understanding, verified on GenLayer." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Verify,
});

type Result = Awaited<ReturnType<typeof verifyCredential>>;

function Verify() {
  const { tokenId } = Route.useParams();
  const navigate = useNavigate();
  const [input, setInput] = useState(tokenId === "search" ? "" : tokenId);
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [result, setResult] = useState<Result | null>(null);

  const run = async (id: string) => {
    if (!id.trim()) return;
    setState("loading");
    try {
      const res = await verifyCredential({ data: { tokenId: id } });
      setResult(res);
    } catch {
      setResult({ found: false });
    } finally {
      setState("done");
    }
  };

  useEffect(() => {
    if (tokenId && tokenId !== "search") run(tokenId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenId]);

  const subject = result?.found ? SUBJECTS.find((s) => s.id === result.credential.subject) : null;

  return (
    <main className="min-h-screen px-6 py-16" style={{ background: "var(--bg)" }}>
      <div className="mx-auto w-full" style={{ maxWidth: 680 }}>
        <div className="flex flex-col items-center">
          <Logo size={20} />
          <div className="mt-2 font-mono text-[9px] text-primary tracking-[0.2em]">
            CREDENTIAL VERIFICATION
          </div>
        </div>

        <h1
          className="mt-10 text-center font-display font-black"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.02em", lineHeight: 1.05 }}
        >
          Verify a Sokra credential.
        </h1>
        <p
          className="mx-auto mt-4 text-center font-sans text-[15px] font-light text-text2"
          style={{ maxWidth: 440, lineHeight: 1.7 }}
        >
          Enter a credential token ID to verify it directly on the GenLayer network. No intermediaries.
          No trust required.
        </p>

        <div className="mt-10 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && navigate({ to: "/verify/$tokenId", params: { tokenId: input.trim().toUpperCase() } })}
            placeholder="SKR-XXXXXXXXXX"
            className="flex-1 rounded-xl border px-4 py-3.5 font-mono text-[13px] text-text outline-none transition-colors focus:border-primary"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          />
          <button
            onClick={() => navigate({ to: "/verify/$tokenId", params: { tokenId: input.trim().toUpperCase() } })}
            className="rounded-xl gradient-bg px-6 font-mono text-[10px] tracking-[0.18em] text-[#04050a] press-btn"
          >
            VERIFY
          </button>
        </div>

        {state === "loading" && (
          <p className="mt-10 text-center font-mono text-[10px] tracking-[0.2em] text-primary animate-pulse-soft">
            QUERYING GENLAYER NETWORK…
          </p>
        )}

        {state === "done" && result && !result.found && (
          <div
            className="mt-10 rounded-2xl border p-8 text-center"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="text-[32px]">🚫</div>
            <div className="mt-3 font-display font-bold text-[18px]">No credential found</div>
            <p className="mt-2 font-sans text-[13px] text-text2">
              This token ID does not correspond to any minted Sokra credential.
            </p>
          </div>
        )}

        {state === "done" && result?.found && (
          <div className="mt-10 animate-cred-in">
            <div
              className="rounded-2xl border p-7"
              style={{
                background: "linear-gradient(135deg, rgba(167,139,250,0.1), rgba(245,158,11,0.07))",
                borderColor: "rgba(52,211,153,0.35)",
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[9px] tracking-[0.2em]" style={{ color: "var(--green)" }}>
                  ✓ VERIFIED ON GENLAYER
                </span>
                <span className="font-mono text-[9px] text-text3">{result.credential.token_id}</span>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="text-[20px]">{subject?.emoji}</span>
                <span className="font-mono text-[10px] text-text2 tracking-[0.15em] uppercase">
                  {subject?.name ?? result.credential.subject}
                </span>
              </div>

              <h2 className="mt-2 font-display font-black text-[26px]">{result.credential.name}</h2>
              <p className="mt-2 font-sans text-[14px] text-text2" style={{ lineHeight: 1.7 }}>
                {result.credential.insight}
              </p>
              <p
                className="mt-5 border-l-2 pl-4 font-sans italic text-[13px] text-text2"
                style={{ borderColor: "var(--primary)", lineHeight: 1.7 }}
              >
                "{result.credential.excerpt}"
              </p>

              <div className="mt-6 grid gap-2 font-mono text-[10px] text-text3">
                <div>HOLDER · {result.credential.wallet_address}</div>
                <div>AREA · {result.credential.area}</div>
                {result.credential.quality_score != null && (
                  <div>DEPTH SCORE · {result.credential.quality_score}/100</div>
                )}
                <div>EARNED · {new Date(result.credential.earned_at).toLocaleString()}</div>
                <div className="break-all">TX · {result.credential.genlayer_tx_hash}</div>
                <div>CHECKED · {new Date(result.verifiedAt).toLocaleString()}</div>
              </div>
            </div>
            <p className="mt-4 text-center font-sans text-[12px] text-text3">
              This credential is soulbound. It cannot be transferred, bought, or faked.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
