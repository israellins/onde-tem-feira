import type { ReactNode } from "react";

const STYLES = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-amber-200 bg-amber-50 text-amber-900",
} as const;

export function Alert({ kind, children }: { kind: keyof typeof STYLES; children: ReactNode }) {
  return (
    <p
      role={kind === "error" ? "alert" : "status"}
      className={`rounded-xl border px-3 py-2 text-sm ${STYLES[kind]}`}
    >
      {children}
    </p>
  );
}
