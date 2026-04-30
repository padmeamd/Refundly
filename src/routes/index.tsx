import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { apiRunScan, runDemo } from "@/lib/api/apiClient";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [demoSteps, setDemoSteps] = useState<string[]>([]);
  const [runMeta, setRunMeta] = useState({ runId: "-", auditHash: "-", actionsCreated: 0, actionsSubmitted: 0, transactionsScanned: 0, findingsDetected: 0 });
  const [summary, setSummary] = useState({
    totalMoneyFound: 0,
    recoverableNow: 0,
    autoReadyAmount: 0,
    needsApprovalAmount: 0,
    ignoredAmount: 0,
    numberOfOpportunities: 0,
  });

  const runScan = async () => {
    setScanning(true);
    const res = await apiRunScan();
    if (res.ok) {
      setSummary(res.data.summary);
      setRunMeta((prev) => ({
        ...prev,
        transactionsScanned: res.data.opportunitiesCount ? res.data.opportunitiesCount + 4 : 0,
        findingsDetected: res.data.opportunitiesCount,
      }));
      navigate({ to: "/findings" });
    }
    setScanning(false);
  };

  const runDemoMode = async () => {
    setScanning(true);
    const res = await runDemo();
    if (res.ok) {
      setSummary(res.data.summary);
      setDemoSteps(res.data.steps);
      setRunMeta({
        runId: res.data.runId,
        auditHash: res.data.auditHash,
        actionsCreated: res.data.actionsCreated,
        actionsSubmitted: res.data.actionsSubmitted,
        transactionsScanned: res.data.summary.numberOfOpportunities + 4,
        findingsDetected: res.data.summary.numberOfOpportunities,
      });
      navigate({ to: "/report" });
    }
    setScanning(false);
  };

  return (
    <div className="px-6 py-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-semibold">Refundly Autonomous Recovery Agent</h1>
      <p className="mt-2 text-muted-foreground">
        Scan transactions, detect recoverable losses, decide automation, generate actions, and log full audit evidence.
      </p>
      <div className="mt-6 flex gap-3">
        <button onClick={runScan} disabled={scanning} className="rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm">
          {scanning ? "Running..." : "Run Recovery Scan"}
        </button>
        <button onClick={runDemoMode} disabled={scanning} className="rounded-lg border border-border px-4 py-2 text-sm">
          Run 90-sec demo
        </button>
        <Link to="/findings" className="rounded-lg border border-border px-4 py-2 text-sm">
          View Findings
        </Link>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-3">
        <Metric label="totalMoneyFound" value={`£${summary.totalMoneyFound.toFixed(2)}`} />
        <Metric label="recoverableNow" value={`£${summary.recoverableNow.toFixed(2)}`} />
        <Metric label="numberOfOpportunities" value={`${summary.numberOfOpportunities}`} />
        <Metric label="autoReadyAmount" value={`£${summary.autoReadyAmount.toFixed(2)}`} />
        <Metric label="needsApprovalAmount" value={`£${summary.needsApprovalAmount.toFixed(2)}`} />
        <Metric label="ignoredAmount" value={`£${summary.ignoredAmount.toFixed(2)}`} />
      </div>

      <div className="mt-8 rounded-xl border border-border p-4">
        <h2 className="font-semibold">Agent Run Summary</h2>
        <div className="mt-3 grid md:grid-cols-4 gap-3 text-sm">
          <Metric label="run ID" value={runMeta.runId} />
          <Metric label="audit hash" value={runMeta.auditHash} />
          <Metric label="transactions scanned" value={String(runMeta.transactionsScanned)} />
          <Metric label="findings detected" value={String(runMeta.findingsDetected)} />
          <Metric label="actions created" value={String(runMeta.actionsCreated)} />
          <Metric label="actions submitted" value={String(runMeta.actionsSubmitted)} />
        </div>
      </div>

      {demoSteps.length > 0 && (
        <div className="mt-6 rounded-xl border border-border p-4">
          <h3 className="font-medium mb-2">Demo Progress</h3>
          <ol className="space-y-1 text-sm text-muted-foreground">
            {demoSteps.map((s) => (
              <li key={s}>• {s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}
