import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  ClipboardCheck,
  Coins,
  Database,
  FileText,
  PlayCircle,
  ScanSearch,
  Send,
  ShieldCheck,
  Sparkles,
  CircleDot,
} from "lucide-react";
import { apiRunScan } from "@/lib/api/apiClient";
import { useDemoMode } from "@/lib/state/DemoModeContext";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const { demoMode } = useDemoMode();
  const [scanning, setScanning] = useState(false);
  const [runMeta, setRunMeta] = useState({ runId: "-", auditHash: "-", actionsCreated: 0, actionsSubmitted: 0, transactionsScanned: 0, findingsDetected: 0 });
  const [summary, setSummary] = useState({
    totalMoneyFound: 0,
    recoverableNow: 0,
    autoReadyAmount: 0,
    needsApprovalAmount: 0,
    ignoredAmount: 0,
    numberOfOpportunities: 0,
  });
  const hasResults = summary.numberOfOpportunities > 0;
  const statusText = scanning ? "Agent running scan" : hasResults ? "Agent ready - latest run synced" : "Agent ready";

  const runScan = async () => {
    if (!demoMode) return;
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

  return (
    <div className="px-6 md:px-8 py-8 md:py-10 max-w-6xl mx-auto space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-primary/25 bg-gradient-to-br from-primary/12 via-background to-accent/18 p-6 md:p-8 shadow-elegant">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-14 -bottom-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative grid items-center gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              <CircleDot className={`h-3 w-3 ${scanning ? "text-warning animate-pulse" : "text-success"}`} />
              {statusText}
            </div>
            <h1 className="mt-4 text-5xl md:text-6xl font-semibold leading-[1.05]">
              Refundly Autonomous
              <span className="block text-gradient">Recovery Agent</span>
            </h1>
            <p className="mt-4 text-muted-foreground max-w-[760px]">
            Scan transactions, detect recoverable losses, decide automation, generate actions, and log full audit evidence.
            </p>
            <p className="mt-3 inline-flex rounded-full border border-border bg-background/60 px-3 py-1 text-xs text-muted-foreground">
              {demoMode ? "Using simulated Open Banking data" : "Waiting for account connection"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/demo"
                className="group inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-6 py-3.5 text-base font-semibold shadow-glow transition-all duration-200 ease-out hover:-translate-y-0.5 hover:brightness-110"
              >
                <PlayCircle className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
                Run 90-sec Demo
              </Link>
              <button
                onClick={runScan}
                disabled={scanning || !demoMode}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-5 py-3 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ScanSearch className="h-4 w-4" />
                {scanning ? "Running..." : "Run Recovery Scan"}
              </button>
              <Link
                to="/findings"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-5 py-3 text-sm font-medium shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/40"
              >
                <FileText className="h-4 w-4" />
                View Findings
              </Link>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-br from-background to-primary/10 p-4 shadow-soft">
              <div className="text-xs text-muted-foreground">Highlighted opportunity</div>
              <div className="mt-1 text-2xl font-semibold text-primary">{hasResults ? "£180 recoverable" : "£0.00"}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {hasResults ? "Quietly recovering money you forgot about" : "Nothing found yet — which is rare, by the way."}
              </div>
              <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden">
                <div className={`h-full bg-gradient-primary transition-all duration-700 ${hasResults ? "w-[68%]" : "w-[8%]"}`} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {!demoMode && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          Connect your account to start scanning
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Metric label="Total money found" value={`£${summary.totalMoneyFound.toFixed(2)}`} icon={Coins} valueClass="text-foreground" hasResults={hasResults} />
        <Metric label="Recoverable now" value={`£${summary.recoverableNow.toFixed(2)}`} icon={CheckCircle2} valueClass="text-success" hasResults={hasResults} />
        <Metric label="Findings" value={`${summary.numberOfOpportunities}`} icon={Activity} valueClass="text-primary" hasResults={hasResults} />
        <Metric label="Auto-ready amount" value={`£${summary.autoReadyAmount.toFixed(2)}`} icon={Sparkles} valueClass="text-primary" hasResults={hasResults} />
        <Metric label="Needs approval" value={`£${summary.needsApprovalAmount.toFixed(2)}`} icon={AlertTriangle} valueClass="text-warning" hasResults={hasResults} />
        <Metric label="Ignored amount" value={`£${summary.ignoredAmount.toFixed(2)}`} icon={AlertTriangle} valueClass="text-destructive" hasResults={hasResults} />
      </div>

      <div className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/95 to-foreground text-primary-foreground p-5 pb-6 shadow-elegant">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold text-lg">Agent Run Summary</h2>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
            <span className={`h-2 w-2 rounded-full ${hasResults ? "bg-success" : "bg-muted"} ${scanning ? "animate-pulse" : ""}`} />
            {hasResults ? "Last run completed" : "Agent idle"}
          </div>
        </div>
        <div className="mt-4 h-px w-full bg-white/10" />
        <div className="mt-4 grid md:grid-cols-3 gap-3 text-sm">
          <SummaryMetric label="Run ID" value={runMeta.runId} icon={Activity} />
          <SummaryMetric label="Audit hash" value={runMeta.auditHash} icon={ShieldCheck} />
          <SummaryMetric label="Transactions scanned" value={String(runMeta.transactionsScanned)} icon={Database} />
          <SummaryMetric label="Findings detected" value={String(runMeta.findingsDetected)} icon={ScanSearch} />
          <SummaryMetric label="Actions created" value={String(runMeta.actionsCreated)} icon={FileText} />
          <SummaryMetric label="Actions submitted" value={String(runMeta.actionsSubmitted)} icon={Send} />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <h3 className="font-semibold text-lg">How does this work?</h3>
        <p className="mt-1 inline-flex rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          {demoMode ? "Using simulated Open Banking data" : "Waiting for account connection"}
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <HowStep
            number="01"
            icon={Database}
            title="Connect transaction data"
            subtitle="Uses Open Banking APIs like Plaid or TrueLayer (simulated in demo)"
            tooltip="Open Banking APIs -> Plaid, TrueLayer, Tink"
          />
          <HowStep
            number="02"
            icon={ScanSearch}
            title="Analyse transactions"
            subtitle="AI scans for duplicates, fees, subscriptions, and refund opportunities"
          />
          <HowStep
            number="03"
            icon={ShieldCheck}
            title="Score confidence"
            subtitle="Each case is evaluated based on evidence and likelihood of recovery"
          />
          <HowStep
            number="04"
            icon={Bot}
            title="Decide automation"
            subtitle="Refundly decides whether to auto-send, request approval, or ignore"
          />
          <HowStep
            number="05"
            icon={Send}
            title="Generate recovery action"
            subtitle="Creates refund requests, disputes, or cancellation workflows"
          />
          <HowStep
            number="06"
            icon={ClipboardCheck}
            title="Log audit trail"
            subtitle="Every decision is recorded for transparency and review"
          />
        </div>
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  valueClass,
  hasResults,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  valueClass: string;
  hasResults: boolean;
}) {
  return (
    <div className="h-full rounded-2xl border border-border/90 bg-gradient-card p-5 shadow-soft transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:shadow-elegant">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="rounded-lg bg-background/80 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className={`mt-3 text-4xl font-semibold leading-none ${valueClass} ${!hasResults ? "opacity-45" : ""}`}>{value}</div>
      {!hasResults && <div className="mt-2 text-xs text-muted-foreground">Run demo to generate results</div>}
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 px-3 py-3">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wide text-primary-foreground/75">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="mt-1.5 text-lg font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function HowStep({
  number,
  icon: Icon,
  title,
  subtitle,
  tooltip,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  tooltip?: string;
}) {
  return (
    <div
      title={tooltip}
      className="rounded-xl border border-border bg-background/50 p-4 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-primary/40 hover:shadow-soft"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="text-[11px] font-medium text-muted-foreground">{number}</div>
      </div>
      <div className="mt-2 font-medium text-sm">{title}</div>
      <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
    </div>
  );
}
