import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { findings, type AutomationDecision } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/findings")({
  component: FindingsPage,
});

type Filter = "All" | AutomationDecision;

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: "All", label: "All cases", icon: "" },
  { key: "AUTO_READY", label: "Auto-send ready", icon: "⚡" },
  { key: "NEEDS_HUMAN_REVIEW", label: "Needs review", icon: "👤" },
  { key: "NOT_WORTH_PURSUING", label: "Not pursuing", icon: "✕" },
];

function FindingsPage() {
  const [filter, setFilter] = useState<Filter>("All");

  const filtered = filter === "All" ? findings : findings.filter((f) => f.automationDecision === filter);

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Financial intelligence findings</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
          {findings.filter(f => f.automationDecision !== "NOT_WORTH_PURSUING").length} recoverable opportunities
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Each case triaged with evidence, confidence score, merchant intelligence, and an autonomous routing decision.
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
        {FILTERS.map((f) => {
          const count = f.key === "All" ? findings.length : findings.filter((x) => x.automationDecision === f.key).length;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-xs font-medium transition-all ${
                filter === f.key
                  ? "bg-primary text-primary-foreground border-primary shadow-soft"
                  : "bg-background/60 border-border hover:border-primary/40 hover:text-primary"
              }`}
            >
              {f.icon && <span>{f.icon}</span>}
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${filter === f.key ? "bg-white/20" : "bg-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
        {/* Header row */}
        <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.6fr_0.7fr_0.6fr_1.1fr_1fr_0.8fr] gap-3 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
          <div>Type / Merchant</div>
          <div>Action</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Recoverable</div>
          <div className="text-right">Conf.</div>
          <div>HITL Decision</div>
          <div>Status</div>
          <div className="text-right">Case</div>
        </div>

        {filtered.map((f) => (
          <div
            key={f.id}
            className={`grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.6fr_0.7fr_0.6fr_1.1fr_1fr_0.8fr] gap-3 px-5 py-4 border-b border-border last:border-0 transition-colors ${
              f.automationDecision === "NOT_WORTH_PURSUING"
                ? "opacity-50 hover:opacity-70"
                : "hover:bg-background/30"
            }`}
          >
            <div>
              <StatusBadge status={f.type} />
              <div className="mt-1.5 font-medium">{f.merchant}</div>
              <div className="text-xs text-muted-foreground">{f.date} · {f.category}</div>
            </div>
            <div className="text-sm text-muted-foreground self-center">{f.action}</div>
            <div className="text-sm md:text-right self-center">£{f.amount.toFixed(2)}</div>
            <div className={`md:text-right self-center font-semibold ${f.recoverable > 0 ? "text-primary" : "text-muted-foreground"}`}>
              {f.recoverable > 0 ? `£${f.recoverable.toFixed(2)}` : "—"}
            </div>
            <div className="md:text-right self-center">
              <div className="inline-flex items-center gap-1.5">
                <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${f.probability >= 80 ? "bg-primary" : f.probability >= 60 ? "bg-warning" : "bg-muted-foreground/40"}`}
                    style={{ width: `${f.probability}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums">{f.probability}%</span>
              </div>
            </div>
            <div className="self-center">
              <StatusBadge status={f.automationDecision} />
            </div>
            <div className="self-center"><StatusBadge status={f.status} /></div>
            <div className="md:text-right self-center">
              {f.automationDecision !== "NOT_WORTH_PURSUING" ? (
                <Link
                  to="/findings/$caseId"
                  params={{ caseId: f.id }}
                  className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
                >
                  View case →
                </Link>
              ) : (
                <span className="text-xs text-muted-foreground/50">No action</span>
              )}
            </div>
          </div>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
