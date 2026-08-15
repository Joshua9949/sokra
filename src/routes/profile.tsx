import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useWallet, truncateWallet } from "@/lib/wallet";
import { Avatar } from "@/components/Avatar";
import { DeviceFrame } from "@/components/DeviceFrame";
import { SUBJECTS } from "@/lib/subjects";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — Sokra" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { wallet, user, loading, setUsername, disconnect } = useWallet();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);
  const [stats, setStats] = useState({ credentials: 0, subjects: 0, exchanges: 0 });
  const [active, setActive] = useState<{ subject: string; credential_count: number }[]>([]);

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  useEffect(() => {
    if (user?.username) setName(user.username);
  }, [user?.username]);

  useEffect(() => {
    if (!wallet) return;
    (async () => {
      const [credsRes, convRes] = await Promise.all([
        supabase.from("sokra_credentials").select("subject", { count: "exact" }).eq("wallet_address", wallet),
        supabase.from("sokra_conversations").select("subject, credential_count, message_count").eq("wallet_address", wallet),
      ]);
      const convs = (convRes.data ?? []) as { subject: string; credential_count: number; message_count: number }[];
      setStats({
        credentials: credsRes.count ?? 0,
        subjects: convs.length,
        exchanges: convs.reduce((s, c) => s + c.message_count, 0),
      });
      setActive(convs.filter((c) => c.message_count > 0));
    })();
  }, [wallet]);

  if (!wallet || !user) return null;

  const copyAddr = async () => {
    await navigator.clipboard.writeText(wallet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <DeviceFrame>
      <div
        className="flex flex-col items-center border-b px-5 py-6"
        style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
      >
        <Avatar wallet={wallet} username={user.username} size={56} />
        <div className="mt-3 font-display font-black text-[16px]">
          {user.username || truncateWallet(wallet)}
        </div>
        <button onClick={copyAddr} className="mt-1 font-mono text-[9px] text-text3 tracking-[0.15em] hover:text-text2 transition-colors">
          {copied ? "COPIED ✓" : truncateWallet(wallet)}
        </button>

        <div className="mt-5 flex gap-6">
          {[
            { n: stats.credentials, l: "Credentials" },
            { n: stats.subjects, l: "Subjects" },
            { n: stats.exchanges, l: "Exchanges" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-display font-black text-[20px] text-primary">{s.n}</div>
              <div className="mt-0.5 font-mono text-[8px] text-text3 tracking-[0.15em] uppercase">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="font-mono text-[9px] text-text3 tracking-[0.2em] uppercase">
          Active subjects
        </div>
        <div className="mt-2 space-y-2">
          {active.length === 0 && (
            <div className="font-sans text-[12px] text-text2 mt-2">No conversations yet.</div>
          )}
          {active.map((a) => {
            const s = SUBJECTS.find((x) => x.id === a.subject);
            if (!s) return null;
            return (
              <div
                key={a.subject}
                className="flex items-center justify-between rounded-lg border px-3 py-2.5"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                <div className="flex items-center gap-2">
                  <span>{s.emoji}</span>
                  <span className="font-display font-bold text-[12px]">{s.name}</span>
                </div>
                <span className="font-mono text-[9px] text-text3">
                  {a.credential_count} cred{a.credential_count === 1 ? "" : "s"}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-7">
          <div className="font-mono text-[9px] text-text3 tracking-[0.2em] uppercase">Settings</div>
          <div className="mt-3 space-y-3">
            <div>
              <label className="font-sans text-[11px] text-text2 block mb-1.5">Username</label>
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Choose your username"
                  className="flex-1 rounded-lg border bg-surface px-3 py-2 font-sans text-[12px] outline-none focus:border-primary"
                  style={{ borderColor: "var(--border)" }}
                />
                <button
                  onClick={() => name && setUsername(name)}
                  className="rounded-lg gradient-bg px-4 font-display font-bold text-[12px] text-[#04050a]"
                >
                  Save
                </button>
              </div>
            </div>

            <button
              onClick={() => setConfirmDisconnect(true)}
              className="mt-6 font-mono text-[10px] text-red tracking-[0.15em] uppercase hover:opacity-80"
              style={{ color: "var(--red)" }}
            >
              Disconnect wallet
            </button>
          </div>
        </div>
      </div>

      {confirmDisconnect && (
        <div className="absolute inset-0 z-50 flex items-end" onClick={() => setConfirmDisconnect(false)}>
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} />
          <div
            className="animate-sheet-up relative w-full border-t"
            style={{
              background: "var(--bg2)",
              borderColor: "var(--border2)",
              borderRadius: "24px 24px 0 0",
              padding: "28px 24px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ background: "var(--border2)" }} />
            <div className="font-display font-bold text-[18px]" style={{ letterSpacing: "-0.5px" }}>
              Disconnect wallet?
            </div>
            <p className="mt-2 font-sans text-[14px] text-text2" style={{ lineHeight: 1.6 }}>
              Your conversation history and credentials are safely saved onchain and in your profile. You can
              reconnect anytime to continue where you left off.
            </p>
            <button
              onClick={() => {
                disconnect();
                toast("Wallet disconnected");
                navigate({ to: "/" });
              }}
              className="mt-6 w-full rounded-[10px] py-3.5 font-mono text-[11px] press-btn"
              style={{
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.2)",
                color: "var(--red)",
              }}
            >
              Yes, disconnect
            </button>
            <button
              onClick={() => setConfirmDisconnect(false)}
              className="mt-2.5 w-full rounded-[10px] py-3.5 font-mono text-[11px] text-text3 press-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </DeviceFrame>
  );
}
