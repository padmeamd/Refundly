import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import { apiGetActions, apiGetOpportunities } from "@/lib/api/apiClient";
import type { RecoveryAction } from "@/lib/services/actionService";
import type { RecoveryOpportunity } from "@/lib/services/recoveryScanService";

export const Route = createFileRoute("/actions")({
  component: ActionsPage,
});

function ActionsPage() {
  const [actions, setActions] = useState<RecoveryAction[]>([]);
  const [opps, setOpps] = useState<RecoveryOpportunity[]>([]);
  useEffect(() => {
    apiGetActions().then((r) => r.ok && setActions(r.data));
    apiGetOpportunities().then((r) => r.ok && setOpps(r.data));
  }, []);
  const oppById = useMemo(() => Object.fromEntries(opps.map((o) => [o.id, o])), [opps]);
  const autoReady = opps.filter((o) => o.decision === "AUTO_READY");
  const needsReview = opps.filter((o) => o.decision === "NEEDS_APPROVAL");
  const notPursuing = opps.filter((o) => o.decision === "NOT_WORTH");

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Autonomous Action Center</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Actions prepared by the AI agent</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The agent has decided which actions to auto-send and which require your approval based on confidence thresholds and amount limits.
        </p>
      </div>

      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Auto-send queue — {autoReady.length} actions
          </div>
          <div className="text-xs text-muted-foreground">
            £{autoReady.reduce((s, f) => s + f.recoverableAmount, 0).toFixed(2)} — agent authorised to send without approval
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/3 overflow-hidden">
          {autoReady.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground text-center">No auto-ready actions.</div>
          ) : (
            <div className="divide-y divide-primary/10">
              {autoReady.map((f) => (
                <ActionRow key={f.id} opportunity={f} action={actions.find((a) => a.opportunityId === f.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NEEDS_HUMAN_REVIEW queue */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-full border border-warning/30 bg-warning/8 px-3 py-1.5 text-xs font-semibold text-warning">
            <Users className="h-3.5 w-3.5" /> Needs your approval — {needsReview.length} actions
          </div>
          <div className="text-xs text-muted-foreground">
            £{needsReview.reduce((s, f) => s + f.recoverableAmount, 0).toFixed(2)} — review each case before sending
          </div>
        </div>
        <div className="rounded-2xl border border-warning/20 bg-warning/3 overflow-hidden">
          {needsReview.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground text-center">No cases pending review.</div>
          ) : (
            <div className="divide-y divide-warning/10">
              {needsReview.map((f) => (
                <ActionRow key={f.id} opportunity={f} action={actions.find((a) => a.opportunityId === f.id)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* NOT_WORTH_PURSUING */}
      {notPursuing.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              ✕ Not worth pursuing — {notPursuing.length} case{notPursuing.length !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-muted-foreground">Agent determined recovery probability too low to justify action</div>
          </div>
          <div className="rounded-2xl border border-border bg-muted/20 overflow-hidden opacity-60">
            <div className="divide-y divide-border">
              {notPursuing.map((f) => (
                <div key={f.id} className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr] gap-3 md:gap-4 px-5 py-4 items-center">
                  <div>
                    <div className="font-medium text-muted-foreground">{f.merchant}</div>
                    <div className="text-xs text-muted-foreground/70">{f.decisionReason}</div>
                  </div>
                  <div className="text-sm text-muted-foreground">£{f.originalAmount.toFixed(2)} found · £0 recoverable</div>
                  <div><StatusBadge status="NOT_WORTH" /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="text-sm font-semibold mb-1">Recovery status tracker</div>
        <div className="text-xs text-muted-foreground mb-4">Live pipeline status for all actionable cases</div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {actions.map((a) => (
              <div
                key={a.id}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1.1fr_1fr] gap-3 md:gap-4 px-5 py-4 items-center"
              >
                <div>
                  <div className="font-medium">{a.merchant}</div>
                  <div className="text-xs text-muted-foreground">{a.actionType}</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Recoverable </span>
                  <span className="text-primary font-semibold">£{a.amount.toFixed(2)}</span>
                </div>
                <div><StatusBadge status={a.decision} /></div>
                <div><StatusBadge status={a.status} /></div>
                <div className="flex items-center gap-1 md:justify-end">
                  <Link to="/findings/$caseId" params={{ caseId: a.opportunityId }} className="text-xs underline">
                    Open case
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionRow({ opportunity, action }: { opportunity: RecoveryOpportunity; action?: RecoveryAction }) {
  const isAuto = opportunity.decision === "AUTO_READY";
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-3 md:gap-4 px-5 py-4 items-center">
      <div>
        <div className="font-medium">{opportunity.merchant}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[220px]">{opportunity.category}</div>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Recoverable </span>
        <span className="font-semibold text-primary">£{opportunity.recoverableAmount.toFixed(2)}</span>
      </div>
      <div><StatusBadge status={action?.status ?? "DRAFTED"} /></div>
      <div className="text-xs text-muted-foreground">{opportunity.confidenceScore}% conf.</div>
      <div>
        <Link
          to="/findings/$caseId"
          params={{ caseId: opportunity.id }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
            isAuto
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
          }`}
        >
          {isAuto ? "⚡ Auto-send allowed" : "👤 Human review required"}
        </Link>
      </div>
    </div>
  );
}
