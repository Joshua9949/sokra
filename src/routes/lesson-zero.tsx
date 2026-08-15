import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { useWallet } from "@/lib/wallet";
import { AppLoader } from "@/components/AppLoader";

export const Route = createFileRoute("/lesson-zero")({
  head: () => ({
    meta: [
      { title: "Lesson Zero — Sokra" },
      {
        name: "description",
        content: "Before you can understand a blockchain that thinks, you need to understand everything that came before it.",
      },
      { property: "og:title", content: "Lesson Zero — Sokra" },
      { property: "og:description", content: "Your journey with the onchain intelligent teacher starts here." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LessonZero,
});

const LINES: { text: string; delay: number; className: string; style?: React.CSSProperties }[] = [
  { text: "A new kind of blockchain is being built.", delay: 1000, className: "font-display font-bold" },
  { text: "One that can think.", delay: 2200, className: "font-display font-bold gradient-text" },
  { text: "Before you can understand it,", delay: 3400, className: "font-display font-bold", style: { color: "var(--text2)" } },
  {
    text: "you need to understand everything that came before it.",
    delay: 4200,
    className: "font-display font-bold",
    style: { color: "var(--text2)" },
  },
];

function LessonZero() {
  const navigate = useNavigate();
  const { wallet, user, loading, markLessonZeroSeen } = useWallet();
  const [leaving, setLeaving] = useState(false);

  const go = () => {
    if (leaving) return;
    setLeaving(true);
    void markLessonZeroSeen();
    setTimeout(() => navigate({ to: "/discover" }), 500);
  };

  useEffect(() => {
    if (!loading && !wallet) navigate({ to: "/" });
  }, [loading, wallet, navigate]);

  useEffect(() => {
    if (user?.lesson_zero_seen) navigate({ to: "/discover" });
  }, [user?.lesson_zero_seen, navigate]);

  // Safety net — never leave anyone stranded on the cinematic.
  useEffect(() => {
    const t = setTimeout(() => go(), 15000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading || !wallet) return <AppLoader />;

  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-10 py-16 text-center transition-opacity duration-500"
      style={{ background: "var(--bg)", opacity: leaving ? 0 : 1 }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2"
        style={{
          width: 600,
          height: 600,
          filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(167,139,250,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0"
        style={{
          width: 400,
          height: 400,
          filter: "blur(60px)",
          background: "radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="relative flex flex-col items-center gap-6" style={{ maxWidth: 620 }}>
        <div className="animate-line-in" style={{ animationDelay: "0ms" }}>
          <Logo size={28} />
        </div>

        {LINES.map((l) => (
          <h2
            key={l.text}
            className={`animate-line-in ${l.className}`}
            style={{
              animationDelay: `${l.delay}ms`,
              fontSize: "clamp(20px, 3vw, 32px)",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
              ...l.style,
            }}
          >
            {l.text}
          </h2>
        ))}

        <h1
          className="animate-line-in gradient-text font-display font-black italic"
          style={{
            animationDelay: "5200ms",
            fontSize: "clamp(24px, 4vw, 40px)",
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Your journey starts here.
        </h1>

        <button
          onClick={go}
          className="animate-line-in press-btn mt-6 w-full rounded-full gradient-bg px-10 py-4 font-display font-bold text-[16px] text-[#04050a] transition-all hover:-translate-y-0.5"
          style={{ animationDelay: "6400ms", maxWidth: 300, boxShadow: "0 12px 32px rgba(167,139,250,0.3)" }}
        >
          Begin your journey
        </button>
      </div>
    </main>
  );
}
