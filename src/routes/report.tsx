import { createFileRoute, Link } from "@tanstack/react-router";
import { findings, stats } from "@/lib/mock-data";
import { Download, CheckCircle2, Sparkles, Zap, Users, XCircle } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

function ReportPage() {
  const actionable = findings.filter((f) => f.automationDecision !== "NOT_WORTH_PURSUING");
  const top3 = [...actionable]
    .sort((a, b) => b.recoverable * b.probability - a.recoverable * a.probability)
    .slice(0, 3);

  const byCategory = Object.entries(
    actionable.reduce<Record<string, number>>((acc, f) => {
      acc[f.category] = (acc[f.category] ?? 0) + f.recoverable;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...byCategory.map(([, v]) => v));

  const autoReady = findings.filter((f) => f.automationDecision === "AUTO_READY");
  const needsReview = findings.filter((f) => f.automationDecision === "NEEDS_HUMAN_REVIEW");
  const notPursuing = findings.filter((f) => f.automationDecision === "NOT_WORTH_PURSUING");

  const handleExport = () => {
    const lines = [
      "REFUNDLY RECOVERY REPORT",
      `Generated: ${new Date().toLocaleString("en-GB")}`,
      `Hackathon: Cursor x Briefcase FinTech London · Financial Intelligence track`,
      "",
      `Total money found:     £${stats.totalFound}`,
      `Recoverable now:       £${stats.recoverableNow}`,
      `Issues detected:       ${stats.issuesDetected}`,
      `Avg confidence:        ${stats.successProbability}%`,
      "",
      "HITL ROUTING SUMMARY",
      `  ⚡ AUTO_READY:           ${stats.autoReadyCount} cases · £${stats.autoReadyValue.toFixed(2)}`,
      `  👤 NEEDS_HUMAN_REVIEW:   ${stats.humanReviewCount} cases · £${stats.humanReviewValue.toFixed(2)}`,
      `  ✕  NOT_WORTH_PURSUING:   ${stats.notWorthPursuingCount} cases · £0`,
      "",
      "HITL RULES",
      "  confidence >= 80% + amount <= £100  →  AUTO_READY",
      "  confidence >= 80% + amount >  £100  →  NEEDS_HUMAN_REVIEW",
      "  confidence 60–79%                   →  NEEDS_HUMAN_REVIEW",
      "  confidence < 60%                    →  NOT_WORTH_PURSUING",
      "",
      "FINDINGS",
      ...findings.map((f) =>
        `  [${f.automationDecision}] ${f.merchant} · ${f.type} · £${f.recoverable.toFixed(2)} recoverable · ${f.probability}% conf · ${f.date}`
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `refundly-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      {/* Hero */}
      <section className="rounded-3xl border border-border bg-gradient-card p-8 md:p-12 shadow-elegant relative overflow-hidden animate-fade-in">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Scan complete · Financial Intelligence
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Refundly found <span className="text-gradient">£{stats.totalFound}</span> in lost money
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
            Recovered <span className="text-primary font-semibold">£{stats.recoverableNow}</span> across {stats.issuesDetected} cases —
            {" "}{stats.autoReadyCount} auto-sent, {stats.humanReviewCount} awaiting your approval.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              <Download className="h-4 w-4" /> Export Recovery Report
            </button>
            <Link
              to="/actions"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-5 py-3 text-sm font-medium hover:bg-background/70"
            >
              Review prepared actions
            </Link>
          </div>
        </div>
      </section>

      {/* HITL breakdown — key rubric section */}
      <section className="mt-8 grid md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Zap className="h-4 w-4" /> Auto-send ready
          </div>
          <div className="font-display text-4xl font-medium">{autoReady.length} <span className="text-lg opacity-60">cases</span></div>
          <div className="text-sm text-muted-foreground">£{stats.autoReadyValue.toFixed(2)} — no human approval needed</div>
          <div className="text-xs text-muted-foreground border-t border-primary/10 pt-3">
            Rule: confidence ≥ 80% and amount ≤ £100
          </div>
          <div className="space-y-1 mt-1">
            {autoReady.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{f.merchant}</span>
                <span className="font-medium text-primary">£{f.recoverable.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-warning/25 bg-warning/5 p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-warning font-semibold text-sm">
            <Users className="h-4 w-4" /> Needs your review
          </div>
          <div className="font-display text-4xl font-medium">{needsReview.length} <span className="text-lg opacity-60">cases</span></div>
          <div className="text-sm text-muted-foreground">£{stats.humanReviewValue.toFixed(2)} — pending human approval</div>
          <div className="text-xs text-muted-foreground border-t border-warning/10 pt-3">
            Rule: confidence 60–79% or amount {">"} £100
          </div>
          <div className="space-y-1 mt-1">
            {needsReview.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{f.merchant}</span>
                <span className="font-medium text-warning">£{f.recoverable.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-muted/20 p-6 flex flex-col gap-3 opacity-75">
          <div className="flex items-center gap-2 text-muted-foreground font-semibold text-sm">
            <XCircle className="h-4 w-4" /> Not worth pursuing
          </div>
          <div className="font-display text-4xl font-medium">{notPursuing.length} <span className="text-lg opacity-60">case{notPursuing.length !== 1 ? "s" : ""}</span></div>
          <div className="text-sm text-muted-foreground">£0 recoverable — agent determined too low confidence</div>
          <div className="text-xs text-muted-foreground border-t border-border pt-3">
            Rule: confidence {"<"} 60%
          </div>
          <div className="space-y-1 mt-1">
            {notPursuing.map((f) => (
              <div key={f.id} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{f.merchant}</span>
                <span className="text-muted-foreground/60">{f.probability}% conf</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        {/* Category breakdown */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-1">Recovery by category</h2>
          <p className="text-xs text-muted-foreground mb-5">Actionable cases only</p>
          <div className="space-y-3">
            {byCategory.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{cat}</span>
                  <span className="tabular-nums text-muted-foreground">£{val.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${(val / max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Top 3 */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-5">Top 3 recovery opportunities</h2>
          <div className="space-y-3">
            {top3.map((f, i) => (
              <Link
                key={f.id}
                to="/findings/$caseId"
                params={{ caseId: f.id }}
                className="flex items-center gap-4 rounded-xl border border-border bg-background/30 p-4 hover:border-primary/40 transition-colors"
              >
                <div className="h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{f.merchant}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.action}</div>
                  <StatusBadge status={f.automationDecision} className="mt-1" />
                </div>
                <div className="text-right shrink-0">
                  <div className="text-primary font-semibold tabular-nums">£{f.recoverable.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{f.probability}% conf.</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* Audit summary */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Audit report summary</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <SummaryRow label="Transactions analysed" value="1,284" />
          <SummaryRow label="Issues detected" value={`${stats.issuesDetected}`} />
          <SummaryRow label="Avg confidence" value={`${stats.successProbability}%`} />
          <SummaryRow label="Auto-send actions" value={`${stats.autoReadyCount}`} />
          <SummaryRow label="Human review required" value={`${stats.humanReviewCount}`} />
          <SummaryRow label="Not worth pursuing" value={`${stats.notWorthPursuingCount}`} />
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background/30 p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Decision log</div>
          <div className="space-y-2 text-sm">
            {findings.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <span className="truncate text-xs">
                  <span className="text-muted-foreground">{f.date}</span> · {f.merchant} ·{" "}
                  <span className="text-muted-foreground">{f.probability}% conf</span>
                </span>
                <StatusBadge status={f.automationDecision} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background/30 px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold tabular-nums">{value}</span>
    </div>
  );
}
