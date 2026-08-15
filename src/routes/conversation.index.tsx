import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/wallet";
import { DeviceFrame } from "@/components/DeviceFrame";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/conversation/")({
  head: () => ({
    meta: [
      { title: "Your conversations — Sokra" },
      { name: "description", content: "Every conversation you've had with Sokra, and what you earned." },
    ],
  }),
  component: ConversationHistory,
});

type Row = {
  subject: string;
  message_count: number;
  credential_count: number;
  last_message_at: string;
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function ConversationHistory() {
  const navigate = useNavigate();
  const { wallet, loading } = useWallet();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  useEffect(() => {
    if (!wallet) return;
    supabase
      .from("sokra_conversations")
      .select("subject, message_count, credential_count, last_message_at")
      .eq("wallet_address", wallet)
      .order("last_message_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
  }, [wallet]);

  if (!wallet) return null;

  return (
    <DeviceFrame>
      <div
        className="flex items-center justify-between border-b px-5 py-4"
        style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
      >
        <h1 className="font-display font-black text-[18px]">Conversations</h1>
        <span className="font-mono text-[10px] text-primary tracking-[0.2em]">
          {rows.length} ACTIVE
        </span>
      </div>

      <div className="px-3.5 py-4 flex flex-col gap-2">
        {rows.length === 0 && (
          <div className="mt-12 text-center">
            <div className="text-[40px]">💬</div>
            <p className="mt-4 font-display text-[16px]">Nothing here yet.</p>
            <p className="mt-2 font-sans text-[12px] text-text2 max-w-[250px] mx-auto" style={{ lineHeight: 1.6 }}>
              Pick a subject on Discover and Sokra will open with a question.
            </p>
            <button
              onClick={() => navigate({ to: "/discover" })}
              className="mt-5 rounded-[10px] gradient-bg px-5 py-2.5 font-mono text-[9px] tracking-[0.18em] text-[#04050a] press-btn"
            >
              BROWSE SUBJECTS
            </button>
          </div>
        )}
        {rows.map((r) => {
          const s = SUBJECTS.find((x) => x.id === r.subject);
          if (!s) return null;
          return (
            <button
              key={r.subject}
              onClick={() => navigate({ to: "/conversation/$subject", params: { subject: r.subject } })}
              className="press flex items-center gap-2.5 rounded-[10px] border px-3.5 py-3 text-left hover:border-[var(--border2)]"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <span className="text-[18px]">{s.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display font-bold text-[12px] truncate">{s.name}</div>
                <div className="font-sans text-[10px] text-text2 mt-0.5">
                  {r.message_count} exchange{r.message_count === 1 ? "" : "s"} · {r.credential_count} credential
                  {r.credential_count === 1 ? "" : "s"}
                </div>
              </div>
              <span className="font-mono text-[8px] text-text3 tracking-[0.12em] whitespace-nowrap">
                {timeAgo(r.last_message_at)}
              </span>
            </button>
          );
        })}
      </div>
    </DeviceFrame>
  );
}
