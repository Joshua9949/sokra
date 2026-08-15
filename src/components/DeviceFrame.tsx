import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile-first device frame. Children fill the full viewport height; the
 * page itself decides how to lay out and where to scroll. The bottom nav
 * is rendered as a sibling that sits above the content via padding-bottom.
 */
export function DeviceFrame({
  children,
  hideNav = false,
  scroll = true,
}: {
  children: ReactNode;
  hideNav?: boolean;
  /** Set false for screens that handle their own scroll (e.g. chat). */
  scroll?: boolean;
}) {
  return (
    <div className="min-h-screen flex items-stretch justify-center" style={{ background: "var(--bg)" }}>
      <div
        className="relative w-full mx-auto overflow-hidden"
        style={{
          maxWidth: 430,
          height: "100dvh",
          background: "var(--bg2)",
        }}
      >
        <div
          className={`relative h-full w-full ${scroll ? "overflow-y-auto" : "overflow-hidden flex flex-col"}`}
          style={{ paddingBottom: hideNav ? 0 : 64 }}
        >
          {children}
        </div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
