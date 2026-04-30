import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { StatusBadge, HitlBadge } from "@/components/StatusBadge";
import { X, Send, Check, EyeOff } from "lucide-react";
import { apiGetOpportunity, apiIgnoreOpportunity, apiMarkRecovered, apiSubmitOpportunity } from "@/lib/api/apiClient";

export const Route = createFileRoute("/findings/$caseId")({
  component: CaseModal,
});

function CaseModal() {
  const { caseId } = Route.useParams();
  const navigate = useNavigate();
  const [f, setF] = useState<any>(null);
  const [submitted, setSubmitted] = useState(false);
  const [recovered, setRecovered] = useState(false);
  useEffect(() => {
    apiGetOpportunity(caseId).then((res) => {
      if (res.ok) setF(res.data);
    });
  }, [caseId]);

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

  const isNotPursuing = f.decision === "NOT_WORTH";
  const isAutoReady = f.decision === "AUTO_READY";
  const needsReview = f.decision === "NEEDS_APPROVAL";

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
          <StatusBadge status={f.category} />
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">{f.merchant}</h2>
          <div className="text-sm text-muted-foreground mt-1">{f.category}</div>

          <div className="mt-5">
            <HitlBadge decision={f.decision} />
            {!isNotPursuing && (
              <p className="mt-2 text-xs text-muted-foreground max-w-lg">{f.decisionReason}</p>
            )}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Charge" value={`£${f.originalAmount.toFixed(2)}`} />
            <Stat
              label="Recoverable"
              value={f.recoverableAmount > 0 ? `£${f.recoverableAmount.toFixed(2)}` : "—"}
              accent={f.recoverableAmount > 0}
            />
            <Stat
              label="Confidence"
              value={`${f.confidenceScore}%`}
              bar
              barColor={f.confidenceScore >= 80 ? "bg-primary" : f.confidenceScore >= 60 ? "bg-warning" : "bg-muted-foreground/40"}
              barPct={f.confidenceScore}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">

          <div className="rounded-xl border border-border bg-background/40 p-4 text-sm">
            <div className="font-medium mb-2">Evidence</div>
            <ul className="list-disc ml-5 space-y-1">{f.evidence.map((e: string) => <li key={e}>{e}</li>)}</ul>
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4 text-sm">
            <div className="text-xs text-primary mb-1">AI reasoning (Claude-ready mock)</div>
            <div className="font-medium mb-1">Explanation</div>
            {f.explanation}
          </div>
          <div className="rounded-xl border border-border bg-background/40 p-4 text-sm">
            <div className="font-medium mb-1">Specter-style intelligence (mock)</div>
            <div>{f.merchantIntelligence.refundPolicy}</div>
            <div className="text-xs text-muted-foreground mt-2">
              Dispute likelihood: {f.merchantIntelligence.disputeLikelihood} · Recovery rate: {f.merchantIntelligence.recoveryRate}%
            </div>
          </div>

          {!isNotPursuing && (
            <div className="rounded-lg border border-border bg-background/40 p-4 text-sm">
              <div className="font-medium mb-1">Generated recovery message</div>
              <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{f.recoveryMessage || "Recovery message queued."}</pre>
            </div>
          )}

          {/* Audit trail */}
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Audit trail</div>
            <div className="rounded-lg border border-border overflow-hidden">
              {f.timeline.map((a: any, i: number) => {
                const isHitl = a.eventType === "automation_decided";
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-0 text-sm ${
                      isHitl ? "bg-warning/5" : "bg-background/30"
                    }`}
                  >
                    <span className="text-xs text-muted-foreground tabular-nums w-20 shrink-0">{new Date(a.timestamp).toLocaleTimeString()}</span>
                    <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${isHitl ? "bg-warning" : "bg-primary"}`} />
                    <span className={isHitl ? "text-warning font-medium" : ""}>{a.eventType} - {a.detail}</span>
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
                onClick={async () => {
                  await apiIgnoreOpportunity(f.id);
                  close();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-background/40"
              >
                <EyeOff className="h-4 w-4" /> Ignore
              </button>
              <button
                onClick={async () => {
                  await apiMarkRecovered(f.id);
                  setRecovered(true);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-primary/40 text-primary px-4 py-2 text-sm hover:bg-primary/10"
              >
                <Check className="h-4 w-4" /> Mark as recovered
              </button>
              {isAutoReady && (
                <button
                  onClick={async () => {
                    await apiSubmitOpportunity(f.id);
                    setSubmitted(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-glow"
                >
                  <Send className="h-4 w-4" /> Auto-send recovery request
                </button>
              )}
              {needsReview && (
                <button
                  onClick={async () => {
                    await apiSubmitOpportunity(f.id);
                    setSubmitted(true);
                  }}
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

