import { createFileRoute, Link } from "@tanstack/react-router";
import { findings, type ActionStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Mail, Landmark, XCircle, Receipt, Zap, Users } from "lucide-react";

export const Route = createFileRoute("/actions")({
  component: ActionsPage,
});

const actionBuckets = [
  { key: "Refund emails", icon: Mail, types: ["Refund eligible", "Subscription waste"] },
  { key: "Bank disputes", icon: Landmark, types: ["Duplicate charge", "Suspicious charge"] },
  { key: "Cancellations", icon: XCircle, types: ["Subscription waste"] },
  { key: "Fee reversals", icon: Receipt, types: ["Hidden fee"] },
];

const allStatuses: ActionStatus[] = ["Drafted", "Submitted", "Waiting for merchant", "Recovered", "Rejected"];

function ActionsPage() {
  const autoReady = findings.filter((f) => f.automationDecision === "AUTO_READY");
  const needsReview = findings.filter((f) => f.automationDecision === "NEEDS_HUMAN_REVIEW");
  const notPursuing = findings.filter((f) => f.automationDecision === "NOT_WORTH_PURSUING");

  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Autonomous Action Center</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">Actions prepared by the AI agent</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          The agent has decided which actions to auto-send and which require your approval based on confidence thresholds and amount limits.
        </p>
      </div>

      {/* Summary buckets */}
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {actionBuckets.map((b) => {
          const items = findings.filter((f) => b.types.some((t) => f.type === t) && f.automationDecision !== "NOT_WORTH_PURSUING");
          const Icon = b.icon;
          return (
            <div key={b.key} className="rounded-2xl border border-border bg-gradient-card p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-semibold tabular-nums">{items.length}</span>
              </div>
              <div className="mt-3 text-sm font-medium">{b.key}</div>
              <div className="text-xs text-muted-foreground mt-1">
                £{items.reduce((s, f) => s + f.recoverable, 0).toFixed(2)} potential
              </div>
            </div>
          );
        })}
      </div>

      {/* AUTO_READY queue */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
            <Zap className="h-3.5 w-3.5" /> Auto-send queue — {autoReady.length} actions
          </div>
          <div className="text-xs text-muted-foreground">
            £{autoReady.reduce((s, f) => s + f.recoverable, 0).toFixed(2)} — agent authorised to send without approval
          </div>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/3 overflow-hidden">
          {autoReady.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground text-center">No auto-ready actions.</div>
          ) : (
            <div className="divide-y divide-primary/10">
              {autoReady.map((f) => (
                <ActionRow key={f.id} f={f} />
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
            £{needsReview.reduce((s, f) => s + f.recoverable, 0).toFixed(2)} — review each case before sending
          </div>
        </div>
        <div className="rounded-2xl border border-warning/20 bg-warning/3 overflow-hidden">
          {needsReview.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground text-center">No cases pending review.</div>
          ) : (
            <div className="divide-y divide-warning/10">
              {needsReview.map((f) => (
                <ActionRow key={f.id} f={f} />
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
                    <div className="text-xs text-muted-foreground/70">{f.escalationReason.slice(0, 80)}…</div>
                  </div>
                  <div className="text-sm text-muted-foreground">£{f.amount.toFixed(2)} found · £0 recoverable</div>
                  <div><StatusBadge status="NOT_WORTH_PURSUING" /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Full status tracker */}
      <section>
        <div className="text-sm font-semibold mb-1">Recovery status tracker</div>
        <div className="text-xs text-muted-foreground mb-4">Live pipeline status for all actionable cases</div>
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="divide-y divide-border">
            {findings.filter((f) => f.automationDecision !== "NOT_WORTH_PURSUING").map((f) => (
              <div
                key={f.id}
                className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1.1fr_1fr] gap-3 md:gap-4 px-5 py-4 items-center"
              >
                <div>
                  <div className="font-medium">{f.merchant}</div>
                  <div className="text-xs text-muted-foreground">{f.action}</div>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Recoverable </span>
                  <span className="text-primary font-semibold">£{f.recoverable.toFixed(2)}</span>
                </div>
                <div><StatusBadge status={f.automationDecision} /></div>
                <div><StatusBadge status={f.actionStatus} /></div>
                <div className="flex items-center gap-1 md:justify-end">
                  {allStatuses.filter(s => s !== "Rejected").map((s, i) => {
                    const reachedIdx = allStatuses.indexOf(f.actionStatus);
                    const reached = i <= reachedIdx && f.actionStatus !== "Rejected";
                    return (
                      <div
                        key={s}
                        title={s}
                        className={`h-1.5 flex-1 md:w-8 md:flex-none rounded-full ${reached ? "bg-gradient-primary" : "bg-muted"}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function ActionRow({ f }: { f: (typeof findings)[0] }) {
  const isAuto = f.automationDecision === "AUTO_READY";
  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_0.8fr_auto] gap-3 md:gap-4 px-5 py-4 items-center">
      <div>
        <div className="font-medium">{f.merchant}</div>
        <div className="text-xs text-muted-foreground truncate max-w-[220px]">{f.action}</div>
      </div>
      <div className="text-sm">
        <span className="text-muted-foreground">Recoverable </span>
        <span className="font-semibold text-primary">£{f.recoverable.toFixed(2)}</span>
      </div>
      <div><StatusBadge status={f.actionStatus} /></div>
      <div className="text-xs text-muted-foreground">{f.probability}% conf.</div>
      <div>
        <Link
          to="/findings/$caseId"
          params={{ caseId: f.id }}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold border transition-colors ${
            isAuto
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/20"
              : "bg-warning/10 border-warning/30 text-warning hover:bg-warning/20"
          }`}
        >
          {isAuto ? "⚡ Review & send" : "👤 Approve"}
        </Link>
      </div>
    </div>
  );
}
