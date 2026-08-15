import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 md:px-16 py-10">
      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
        <Logo size={20} />
        <div className="font-mono text-[10px] text-text3 tracking-[0.2em] text-center">
          BUILT ON GENLAYER · INTELLIGENCE ONCHAIN · 2025
        </div>
        <div className="flex gap-5">
          {["GitHub", "GenLayer", "Docs"].map((l) => (
            <a key={l} href="#" className="font-mono text-[10px] text-text3 tracking-[0.15em] hover:text-text2 transition-colors">
              {l}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
