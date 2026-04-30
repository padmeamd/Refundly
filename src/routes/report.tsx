import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { apiGetAuditLog, apiGetOpportunities, apiGetReport } from "@/lib/api/apiClient";

export const Route = createFileRoute("/report")({
  component: ReportPage,
});

function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [opps, setOpps] = useState<any[]>([]);
  const [audit, setAudit] = useState<any[]>([]);
  useEffect(() => {
    apiGetReport().then((r) => r.ok && setReport(r.data));
    apiGetOpportunities().then((r) => r.ok && setOpps(r.data));
    apiGetAuditLog().then((r) => r.ok && setAudit(r.data));
  }, []);

  const handleExport = () => {
    if (!report) return;
    const lines = [
      "REFUNDLY RECOVERY REPORT",
      `Generated: ${new Date().toLocaleString("en-GB")}`,
      "",
      `Total money found:     £${report.totalMoneyFound.toFixed(2)}`,
      `Recoverable now:       £${report.recoverableNow.toFixed(2)}`,
      `Opportunities:         ${report.numberOfOpportunities}`,
      "",
      "HITL ROUTING SUMMARY",
      `  ⚡ AUTO_READY:           ${report.autoReadyCount} cases · £${report.autoReadyAmount.toFixed(2)}`,
      `  👤 NEEDS_APPROVAL:       ${report.needsApprovalCount} cases · £${report.needsApprovalAmount.toFixed(2)}`,
      `  ✕  NOT_WORTH:           ${report.notWorthCount} cases`,
      "",
      "HITL RULES",
      "  confidence >= 80% + amount <= £100  →  AUTO_READY",
      "  confidence >= 80% + amount >  £100  →  NEEDS_APPROVAL",
      "  confidence 60–79%                   →  NEEDS_APPROVAL",
      "  confidence < 60%                    →  NOT_WORTH",
      "",
      "FINDINGS",
      ...opps.map((f) =>
        `  [${f.decision}] ${f.merchant} · ${f.category} · £${f.recoverableAmount.toFixed(2)} recoverable · ${f.confidenceScore}% conf`
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

  if (!report) return <div className="px-6 py-8">Run scan first to generate report.</div>;

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-5xl mx-auto">
      <section className="rounded-2xl border border-primary/30 bg-primary/5 p-6 mb-6">
        <h2 className="text-2xl font-semibold">Refundly found £420 in lost money and prepared £180 in recovery actions.</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Live run: £{report.totalMoneyFound.toFixed(2)} found, £{report.recoverableNow.toFixed(2)} recoverable.
        </p>
      </section>
      <h1 className="text-3xl font-semibold">Recovery Report</h1>
      <p className="mt-2 text-muted-foreground">This report is generated from the service layer and audit log.</p>
      <div className="mt-4 flex gap-3">
        <button onClick={handleExport} className="inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow">
          <Download className="h-4 w-4" /> Export Recovery Report
        </button>
        <Link to="/actions" className="rounded-xl border border-border px-5 py-3 text-sm">Review prepared actions</Link>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-3">
        <SummaryRow label="totalMoneyFound" value={`£${report.totalMoneyFound.toFixed(2)}`} />
        <SummaryRow label="recoverableNow" value={`£${report.recoverableNow.toFixed(2)}`} />
        <SummaryRow label="numberOfOpportunities" value={`${report.numberOfOpportunities}`} />
        <SummaryRow label="autoReadyAmount" value={`£${report.autoReadyAmount.toFixed(2)}`} />
        <SummaryRow label="needsApprovalAmount" value={`£${report.needsApprovalAmount.toFixed(2)}`} />
        <SummaryRow label="ignoredAmount" value={`£${report.ignoredAmount.toFixed(2)}`} />
      </div>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Decision log</h2>
        <div className="space-y-2 mt-4">
          {opps.map((f) => (
            <div key={f.id} className="flex items-center justify-between gap-2 text-sm">
              <span>{f.merchant} · {f.category} · {f.confidenceScore}%</span>
              <StatusBadge status={f.decision} />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-semibold">Audit timeline</h2>
        <div className="mt-4 space-y-1 text-xs">
          {audit.map((a) => (
            <div key={a.id} className="flex items-center justify-between border-b border-border pb-1">
              <span>{a.eventType}</span>
              <span className="text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
            </div>
          ))}
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
