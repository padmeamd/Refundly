import { createFileRoute, Link } from "@tanstack/react-router";
import { findings, stats } from "@/lib/mock-data";
import { Download, CheckCircle2, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

function ReportPage() {
  const top3 = [...findings].sort((a, b) => b.recoverable * b.probability - a.recoverable * a.probability).slice(0, 3);
  const byCategory = Object.entries(
    findings.reduce<Record<string, number>>((acc, f) => {
      acc[f.category] = (acc[f.category] ?? 0) + f.recoverable;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...byCategory.map(([, v]) => v));

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <section className="rounded-3xl border border-border bg-gradient-card p-8 md:p-12 shadow-elegant relative overflow-hidden animate-fade-in">
        <div className="absolute -top-32 -right-32 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
            <Sparkles className="h-3.5 w-3.5" /> Scan complete
          </div>
          <h1 className="mt-5 text-3xl md:text-5xl font-semibold tracking-tight max-w-3xl">
            Refundly found <span className="text-gradient">£{stats.totalFound}</span> in lost money
          </h1>
          <p className="mt-3 text-base md:text-lg text-muted-foreground max-w-2xl">
            Prepared <span className="text-primary font-semibold">£{stats.recoverableNow}</span> in
            high-confidence recovery actions across {stats.issuesDetected} issues.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
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

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <section className="rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold">Money found breakdown</h2>
              <p className="text-xs text-muted-foreground">By category</p>
            </div>
          </div>
          <div className="space-y-3">
            {byCategory.map(([cat, val]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span>{cat}</span>
                  <span className="tabular-nums text-muted-foreground">£{val.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-gradient-primary"
                    style={{ width: `${(val / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

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
                <div className="h-9 w-9 rounded-lg bg-gradient-primary text-primary-foreground flex items-center justify-center font-semibold">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{f.merchant}</div>
                  <div className="text-xs text-muted-foreground truncate">{f.action}</div>
                </div>
                <div className="text-right">
                  <div className="text-primary font-semibold tabular-nums">£{f.recoverable.toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{f.probability}% conf.</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Audit report summary</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <SummaryRow label="Transactions analysed" value="1,284" />
          <SummaryRow label="Issues detected" value={`${stats.issuesDetected}`} />
          <SummaryRow label="Avg. recovery probability" value={`${stats.successProbability}%`} />
          <SummaryRow label="Disputes drafted" value="2" />
          <SummaryRow label="Refund emails generated" value="3" />
          <SummaryRow label="Cancellations queued" value="2" />
        </div>
        <div className="mt-6 rounded-xl border border-border bg-background/30 p-4">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
            Decision log (sample)
          </div>
          <div className="space-y-2 text-sm">
            {findings.slice(0, 4).map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-3">
                <span className="truncate">
                  <span className="text-muted-foreground">{f.date}</span> · {f.merchant} ·{" "}
                  <span className="text-muted-foreground">{f.type}</span>
                </span>
                <StatusBadge status={f.status} />
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
