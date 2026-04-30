import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { findings } from "@/lib/mock-data";
import { StatusBadge, HitlBadge } from "@/components/StatusBadge";
import { X, Send, Check, EyeOff, FileText, Brain, Shield, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";

export const Route = createFileRoute("/findings/$caseId")({
  component: CaseModal,
});

function CaseModal() {
  const { caseId } = Route.useParams();
  const navigate = useNavigate();
  const f = findings.find((x) => x.id === caseId);
  const [submitted, setSubmitted] = useState(false);
  const [recovered, setRecovered] = useState(false);

  const close = () => navigate({ to: "/findings" });

  if (!f) {
    return (
      <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
        <div className="text-center">
          <p>Case not found.</p>
          <Link to="/findings" className="text-primary text-sm">Back to findings</Link>
        </div>
      </div>
    );
  }

  const isNotPursuing = f.automationDecision === "NOT_WORTH_PURSUING";
  const isAutoReady = f.automationDecision === "AUTO_READY";
  const needsReview = f.automationDecision === "NEEDS_HUMAN_REVIEW";

  const disputeFriendlinessColor = {
    High: "text-primary",
    Medium: "text-warning",
    Low: "text-destructive",
  }[f.merchantIntel.disputeFriendliness];

  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={close}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl border border-border bg-card shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={close}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-muted hover:bg-secondary flex items-center justify-center z-10"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-border">
          <StatusBadge status={f.type} />
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">{f.merchant}</h2>
          <div className="text-sm text-muted-foreground mt-1">{f.category} · {f.date}</div>

          <div className="mt-5">
            <HitlBadge decision={f.automationDecision} />
            {!isNotPursuing && (
              <p className="mt-2 text-xs text-muted-foreground max-w-lg">{f.escalationReason}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Charge" value={`£${f.amount.toFixed(2)}`} />
            <Stat
              label="Recoverable"
              value={f.recoverable > 0 ? `£${f.recoverable.toFixed(2)}` : "—"}
              accent={f.recoverable > 0}
            />
            <Stat
              label="Confidence"
              value={`${f.probability}%`}
              bar
              barColor={f.probability >= 80 ? "bg-primary" : f.probability >= 60 ? "bg-warning" : "bg-muted-foreground/40"}
              barPct={f.probability}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">

          {/* AI Reasoning */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-primary mb-2 font-medium">
              <Sparkles className="h-3.5 w-3.5" /> AI reasoning
              <span className="ml-auto text-[10px] text-muted-foreground font-normal normal-case tracking-normal">
                via llmService · model: claude-sonnet-4-6
              </span>
            </div>
            <p className="text-sm leading-relaxed">{f.llmReasoning.summary}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-medium ${
                f.riskLevel === "Low"
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : f.riskLevel === "Medium"
                    ? "border-warning/30 bg-warning/10 text-warning"
                    : "border-destructive/30 bg-destructive/10 text-destructive"
              }`}>
                Risk: {f.riskLevel}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-muted-foreground font-medium">
                {f.llmReasoning.riskJustification.slice(0, 80)}…
              </span>
            </div>
          </div>

          {/* Merchant Intelligence */}
          <div className="rounded-xl border border-border bg-background/40 p-4">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-3 font-medium">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Merchant intelligence
              <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-muted-foreground/60">
                {f.merchantIntel.source}
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Dispute friendliness</div>
                <div className={`font-semibold ${disputeFriendlinessColor}`}>
                  {f.merchantIntel.disputeFriendliness}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Avg recovery rate</div>
                <div className="font-semibold">{f.merchantIntel.avgRecoveryRate}%</div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Refund policy</div>
                <div className="text-xs text-muted-foreground leading-snug">{f.merchantIntel.refundPolicy.slice(0, 60)}…</div>
              </div>
            </div>
            {f.merchantIntel.knownPattern && (
              <div className="mt-3 rounded-lg border border-border bg-background/30 px-3 py-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 inline mr-1 text-warning" />
                {f.merchantIntel.knownPattern}
              </div>
            )}
          </div>

          <Block icon={Shield} title="Evidence summary">{f.evidence}</Block>
          <Block icon={Brain} title="Why the agent flagged this">{f.reasoning}</Block>

          {!isNotPursuing && (
            <Block icon={FileText} title="Generated recovery message">
              <div className="rounded-lg border border-border bg-background/40 p-4 text-sm leading-relaxed font-mono whitespace-pre-wrap">
                {f.message}
              </div>
            </Block>
          )}

          {/* Audit trail */}
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Audit trail</div>
            <div className="rounded-lg border border-border overflow-hidden">
              {f.audit.map((a, i) => {
                const isHitl = a.event.includes("HITL");
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-0 text-sm ${
                      isHitl ? "bg-warning/5" : "bg-background/30"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">{a.time}</span>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isHitl ? "bg-warning" : "bg-primary"}`} />
                    <span className={isHitl ? "text-warning font-medium" : ""}>{a.event}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer buttons */}
        <div className="p-6 md:p-8 border-t border-border flex flex-wrap gap-2 justify-end">
          {isNotPursuing ? (
            <button onClick={close} className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-background/40">
              Close — not worth pursuing
            </button>
          ) : recovered ? (
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Check className="h-4 w-4" /> Marked as recovered
            </div>
          ) : submitted ? (
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Check className="h-4 w-4" /> Recovery request submitted
            </div>
          ) : (
            <>
              <button
                onClick={close}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-background/40"
              >
                <EyeOff className="h-4 w-4" /> Ignore
              </button>
              <button
                onClick={() => setRecovered(true)}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 text-primary px-4 py-2 text-sm hover:bg-primary/10"
              >
                <Check className="h-4 w-4" /> Mark as recovered
              </button>
              {isAutoReady && (
                <button
                  onClick={() => setSubmitted(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-glow"
                >
                  <Send className="h-4 w-4" /> Auto-send recovery request
                </button>
              )}
              {needsReview && (
                <button
                  onClick={() => setSubmitted(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-warning text-primary-foreground px-4 py-2 text-sm font-semibold"
                >
                  <Send className="h-4 w-4" /> Approve and send
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({
  label, value, accent, bar, barColor, barPct,
}: {
  label: string; value: string; accent?: boolean;
  bar?: boolean; barColor?: string; barPct?: number;
}) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>
        {value}
      </div>
      {bar && barPct !== undefined && (
        <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
          <div className={`h-full ${barColor}`} style={{ width: `${barPct}%` }} />
        </div>
      )}
    </div>
  );
}

function Block({
  icon: Icon, title, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground mb-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {title}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  );
}
