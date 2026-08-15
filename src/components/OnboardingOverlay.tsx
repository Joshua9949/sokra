import { useEffect, useState } from "react";

const STEPS = [
  {
    selector: '[data-tour="subjects"]',
    text: "Pick any subject. Sokra opens a conversation and teaches through questions — no lessons, no quizzes.",
    button: "Next →",
    below: true,
  },
  {
    selector: '[data-tour="nav-credentials"]',
    text: "When Sokra decides you understand something, a credential mints to your wallet. They appear here.",
    button: "Next →",
    below: false,
  },
  {
    selector: '[data-tour="nav-profile"]',
    text: "Your credentials and conversation history live on your profile. It is your onchain knowledge record.",
    button: "Got it ✓",
    below: false,
  },
];

type Rect = { top: number; left: number; width: number; height: number };

export function OnboardingOverlay({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector(STEPS[step].selector);
      if (!el) return setRect(null);
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [step]);

  const finish = () => {
    setClosing(true);
    setTimeout(onDone, 300);
  };

  const next = () => (step === STEPS.length - 1 ? finish() : setStep((s) => s + 1));

  const s = STEPS[step];

  return (
    <div
      className="fixed inset-0 transition-opacity duration-300"
      style={{ zIndex: 300, opacity: closing ? 0 : 1 }}
      onClick={finish}
    >
      <div className="absolute inset-0" style={{ background: rect ? "transparent" : "rgba(4,5,10,0.85)" }} />
      {rect && (
        <div
          className="absolute rounded-xl transition-all duration-400"
          style={{
            top: rect.top - 6,
            left: rect.left - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            boxShadow: "0 0 0 9999px rgba(4,5,10,0.85)",
            border: "1px solid rgba(167,139,250,0.4)",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        className="absolute transition-all duration-300"
        style={{
          maxWidth: 260,
          left: rect ? Math.max(16, Math.min(rect.left, window.innerWidth - 276)) : 16,
          top: rect
            ? s.below
              ? rect.top + rect.height + 16
              : Math.max(16, rect.top - 150)
            : 120,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="rounded-[14px] border p-4"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          <div className="font-mono text-[8px] text-text3 tracking-[0.2em] mb-2">
            STEP {step + 1} OF {STEPS.length}
          </div>
          <p className="font-sans text-[14px] text-text" style={{ lineHeight: 1.6 }}>
            {s.text}
          </p>
          <button
            onClick={next}
            className="press-btn mt-4 rounded-full gradient-bg px-5 py-2 font-display font-bold text-[12px] text-[#04050a]"
          >
            {s.button}
          </button>
        </div>
      </div>
    </div>
  );
}
