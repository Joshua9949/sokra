const PANELS = [
  { n: "01", e: "🔗", h: "Wallet Identity", p: "Sign a message on GenLayer. Proves ownership. Creates your onchain identity. The signature is also your first teaching moment.", tag: "GENLAYER" },
  { n: "02", e: "🧠", h: "Every Message Processed", p: "Every exchange is reasoned about by the GenLayer intelligent contract. Full conversation history. Live understanding model. Onchain.", tag: "GENLAYER" },
  { n: "03", e: "🌐", h: "Live Data Fetching", p: "For DeFi, finance, climate, and more — the contract fetches live real world data mid-conversation via GenLayer web access.", tag: "GENLAYER" },
  { n: "04", e: "⚖️", h: "Optimistic Consensus", p: "Every credential decision is verified by the GenLayer validator network. Not one contract's judgment — distributed intelligent consensus.", tag: "GENLAYER" },
  { n: "05", e: "🏅", h: "Autonomous Credential Mint", p: "No button pressed. The contract decides mid-conversation. Soulbound token minted to your wallet with conversation excerpt as metadata.", tag: "GENLAYER" },
  { n: "06", e: "📖", h: "Conversation State", p: "Full conversation history stored onchain. Immutable. When you return Sokra reads it and continues from exactly where you left off.", tag: "GENLAYER" },
];

export function Onchain() {
  return (
    <section id="onchain" className="border-t border-border" style={{ background: "var(--bg2)" }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-28">
        <div className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-5">
          // WHAT HAPPENS ONCHAIN
        </div>
        <h2 className="font-display font-black" style={{ fontSize: "clamp(36px,5vw,64px)", letterSpacing: "-0.03em" }}>
          GenLayer does everything that matters.
        </h2>
        <p className="mt-6 max-w-[560px] font-sans text-[16px] font-light text-text2" style={{ lineHeight: 1.7 }}>
          Supabase handles speed. GenLayer handles truth. Every meaningful event in Sokra is onchain, verifiable, and permanent.
        </p>

        <div className="mt-14 flex flex-col gap-[2px] md:flex-row">
          {PANELS.map((p, i) => (
            <div
              key={p.n}
              className="reveal flex-1 border border-border bg-surface p-7 transition-all hover:bg-surface2 hover:z-10 relative"
              style={{
                borderTopLeftRadius: i === 0 ? 16 : 0,
                borderBottomLeftRadius: i === 0 ? 16 : 0,
                borderTopRightRadius: i === PANELS.length - 1 ? 16 : 0,
                borderBottomRightRadius: i === PANELS.length - 1 ? 16 : 0,
              }}
            >
              <div className="font-mono text-[10px] text-text3 mb-3.5 tracking-[0.2em]">{p.n}</div>
              <div className="text-[28px] mb-3.5 leading-none">{p.e}</div>
              <h3 className="font-display font-bold text-[15px] mb-2">{p.h}</h3>
              <p className="font-sans text-[12px] text-text2" style={{ lineHeight: 1.6 }}>
                {p.p}
              </p>
              <span
                className="mt-3 inline-block rounded-full border px-2.5 py-[3px] font-mono text-[8px] tracking-[0.2em]"
                style={{
                  background: "rgba(167,139,250,0.1)",
                  color: "var(--primary)",
                  borderColor: "rgba(167,139,250,0.2)",
                }}
              >
                {p.tag}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
