import { forwardRef } from "react";
import { truncateWallet } from "@/lib/wallet";

export type ShareCred = {
  name: string;
  subject: string;
  insight: string;
  token_id: string | null;
  quality_descriptor?: string | null;
  earned_at: string;
};

export const ShareableCard = forwardRef<
  HTMLDivElement,
  { cred: ShareCred; wallet: string; subjectName: string }
>(function ShareableCard({ cred, wallet, subjectName }, ref) {
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        left: -9999,
        top: 0,
        width: 600,
        background: "linear-gradient(135deg,#0c0d18,#070810)",
        borderRadius: 24,
        padding: 40,
      }}
    >
      <div
        className="font-display"
        style={{ fontWeight: 900, fontSize: 24, color: "#a78bfa" }}
      >
        Sokra <span style={{ color: "#f59e0b" }}>•</span>
      </div>

      <div
        className="font-mono"
        style={{
          fontSize: 11,
          color: "#a78bfa",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          marginTop: 32,
        }}
      >
        {subjectName}
      </div>

      <div
        className="font-display"
        style={{
          fontWeight: 900,
          fontSize: 36,
          color: "#f1f0ff",
          letterSpacing: "-0.03em",
          marginTop: 8,
          lineHeight: 1.1,
        }}
      >
        {cred.name}
      </div>

      {cred.quality_descriptor && (
        <div
          className="font-mono"
          style={{
            display: "inline-block",
            fontSize: 9,
            color: "#c4b5fd",
            background: "rgba(167,139,250,0.15)",
            borderRadius: 100,
            padding: "4px 14px",
            marginTop: 12,
          }}
        >
          {cred.quality_descriptor}
        </div>
      )}

      <div style={{ height: 1, background: "rgba(180,160,255,0.15)", margin: "24px 0" }} />

      <div
        className="font-display"
        style={{ fontStyle: "italic", fontSize: 15, color: "#9ca3af", lineHeight: 1.7, maxWidth: 480 }}
      >
        <span style={{ color: "#f59e0b" }}>✦</span> {cred.insight}
      </div>

      <div style={{ height: 1, background: "rgba(180,160,255,0.15)", margin: "24px 0" }} />

      <div className="font-mono" style={{ fontSize: 10, color: "#4b5563", letterSpacing: "0.1em" }}>
        {truncateWallet(wallet)}
      </div>
      <div className="font-mono" style={{ fontSize: 9, color: "#4b5563", marginTop: 4 }}>
        {new Date(cred.earned_at).toLocaleDateString()}
      </div>
      <div className="font-mono" style={{ fontSize: 8, color: "#4b5563", marginTop: 4 }}>
        sokra.app/verify/{cred.token_id ?? "—"}
      </div>
      <div
        className="font-mono"
        style={{ fontSize: 8, color: "#4b5563", letterSpacing: "0.2em", marginTop: 24 }}
      >
        ⚡ VERIFIED BY GENLAYER INTELLIGENT CONTRACT
      </div>
    </div>
  );
});
