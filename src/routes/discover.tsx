import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWallet, truncateWallet } from "@/lib/wallet";
import { Avatar } from "@/components/Avatar";
import { DeviceFrame } from "@/components/DeviceFrame";
import { Logo } from "@/components/Logo";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingOverlay } from "@/components/OnboardingOverlay";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — Sokra" }] }),
  component: Discover,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "GOOD MORNING";
  if (h < 18) return "GOOD AFTERNOON";
  return "GOOD EVENING";
}

type ConvRow = { subject: string; credential_count: number; message_count: number };

function Discover() {
  const navigate = useNavigate();
  const { wallet, user, loading, markOverlaySeen } = useWallet();
  const [convs, setConvs] = useState<Record<string, ConvRow>>({});

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  useEffect(() => {
    if (!wallet) return;
    supabase
      .from("sokra_conversations")
      .select("subject, credential_count, message_count")
      .eq("wallet_address", wallet)
      .then(({ data }) => {
        const map: Record<string, ConvRow> = {};
        (data ?? []).forEach((r) => (map[r.subject] = r as ConvRow));
        setConvs(map);
      });
  }, [wallet]);

  if (!wallet || !user) return null;

  const sorted = [...SUBJECTS].sort((a, b) => {
    const ap = convs[a.id]?.message_count ?? 0;
    const bp = convs[b.id]?.message_count ?? 0;
    if (a.live !== b.live) return a.live ? -1 : 1;
    return bp - ap;
  });

  const display = (user.username || truncateWallet(wallet)).toUpperCase();

  return (
    <DeviceFrame>
      {/* Top bar */}
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
      >
        <Logo size={20} />
        <Avatar wallet={wallet} username={user.username} size={36} />
      </div>

      {/* Greeting */}
      <div className="px-5 pt-4 pb-2 font-mono text-[9px] text-primary tracking-[0.2em]">
        {greeting()}, {display}
      </div>

      {/* Subject list */}
      <div className="flex flex-col gap-2 px-3.5 pt-2" data-tour="subjects">
        {sorted.map((s) => {
          const c = convs[s.id];
          const inProgress = c && c.message_count > 0;
          const earned = c?.credential_count ?? 0;
          const status = !s.live ? "COMING SOON" : inProgress ? "IN PROGRESS" : "NEW";
          const isComing = !s.live;
          return (
            <button
              key={s.id}
              disabled={isComing}
              onClick={() => navigate({ to: "/conversation/$subject", params: { subject: s.id } })}
              className="group flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left transition-all"
              style={{
                background: "var(--surface)",
                borderColor: "var(--border)",
                opacity: isComing ? 0.4 : 1,
                cursor: isComing ? "not-allowed" : "pointer",
              }}
            >
              <span className="text-[18px] flex-shrink-0">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[12px] leading-tight truncate">{s.name}</div>
                <div className="font-sans text-[10px] text-text2 mt-0.5 leading-snug">
                  {inProgress ? `${earned} credential${earned === 1 ? "" : "s"} earned` : "Start a conversation"}
                </div>
              </div>
              <span
                className="font-mono uppercase tracking-[0.15em] rounded-full border whitespace-nowrap"
                style={{
                  fontSize: 8,
                  padding: "3px 8px",
                  ...(status === "IN PROGRESS"
                    ? {
                        background: "rgba(167,139,250,0.1)",
                        color: "var(--primary)",
                        borderColor: "rgba(167,139,250,0.2)",
                      }
                    : status === "NEW"
                      ? {
                          background: "rgba(75,85,99,0.2)",
                          color: "var(--text3)",
                          borderColor: "var(--border)",
                        }
                      : {
                          background: "rgba(75,85,99,0.15)",
                          color: "var(--text3)",
                          borderColor: "var(--border)",
                        }),
                }}
              >
                {status}
              </span>
            </button>
          );
        })}
      </div>
      {user.lesson_zero_seen && !user.onboarding_overlay_seen && (
        <OnboardingOverlay onDone={() => void markOverlaySeen()} />
      )}
    </DeviceFrame>
  );
}
