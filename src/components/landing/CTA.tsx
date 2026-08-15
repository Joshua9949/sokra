import { ConnectButton } from "@/components/ConnectButton";

export function CTA({ onNew }: { onNew?: () => void }) {
  return (
    <section className="relative overflow-hidden px-6 md:px-16 py-36 text-center">
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 900,
          height: 600,
          background: "radial-gradient(ellipse, rgba(167,139,250,0.06), transparent 60%)",
        }}
      />
      <div className="relative z-10 max-w-[800px] mx-auto">
        <div className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-5">// BEGIN</div>
        <h2
          className="font-display font-black"
          style={{ fontSize: "clamp(40px,6vw,80px)", letterSpacing: "-0.03em", lineHeight: 1 }}
        >
          A new era of learning starts with one{" "}
          <em className="gradient-text" style={{ fontStyle: "italic" }}>
            conversation.
          </em>
        </h2>
        <p className="mt-7 max-w-[480px] mx-auto font-sans text-[17px] font-light text-text2" style={{ lineHeight: 1.7 }}>
          Connect your wallet. Sokra opens with a question. The rest is between you and the most intelligent teacher on any blockchain.
        </p>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3.5">
          <ConnectButton onNew={onNew}>Connect Wallet</ConnectButton>
          <a
            href="https://docs.genlayer.com"
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-border2 px-9 py-4 font-sans text-[15px] text-text2 hover:text-text hover:border-primary transition-all"
          >
            Read the docs
          </a>
        </div>
      </div>
    </section>
  );
}
