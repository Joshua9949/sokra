import { useNavigate } from "@tanstack/react-router";
import { useWallet } from "@/lib/wallet";

export function ConnectButton({
  className,
  children = "Connect Wallet",
  variant = "primary",
  onNew,
}: {
  className?: string;
  children?: React.ReactNode;
  variant?: "primary" | "ghost";
  onNew?: () => void;
}) {
  const { connect } = useWallet();
  const navigate = useNavigate();

  const onClick = async () => {
    const res = await connect();
    if (!res) return;
    if (res.isNew) {
      onNew?.();
    } else {
      navigate({ to: "/discover" });
    }
  };

  if (variant === "primary") {
    return (
      <button
        onClick={onClick}
        className={
          className ??
          "rounded-full px-9 py-4 font-display font-bold text-[16px] gradient-bg text-[#04050a] transition-all hover:-translate-y-0.5"
        }
        style={{ boxShadow: "0 16px 48px rgba(167,139,250,0.25)" }}
      >
        {children}
      </button>
    );
  }
  return (
    <button
      onClick={onClick}
      className={
        className ??
        "rounded-full border border-border2 px-9 py-4 font-sans text-[15px] text-text2 hover:text-text hover:border-primary transition-all"
      }
    >
      {children}
    </button>
  );
}
