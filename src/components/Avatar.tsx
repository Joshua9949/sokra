import type { ReactNode } from "react";
import { walletGradient, walletInitials } from "@/lib/wallet";

export function Avatar({
  wallet,
  username,
  size = 36,
  className = "",
  children,
}: {
  wallet: string;
  username?: string | null;
  size?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-full font-display font-black text-white ${className}`}
      style={{
        width: size,
        height: size,
        background: walletGradient(wallet),
        fontSize: size * 0.36,
        boxShadow: `0 0 ${size * 0.5}px hsl(0 0% 0% / 0.3)`,
      }}
    >
      {children ?? walletInitials(wallet, username)}
    </div>
  );
}
