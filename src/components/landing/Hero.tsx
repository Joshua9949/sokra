import { ConnectButton } from "@/components/ConnectButton";

export function Hero({ onNew }: { onNew?: () => void }) {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 md:px-16 pt-36 pb-24 overflow-hidden hero-grid-bg">
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[60%]"
        style={{
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(167,139,250,0.07), transparent 60%)",
        }}
      />
      <div
        className="pointer-events-none absolute right-[10%] bottom-0"
        style={{
          width: 400,
          height: 400,
          background: "radial-gradient(circle, rgba(245,158,11,0.05), transparent 60%)",
        }}
      />

      <div
        className="relative z-10 inline-flex items-center gap-2 rounded-full border border-border2 px-[18px] py-[7px] mb-10"
        style={{ background: "rgba(167,139,250,0.05)" }}
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-gold animate-breathe" />
        <span className="font-mono text-[11px] text-primary tracking-[0.2em] uppercase">
          Powered by GenLayer Intelligent Contracts
        </span>
      </div>

      <h1
        className="relative z-10 font-display font-black max-w-[1000px]"
        style={{ fontSize: "clamp(52px, 8vw, 110px)", letterSpacing: "-0.04em", lineHeight: 0.95 }}
      >
        The teacher
        <br />
        that lives <em className="gradient-text not-italic" style={{ fontStyle: "italic" }}>onchain.</em>
      </h1>

      <p className="relative z-10 mt-8 max-w-[520px] font-sans text-[17px] font-light text-text2" style={{ lineHeight: 1.8 }}>
        Sokra teaches through conversation. No quizzes. No lessons. Just understanding — verified by GenLayer and issued to your wallet when you are ready.
      </p>

      <div className="relative z-10 mt-12 flex flex-wrap items-center justify-center gap-3.5">
        <ConnectButton onNew={onNew}>Begin the conversation</ConnectButton>
        <button
          onClick={() => document.getElementById("app")?.scrollIntoView({ behavior: "smooth" })}
          className="rounded-full border border-border2 px-9 py-4 font-sans text-[15px] text-text2 hover:text-text hover:border-primary transition-all"
        >
          See how it works
        </button>
      </div>

      <div className="relative z-10 mt-20 pt-12 border-t border-border max-w-[600px] mx-auto">
        <span
          aria-hidden
          className="absolute -top-2 left-0 font-display text-primary"
          style={{ fontSize: 80, opacity: 0.2, lineHeight: 1 }}
        >
          “
        </span>
        <p className="font-display italic text-[18px] text-text2" style={{ lineHeight: 1.7 }}>
          I cannot teach anybody anything. I can only make them think.
        </p>
        <div className="mt-4 font-mono text-[11px] text-primary tracking-[0.2em]">— SOCRATES, 470 BC</div>
      </div>
    </section>
  );
}
