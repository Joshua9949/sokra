import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

const WALLET_KEY = "sokra:wallet";

export type SokraUser = {
  id: string;
  wallet_address: string;
  username: string | null;
  onboarding_complete: boolean;
  first_credential_earned: boolean;
  lesson_zero_seen: boolean;
  onboarding_overlay_seen: boolean;
};

type Ctx = {
  wallet: string | null;
  user: SokraUser | null;
  loading: boolean;
  connect: () => Promise<{ isNew: boolean } | null>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  setUsername: (username: string) => Promise<void>;
  completeOnboarding: () => Promise<void>;
  markLessonZeroSeen: () => Promise<void>;
  markOverlaySeen: () => Promise<void>;
};

const WalletCtx = createContext<Ctx>({
  wallet: null,
  user: null,
  loading: true,
  connect: async () => null,
  disconnect: () => {},
  refresh: async () => {},
  setUsername: async () => {},
  completeOnboarding: async () => {},
  markLessonZeroSeen: async () => {},
  markOverlaySeen: async () => {},
});

declare global {
  interface Window {
    ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> };
  }
}

async function requestWalletAddress(): Promise<string> {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      if (accounts?.[0]) return accounts[0].toLowerCase();
    } catch {
      // user rejected — fall through to demo wallet
    }
  }
  // Demo / fallback wallet (deterministic per browser)
  let demo = localStorage.getItem("sokra:demo-wallet");
  if (!demo) {
    const bytes = new Uint8Array(20);
    crypto.getRandomValues(bytes);
    demo = "0x" + Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("sokra:demo-wallet", demo);
  }
  return demo;
}

async function loadOrCreateUser(wallet: string): Promise<{ user: SokraUser; isNew: boolean }> {
  const { data: existing } = await supabase
    .from("sokra_users")
    .select("id, wallet_address, username, onboarding_complete, first_credential_earned, lesson_zero_seen, onboarding_overlay_seen")
    .eq("wallet_address", wallet)
    .maybeSingle();

  if (existing) return { user: existing as SokraUser, isNew: !existing.onboarding_complete };

  const { data: created, error } = await supabase
    .from("sokra_users")
    .insert({ wallet_address: wallet })
    .select("id, wallet_address, username, onboarding_complete, first_credential_earned, lesson_zero_seen, onboarding_overlay_seen")
    .single();
  if (error) throw error;
  return { user: created as SokraUser, isNew: true };
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const [user, setUser] = useState<SokraUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(WALLET_KEY);
    if (!saved) {
      setLoading(false);
      return;
    }
    setWallet(saved);
    loadOrCreateUser(saved)
      .then(({ user }) => setUser(user))
      .finally(() => setLoading(false));
  }, []);

  const connect = async () => {
    setLoading(true);
    try {
      const addr = await requestWalletAddress();
      localStorage.setItem(WALLET_KEY, addr);
      setWallet(addr);
      const { user, isNew } = await loadOrCreateUser(addr);
      setUser(user);
      return { isNew };
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    localStorage.removeItem(WALLET_KEY);
    setWallet(null);
    setUser(null);
  };

  const refresh = async () => {
    if (!wallet) return;
    const { user } = await loadOrCreateUser(wallet);
    setUser(user);
  };

  const setUsername = async (username: string) => {
    if (!wallet) return;
    await supabase
      .from("sokra_users")
      .update({ username, updated_at: new Date().toISOString() })
      .eq("wallet_address", wallet);
    await refresh();
  };

  const completeOnboarding = async () => {
    if (!wallet) return;
    await supabase
      .from("sokra_users")
      .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
      .eq("wallet_address", wallet);
    await refresh();
  };

  const markFlag = async (column: "lesson_zero_seen" | "onboarding_overlay_seen") => {
    if (!wallet) return;
    setUser((u) => (u ? { ...u, [column]: true } : u));
    const patch =
      column === "lesson_zero_seen"
        ? { lesson_zero_seen: true, updated_at: new Date().toISOString() }
        : { onboarding_overlay_seen: true, updated_at: new Date().toISOString() };
    await supabase.from("sokra_users").update(patch).eq("wallet_address", wallet);
  };


  const markLessonZeroSeen = () => markFlag("lesson_zero_seen");
  const markOverlaySeen = () => markFlag("onboarding_overlay_seen");

  return (
    <WalletCtx.Provider
      value={{
        wallet,
        user,
        loading,
        connect,
        disconnect,
        refresh,
        setUsername,
        completeOnboarding,
        markLessonZeroSeen,
        markOverlaySeen,
      }}
    >
      {children}
    </WalletCtx.Provider>
  );
}

export const useWallet = () => useContext(WalletCtx);

export function truncateWallet(addr: string) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// Deterministic gradient avatar colors derived from wallet address
export function walletGradient(addr: string) {
  const hex = addr.replace(/^0x/, "") || "0";
  const h1 = parseInt(hex.slice(0, 4) || "0", 16) % 360;
  const h2 = (h1 + 60 + (parseInt(hex.slice(4, 8) || "0", 16) % 120)) % 360;
  return `linear-gradient(135deg, hsl(${h1} 80% 60%), hsl(${h2} 80% 55%))`;
}

export function walletInitials(addr: string, username?: string | null) {
  if (username && username.trim()) return username.trim().slice(0, 2).toUpperCase();
  const hex = addr.replace(/^0x/, "");
  return hex.slice(0, 2).toUpperCase();
}
