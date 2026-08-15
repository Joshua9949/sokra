import { SUBJECTS } from "@/lib/subjects";

export function Subjects() {
  return (
    <section id="subjects" className="border-y border-border" style={{ background: "var(--bg2)" }}>
      <div className="max-w-[1200px] mx-auto px-6 md:px-16 py-28">
        <div className="font-mono text-[10px] text-primary tracking-[0.4em] uppercase mb-5">
          // THIRTEEN SUBJECTS
        </div>
        <h2 className="font-display font-black" style={{ fontSize: "clamp(36px,5vw,64px)", letterSpacing: "-0.03em" }}>
          One teacher. Every subject.
        </h2>
        <p className="mt-6 max-w-[500px] font-sans text-[16px] font-light text-text2" style={{ lineHeight: 1.7 }}>
          Pick a subject. Sokra opens a conversation. When it decides you understand something, a credential mints to your wallet. No test required.
        </p>

        <div
          className="mt-14 grid gap-3"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}
        >
          {SUBJECTS.map((s) => (
            <div
              key={s.id}
              className="reveal group rounded-2xl border p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                background: s.flagship
                  ? "linear-gradient(135deg, rgba(167,139,250,0.06), rgba(245,158,11,0.03))"
                  : "var(--surface)",
                borderColor: s.flagship ? "rgba(167,139,250,0.3)" : "var(--border)",
                gridColumn: s.wide ? "span 2" : undefined,
              }}
            >
              <div className="text-[28px] mb-3.5 leading-none">{s.emoji}</div>
              <h3 className="font-display font-bold text-[15px]" style={{ letterSpacing: "-0.01em" }}>
                {s.name}
              </h3>
              <p className="mt-1.5 font-sans text-[12px] text-text2" style={{ lineHeight: 1.5 }}>
                {s.desc}
              </p>
              <span
                className="mt-3 inline-block rounded-full px-2.5 py-[3px] font-mono text-[9px] tracking-[0.15em] uppercase border"
                style={
                  s.live
                    ? {
                        background: "rgba(167,139,250,0.12)",
                        color: "var(--primary)",
                        borderColor: "rgba(167,139,250,0.2)",
                      }
                    : {
                        background: "rgba(75,85,99,0.2)",
                        color: "var(--text3)",
                        borderColor: "var(--border)",
                      }
                }
              >
                {s.live ? "Live Now" : "Coming Soon"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
