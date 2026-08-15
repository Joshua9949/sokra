const LINES = [
  { text: "It reads what you write.", em: "reads" },
  { text: "It reasons about what you understand.", em: "reasons" },
  { text: "It decides when you have earned it.", em: "decides" },
  { text: "No quiz. No lesson. Just intelligence.", em: "intelligence" },
];

export function Statements() {
  return (
    <section className="max-w-[900px] mx-auto px-6 md:px-16 py-24">
      {LINES.map((l, i) => (
        <div
          key={i}
          className="reveal text-center py-8 border-b border-border font-display font-bold"
          style={{ fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-0.03em", lineHeight: 1.2 }}
        >
          {l.text.split(l.em).map((part, idx, arr) =>
            idx < arr.length - 1 ? (
              <span key={idx}>
                {part}
                <em className="gradient-text" style={{ fontStyle: "italic" }}>
                  {l.em}
                </em>
              </span>
            ) : (
              <span key={idx}>{part}</span>
            )
          )}
        </div>
      ))}
    </section>
  );
}
