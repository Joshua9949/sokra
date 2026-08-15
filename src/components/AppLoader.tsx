import { useEffect, useState } from "react";

export function AppLoader() {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setSlow(true), 8000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="gradient-text animate-breathe font-display font-black" style={{ fontSize: 32 }}>
        Sokra
      </div>
      {slow && (
        <div className="mt-6 text-center">
          <p className="font-sans text-[13px] text-text3">Taking a moment…</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-1 font-mono text-[10px] text-primary tracking-[0.15em]"
          >
            REFRESH
          </button>
        </div>
      )}
    </div>
  );
}
