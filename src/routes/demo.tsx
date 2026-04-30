import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { apiGetAuditLog, apiGetOpportunity, apiGetOpportunities, apiRunScan, apiSubmitOpportunity, runDemo } from "@/lib/api/apiClient";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/demo")({
  component: DemoRoute,
});

const DEMO_STEPS = [
  "Connecting demo bank feed",
  "Importing 1,284 transactions",
  "Categorising transactions",
  "Detecting duplicate charges",
  "Checking refund eligibility",
  "Scoring confidence",
  "Applying human-in-the-loop rules",
  "Generating recovery actions",
  "Creating audit trail",
];

function DemoRoute() {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [audit, setAudit] = useState<any[]>([]);
  const [runMeta, setRunMeta] = useState({ runId: "RFND-042", auditHash: "RFND-2026-04-30-A9F2" });
  const progress = useMemo(() => Math.round(((step + (finished ? 1 : 0)) / DEMO_STEPS.length) * 100), [step, finished]);

  useEffect(() => {
    if (!selectedCaseId) return;
    apiGetOpportunity(selectedCaseId).then((res) => {
      if (res.ok) setSelectedCase(res.data);
    });
  }, [selectedCaseId]);

  const startDemo = async () => {
    setRunning(true);
    setFinished(false);
    setStep(0);

    await apiRunScan();
    const res = await runDemo();
    const oppRes = await apiGetOpportunities();
    const auditRes = await apiGetAuditLog();

    if (res.ok) {
      setRunMeta({ runId: res.data.runId, auditHash: res.data.auditHash });
    }
    if (oppRes.ok) {
      const top = oppRes.data.find((o) => o.merchant.toLowerCase().includes("trainline")) ?? oppRes.data[0];
      setSelectedCaseId(top?.id ?? "");
    }
    if (auditRes.ok) setAudit(auditRes.data);
  };

  useEffect(() => {
    if (!running || finished) return;
    if (step >= DEMO_STEPS.length - 1) {
      setFinished(true);
      return;
    }
    const timer = setTimeout(() => setStep((s) => s + 1), 1400);
    return () => clearTimeout(timer);
  }, [running, step, finished]);

  const nextStep = () => {
    if (!running) return;
    if (step >= DEMO_STEPS.length - 1) {
      setFinished(true);
      return;
    }
    setStep((s) => s + 1);
  };

  const skipToResults = () => {
    setStep(DEMO_STEPS.length - 1);
    setFinished(true);
  };

  const submitSelectedAction = async () => {
    if (!selectedCase) return;
    await apiSubmitOpportunity(selectedCase.id);
    const updated = await apiGetOpportunity(selectedCase.id);
    const timeline = await apiGetAuditLog();
    if (updated.ok) setSelectedCase(updated.data);
    if (timeline.ok) setAudit(timeline.data);
  };

  const exportReport = () => {
    const lines = [
      "REFUNDLY DEMO REPORT",
      `Run ID: ${runMeta.runId}`,
      `Audit hash: ${runMeta.auditHash}`,
      "",
      "Total money found: £420",
      "High-confidence recoverable: £180",
      "Issues detected: 7",
      "Auto-ready actions: 3",
      "Human review required: 3",
      "Ignored low-confidence cases: 1",
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "refundly-demo-report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold">Run 90-sec Demo</h1>
      <p className="text-sm text-muted-foreground mt-2">Using simulated Open Banking transaction data for hackathon demo.</p>

      <div className="mt-4 rounded-xl border border-border p-4">
        <div className="flex items-center justify-between text-sm">
          <span>Demo Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-gradient-primary" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 flex gap-2">
          <button onClick={startDemo} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold">
            Run 90-sec Demo
          </button>
          <button onClick={nextStep} disabled={!running || finished} className="rounded-lg border border-border px-4 py-2 text-sm">
            Next Step
          </button>
          <button onClick={skipToResults} disabled={!running} className="rounded-lg border border-border px-4 py-2 text-sm">
            Skip to Results
          </button>
        </div>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-3">
        {DEMO_STEPS.map((s, i) => (
          <div key={s} className={`rounded-xl border p-3 text-sm ${i <= step ? "border-primary bg-primary/5" : "border-border bg-card"}`}>
            <div className="text-xs text-muted-foreground">Step {i + 1}</div>
            <div className="mt-1 font-medium">{s}</div>
          </div>
        ))}
      </div>

      {finished && (
        <>
          <section className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-6">
            <h2 className="text-2xl font-semibold">Refundly found £420 in lost money and prepared £180 in recovery actions.</h2>
            <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
              <SummaryItem label="Total money found" value="£420" />
              <SummaryItem label="High-confidence recoverable" value="£180" />
              <SummaryItem label="Issues detected" value="7" />
              <SummaryItem label="Auto-ready actions" value="3" />
              <SummaryItem label="Human review required" value="3" />
              <SummaryItem label="Ignored low-confidence cases" value="1" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">Run ID: {runMeta.runId} · Audit hash: {runMeta.auditHash}</div>
            <button onClick={exportReport} className="mt-4 rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">Export report</button>
          </section>

          {selectedCase && (
            <section className="mt-6 rounded-2xl border border-border p-6">
              <h3 className="text-xl font-semibold">Highlighted Case: {selectedCase.merchant}</h3>
              <div className="mt-3 flex items-center gap-2">
                <StatusBadge status={selectedCase.decision} />
                <span className="text-sm text-muted-foreground">{selectedCase.decisionReason}</span>
              </div>
              <div className="mt-4 grid md:grid-cols-4 gap-3 text-sm">
                <SummaryItem label="Original amount" value={`£${selectedCase.originalAmount.toFixed(2)}`} />
                <SummaryItem label="Recoverable amount" value={`£${selectedCase.recoverableAmount.toFixed(2)}`} />
                <SummaryItem label="Confidence score" value={`${selectedCase.confidenceScore}%`} />
                <SummaryItem label="Decision" value={selectedCase.decision} />
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">Why Refundly can recover this</div>
                <p className="text-muted-foreground">{selectedCase.explanation}</p>
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">Evidence summary</div>
                <ul className="list-disc ml-5 text-muted-foreground">{selectedCase.evidence.map((e: string) => <li key={e}>{e}</li>)}</ul>
              </div>
              <div className="mt-4 text-sm">
                <div className="font-medium">Generated recovery message</div>
                <pre className="whitespace-pre-wrap rounded-lg border border-border bg-background/40 p-3 text-xs">{selectedCase.recoveryMessage || "Recovery message generated."}</pre>
              </div>
              <div className="mt-4">
                <button
                  onClick={submitSelectedAction}
                  className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm"
                  disabled={selectedCase.actionStatus === "SUBMITTED"}
                >
                  {selectedCase.actionStatus === "SUBMITTED" ? "Refund request submitted" : "Submit recovery action"}
                </button>
              </div>
              <div className="mt-4">
                <div className="font-medium text-sm">Audit timeline</div>
                <div className="mt-2 rounded-lg border border-border">
                  {audit
                    .filter((a) => !a.opportunityId || a.opportunityId === selectedCase.id)
                    .slice(0, 8)
                    .map((a) => (
                      <div key={a.id} className="flex items-center justify-between border-b border-border last:border-0 px-3 py-2 text-xs">
                        <span>{a.eventType}</span>
                        <span className="text-muted-foreground">{new Date(a.timestamp).toLocaleTimeString()}</span>
                      </div>
                    ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <section className="mt-8 rounded-xl border border-border p-4">
        <h3 className="font-semibold">How it works</h3>
        <ol className="mt-2 text-sm text-muted-foreground space-y-1">
          <li>1. Connect transaction feed</li>
          <li>2. Detect recoverable money</li>
          <li>3. Score confidence</li>
          <li>4. Decide auto vs human review</li>
          <li>5. Generate recovery action</li>
          <li>6. Log audit trail</li>
        </ol>
      </section>

      <div className="mt-6">
        <Link to="/" className="text-sm underline">Back to dashboard</Link>
      </div>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold mt-1">{value}</div>
    </div>
  );
}
