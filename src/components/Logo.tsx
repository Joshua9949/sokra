export function Logo({ size = 26 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="block rounded-full bg-primary animate-breathe"
        style={{ width: 10, height: 10, boxShadow: "0 0 16px var(--primary)" }}
      />
      <span
        className="font-display font-black gradient-text leading-none"
        style={{ fontSize: size, letterSpacing: "-0.03em" }}
      >
        Sokra
      </span>
    </div>
  );
}
