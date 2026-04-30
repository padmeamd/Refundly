import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { apiGetOpportunities } from "@/lib/api/apiClient";
import type { AutomationDecision, RecoveryOpportunity } from "@/lib/services/recoveryScanService";
import { StatusBadge } from "@/components/StatusBadge";
import { useDemoMode } from "@/lib/state/DemoModeContext";

export const Route = createFileRoute("/findings")({
  component: FindingsPage,
});

type Filter = "All" | AutomationDecision;

const FILTERS: { key: Filter; label: string; icon: string }[] = [
  { key: "All", label: "All cases", icon: "" },
  { key: "AUTO_READY", label: "Auto-send ready", icon: "⚡" },
  { key: "NEEDS_APPROVAL", label: "Needs review", icon: "👤" },
  { key: "NOT_WORTH", label: "Not pursuing", icon: "✕" },
];

function FindingsPage() {
  const { demoMode } = useDemoMode();
  const [filter, setFilter] = useState<Filter>("All");
  const [findings, setFindings] = useState<RecoveryOpportunity[]>([]);
  useEffect(() => {
    apiGetOpportunities().then((res) => {
      if (res.ok) setFindings(res.data);
    });
  }, []);
  const filtered = filter === "All" ? findings : findings.filter((f) => f.decision === filter);

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-6 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Financial intelligence findings</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
          {findings.filter((f) => f.decision !== "NOT_WORTH").length} recoverable opportunities
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Each case triaged with evidence, confidence score, merchant intelligence, and an autonomous routing decision.
        </p>
        {!demoMode && (
          <p className="mt-3 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
            Connect your account to start scanning
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 animate-fade-in">
        {FILTERS.map((f) => {
          const count = f.key === "All" ? findings.length : findings.filter((x) => x.decision === f.key).length;
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
        <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.6fr_0.7fr_0.6fr_1.1fr_0.8fr] gap-3 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
          <div>Category / Merchant</div>
          <div>Explanation</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Recoverable</div>
          <div className="text-right">Conf.</div>
          <div>HITL Decision</div>
          <div className="text-right">Case</div>
        </div>

        {filtered.length === 0 ? (
          <div className="px-5 py-8 text-sm text-muted-foreground">
            {demoMode ? "Run scan to populate findings." : "Connect your account to start scanning"}
          </div>
        ) : filtered.map((f) => (
          <div
            key={f.id}
            className={`grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.6fr_0.7fr_0.6fr_1.1fr_0.8fr] gap-3 px-5 py-4 border-b border-border last:border-0 transition-colors ${
              f.decision === "NOT_WORTH"
                ? "opacity-50 hover:opacity-70"
                : "hover:bg-background/30"
            }`}
          >
            <div>
              <StatusBadge status={f.category} />
              <div className="mt-1.5 font-medium">{f.merchant}</div>
              <div className="text-xs text-muted-foreground">{f.transactionIds.length} matched transactions</div>
            </div>
            <div className="text-sm text-muted-foreground self-center">{f.explanation}</div>
            <div className="text-sm md:text-right self-center">£{f.originalAmount.toFixed(2)}</div>
            <div className={`md:text-right self-center font-semibold ${f.recoverableAmount > 0 ? "text-primary" : "text-muted-foreground"}`}>
              {f.recoverableAmount > 0 ? `£${f.recoverableAmount.toFixed(2)}` : "—"}
            </div>
            <div className="md:text-right self-center">
              <div className="inline-flex items-center gap-1.5">
                <div className="h-1.5 w-12 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${f.confidenceScore >= 80 ? "bg-primary" : f.confidenceScore >= 60 ? "bg-warning" : "bg-muted-foreground/40"}`}
                    style={{ width: `${f.confidenceScore}%` }}
                  />
                </div>
                <span className="text-xs tabular-nums">{f.confidenceScore}%</span>
              </div>
            </div>
            <div className="self-center">
              <StatusBadge status={f.decision} />
            </div>
            <div className="md:text-right self-center">
              {f.decision !== "NOT_WORTH" ? (
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
