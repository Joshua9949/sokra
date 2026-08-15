import { Link, useLocation } from "@tanstack/react-router";
import { Compass, MessageCircle, Award, User } from "lucide-react";

const TABS = [
  { to: "/discover", label: "Discover", Icon: Compass },
  { to: "/conversation", label: "Conversation", Icon: MessageCircle },
  { to: "/credentials", label: "Credentials", Icon: Award },
  { to: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const { pathname } = useLocation();
  return (
    <nav
      className="absolute bottom-0 left-0 right-0 flex justify-around border-t px-3 py-3"
      style={{ background: "var(--bg3)", borderColor: "var(--border)" }}
    >
      {TABS.map(({ to, label, Icon }) => {
        const active = pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            data-tour={`nav-${label.toLowerCase()}`}
            className="flex flex-1 flex-col items-center gap-1.5 transition-colors relative"
            style={{ color: active ? "var(--primary)" : "var(--text2)" }}
          >
            {active && (
              <span
                aria-hidden
                className="absolute -top-3 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full"
                style={{ background: "var(--primary)" }}
              />
            )}
            <Icon size={18} strokeWidth={active ? 2.2 : 1.6} />
            <span
              className="font-mono uppercase"
              style={{ fontSize: 8, letterSpacing: "0.15em" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
