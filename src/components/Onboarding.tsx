import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useWallet, truncateWallet } from "@/lib/wallet";
import { Logo } from "@/components/Logo";

export function Onboarding() {
  const { wallet, user, setUsername, completeOnboarding } = useWallet();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (!wallet || !user) return null;

  const finish = async (skip: boolean) => {
    setSaving(true);
    try {
      if (!skip && value.trim()) await setUsername(value.trim());
      await completeOnboarding();
      navigate({ to: "/lesson-zero" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6"
      style={{ background: "var(--bg)" }}
    >
      <div className="absolute top-8">
        <Logo size={22} />
      </div>
      <div className="w-full max-w-sm text-center">
        <h1
          className="font-display font-black"
          style={{ fontSize: 40, letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          Welcome to <em className="gradient-text" style={{ fontStyle: "italic" }}>Sokra.</em>
        </h1>
        <div className="mt-3 font-mono text-[10px] text-text3 tracking-[0.2em]">
          {truncateWallet(wallet)}
        </div>

        <div className="mt-10">
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Choose your username"
            className="w-full rounded-xl border bg-surface px-4 py-3.5 font-sans text-[14px] text-text outline-none transition-colors focus:border-primary"
            style={{ borderColor: "var(--border2)" }}
            maxLength={32}
          />
          <p className="mt-2 font-mono text-[9px] text-text3 tracking-[0.15em]">
            YOU CAN ALWAYS SET THIS LATER FROM YOUR PROFILE.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <button
            disabled={saving}
            onClick={() => finish(false)}
            className="rounded-full gradient-bg px-8 py-3.5 font-display font-bold text-[15px] text-[#04050a] transition-all disabled:opacity-50"
            style={{ boxShadow: "0 16px 48px rgba(167,139,250,0.25)" }}
          >
            Start talking to Sokra
          </button>
          <button
            disabled={saving}
            onClick={() => finish(true)}
            className="font-mono text-[10px] text-text2 tracking-[0.2em] uppercase hover:text-text transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
