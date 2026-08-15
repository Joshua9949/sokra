import { Logo } from "@/components/Logo";
import { ConnectButton } from "@/components/ConnectButton";

export function LandingNav({ onNew }: { onNew?: () => void }) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };
  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 border-b border-border"
      style={{
        background: "color-mix(in oklab, var(--bg) 80%, transparent)",
        backdropFilter: "blur(24px)",
      }}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-6 md:px-16 py-5">
        <Logo />
        <nav className="hidden md:flex items-center gap-9">
          {[
            { label: "Subjects", id: "subjects" },
            { label: "The Experience", id: "app" },
            { label: "Onchain", id: "onchain" },
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => scrollTo(l.id)}
              className="font-sans text-[14px] text-text2 hover:text-text transition-colors"
            >
              {l.label}
            </button>
          ))}
        </nav>
        <ConnectButton
          variant="ghost"
          onNew={onNew}
          className="rounded-full border border-border2 px-6 py-2.5 font-sans text-[14px] font-medium text-primary2 hover:bg-primary/10 hover:border-primary transition-all"
        >
          Connect Wallet
        </ConnectButton>
      </div>
    </header>
  );
}
