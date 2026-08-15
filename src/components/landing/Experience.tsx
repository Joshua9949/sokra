import { useState, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Compass, MessageCircle, Award, User, Sparkles } from "lucide-react";

type TabKey = "discover" | "conversation" | "credentials" | "profile";

const TABS: { key: TabKey; label: string; title: string; desc: string; features: { h: string; p: string }[] }[] = [
  {
    key: "discover",
    label: "Discover",
    title: "Pick a subject. The conversation begins.",
    desc: "A single quiet screen. Thirteen subjects. One opens — the rest are coming. No tutorial, no onboarding. Just choice.",
    features: [
      { h: "Live + Coming Soon", p: "Crypto & Web3 is live. Every other subject signals when it arrives." },
      { h: "No friction", p: "Tap a subject and Sokra opens with a single question." },
      { h: "Quiet hierarchy", p: "The flagship subject sits at the top. Everything else breathes." },
    ],
  },
  {
    key: "conversation",
    label: "Conversation",
    title: "The heart of Sokra.",
    desc: "A clean message stream. Sokra asks. You think. Three sentences max per turn. No XP bars, no progress meters.",
    features: [
      { h: "Live data when needed", p: "Sokra pulls live prices and figures via GenLayer mid-conversation." },
      { h: "Autonomous credentials", p: "A token appears in your wallet the moment Sokra decides you understand." },
      { h: "Continues forever", p: "Return tomorrow. Sokra reads the full history and picks up where you left." },
    ],
  },
  {
    key: "credentials",
    label: "Credentials",
    title: "Soulbound. Verifiable. Yours.",
    desc: "Every credential you earn is minted by GenLayer to your wallet — tied to a real conversation excerpt and a warm one-line insight.",
    features: [
      { h: "Excerpts not scores", p: "Each credential carries the moment you demonstrated understanding." },
      { h: "Master credentials", p: "Complete every area in a subject and a master token appears." },
      { h: "Shareable, not transferable", p: "Show them off — but they belong to you and only you." },
    ],
  },
  {
    key: "profile",
    label: "Profile",
    title: "Your onchain learning identity.",
    desc: "A public page tied to your wallet. Anyone can see what you have earned — and start their own conversation from there.",
    features: [
      { h: "Public credential page", p: "Share a single URL. Your credentials. Your story." },
      { h: "Active subjects", p: "See where you are mid-conversation across every subject." },
      { h: "Daily reminders", p: "Optional. Sokra waits — quietly — until you return." },
    ],
  },
];

const TAB_ICONS: Record<TabKey, ReactNode> = {
  discover: <Compass size={14} />,
  conversation: <MessageCircle size={14} />,
  credentials: <Award size={14} />,
  profile: <User size={14} />,
};

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="animate-float mx-auto rounded-[44px] p-4"
      style={{
        width: 320,
        background: "var(--bg)",
        border: "1.5px solid var(--border2)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02)",
      }}
    >
      <div className="relative mx-auto mb-3 flex items-center justify-center" style={{ width: 90, height: 26 }}>
        <div className="absolute inset-0 rounded-b-2xl bg-black/40" />
        <div className="relative h-[7px] w-[7px] rounded-full bg-black/80 mr-1" />
      </div>
      <div
        className="overflow-hidden rounded-[32px]"
        style={{ background: "var(--bg2)", minHeight: 580 }}
      >
        {children}
      </div>
    </div>
  );
}

function PreviewDiscover() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <Logo size={20} />
        <span className="font-mono text-[8px] text-text3 tracking-[0.2em]">0x1A…3C4D</span>
      </div>
      <div className="mt-6">
        <div className="font-mono text-[9px] text-primary tracking-[0.3em]">// PICK A SUBJECT</div>
        <h3 className="mt-2 font-display text-[22px] leading-tight">Where shall we begin?</h3>
      </div>
      <div className="mt-5 space-y-2.5">
        {[
          { e: "⛓️", n: "Crypto & Web3", live: true },
          { e: "🏦", n: "Finance & Banking", live: false },
          { e: "💰", n: "Personal Finance", live: false },
          { e: "🤖", n: "Artificial Intelligence", live: false },
          { e: "🕊️", n: "Philosophy & Ethics", live: false },
        ].map((s) => (
          <div
            key={s.n}
            className="flex items-center gap-3 rounded-xl border px-3 py-2.5"
            style={{
              background: "var(--surface)",
              borderColor: s.live ? "rgba(167,139,250,0.3)" : "var(--border)",
            }}
          >
            <span className="text-[18px]">{s.e}</span>
            <span className="flex-1 font-display text-[12px] font-bold">{s.n}</span>
            <span
              className="font-mono text-[7px] tracking-[0.2em] uppercase rounded-full px-1.5 py-0.5"
              style={
                s.live
                  ? { background: "rgba(167,139,250,0.15)", color: "var(--primary)" }
                  : { color: "var(--text3)" }
              }
            >
              {s.live ? "Live" : "Soon"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewConversation() {
  return (
    <div className="flex h-[580px] flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span>⛓️</span>
          <span className="font-display text-[12px] font-bold">Crypto & Web3</span>
        </div>
        <span className="font-mono text-[8px] text-primary tracking-[0.2em]">2 EARNED</span>
      </div>
      <div className="flex-1 space-y-3 overflow-hidden p-4">
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border px-3 py-2" style={{ background: "var(--surface)" }}>
          <p className="font-sans text-[11px] leading-relaxed">
            If you lose your private key, what actually happens to your coins?
          </p>
        </div>
        <div className="ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 gradient-bg text-[#04050a]">
          <p className="font-sans text-[11px] leading-relaxed">
            They're still there — but no one can move them. It's like a vault with no door.
          </p>
        </div>
        <div className="max-w-[80%] rounded-2xl rounded-tl-sm border border-border px-3 py-2" style={{ background: "var(--surface)" }}>
          <p className="font-sans text-[11px] leading-relaxed">
            That analogy is yours, and it's exactly right. Why does that change how we think about banks?
          </p>
        </div>
        <div className="rounded-xl border px-3 py-2.5" style={{ background: "rgba(167,139,250,0.06)", borderColor: "rgba(167,139,250,0.3)" }}>
          <div className="flex items-center gap-1.5">
            <Sparkles size={10} className="text-gold" />
            <span className="font-mono text-[8px] text-gold tracking-[0.2em] uppercase">Credential minted</span>
          </div>
          <p className="mt-1 font-display text-[11px] font-bold">Self-Custody</p>
        </div>
      </div>
      <div className="border-t border-border p-2.5">
        <div className="flex items-center gap-2 rounded-xl border border-border px-3 py-2" style={{ background: "var(--surface)" }}>
          <span className="flex-1 font-mono text-[9px] italic text-text3">Type your thoughts...</span>
          <span className="h-7 w-7 rounded-lg gradient-bg" />
        </div>
      </div>
    </div>
  );
}

function PreviewCredentials() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px] font-black">Credentials</h3>
        <span className="font-mono text-[9px] text-primary tracking-[0.2em]">3 EARNED</span>
      </div>
      <div className="mt-4 flex items-center gap-2 border-b border-border pb-2">
        <span>⛓️</span>
        <span className="font-display text-[12px] font-bold">Crypto & Web3</span>
      </div>
      <div className="mt-3 space-y-2.5">
        {[
          { n: "Wallet Ownership", e: "A vault with no door — you alone hold the key." },
          { n: "Self-Custody", e: "Banks hold your trust. Wallets hold your truth." },
          { n: "Transaction Mechanics", e: "Every block is a quiet signature of consensus." },
        ].map((c) => (
          <div key={c.n} className="rounded-xl border p-3" style={{ background: "var(--surface)", borderColor: "rgba(167,139,250,0.25)" }}>
            <div className="flex items-center justify-between">
              <span className="font-display text-[12px] font-bold">{c.n}</span>
              <span className="font-mono text-[7px] tracking-[0.15em] uppercase text-green">Verified</span>
            </div>
            <p className="mt-1.5 border-l-2 pl-2 font-sans text-[10px] italic text-text2" style={{ borderColor: "var(--primary)" }}>
              {c.e}
            </p>
            <p className="mt-1.5 font-mono text-[8px] text-gold tracking-[0.1em]">✦ A clear, original analogy.</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PreviewProfile() {
  return (
    <div className="p-5">
      <div
        className="mx-auto mt-4 flex h-14 w-14 items-center justify-center rounded-full gradient-bg font-display text-[18px] font-black text-[#04050a]"
        style={{ boxShadow: "0 0 24px rgba(167,139,250,0.3)" }}
      >
        SK
      </div>
      <h3 className="mt-3 text-center font-display text-[16px] font-black">socrates.eth</h3>
      <div className="text-center font-mono text-[8px] text-text3 mt-1">0x1A2B…3C4D</div>
      <div className="mt-5 flex justify-center gap-6 border-y border-border py-4">
        {[
          { n: 3, l: "Credentials" },
          { n: 1, l: "Subjects" },
          { n: 24, l: "Exchanges" },
        ].map((s) => (
          <div key={s.l} className="text-center">
            <div className="font-display text-[18px] font-black text-primary">{s.n}</div>
            <div className="mt-0.5 font-mono text-[7px] text-text3 tracking-[0.15em] uppercase">{s.l}</div>
          </div>
        ))}
      </div>
      <div className="mt-4 font-mono text-[8px] text-text3 tracking-[0.2em] uppercase">Active Subjects</div>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-border px-3 py-2" style={{ background: "var(--surface)" }}>
        <div className="flex items-center gap-2">
          <span>⛓️</span>
          <span className="font-display text-[11px] font-bold">Crypto & Web3</span>
        </div>
        <span className="font-mono text-[8px] text-text3">3 / 7</span>
      </div>
    </div>
  );
}

const PREVIEWS: Record<TabKey, ReactNode> = {
  discover: <PreviewDiscover />,
  conversation: <PreviewConversation />,
  credentials: <PreviewCredentials />,
  profile: <PreviewProfile />,
};

export function Experience() {
  const [active, setActive] = useState<TabKey>("discover");
  const t = TABS.find((x) => x.key === active)!;
  return (
    <section id="app" className="px-6 md:px-16 py-28">
      <div className="max-w-[1200px] mx-auto">
        <div className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-5">
          // THE EXPERIENCE
        </div>
        <h2 className="font-display font-black" style={{ fontSize: "clamp(36px,5vw,64px)", letterSpacing: "-0.03em" }}>
          Four screens. One conversation.
        </h2>
        <p className="mt-6 max-w-[560px] font-sans text-[16px] font-light text-text2" style={{ lineHeight: 1.7 }}>
          Everything happens in the conversation. The rest exists to show you what you have earned.
        </p>

        <div className="mt-10 flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const isActive = tab.key === active;
            return (
              <button
                key={tab.key}
                onClick={() => setActive(tab.key)}
                className="flex items-center gap-2 rounded-full border px-5 py-2 font-sans text-[13px] transition-all"
                style={{
                  background: isActive ? "rgba(167,139,250,0.1)" : "var(--surface)",
                  borderColor: isActive ? "var(--primary)" : "var(--border)",
                  color: isActive ? "var(--primary)" : "var(--text2)",
                }}
              >
                {TAB_ICONS[tab.key]}
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="mt-12 grid gap-16 md:grid-cols-[340px_1fr] items-center">
          <PhoneFrame>{PREVIEWS[active]}</PhoneFrame>
          <div>
            <h3 className="font-display font-black" style={{ fontSize: "clamp(24px,3vw,40px)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              {t.title}
            </h3>
            <p className="mt-5 font-sans text-[15px] font-light text-text2" style={{ lineHeight: 1.7 }}>
              {t.desc}
            </p>
            <div className="mt-8 space-y-5">
              {t.features.map((f) => (
                <div key={f.h} className="flex gap-4">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                    style={{ background: "rgba(167,139,250,0.08)" }}
                  >
                    <Sparkles size={14} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-[14px]">{f.h}</h4>
                    <p className="mt-1 font-sans text-[12px] text-text2">{f.p}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
