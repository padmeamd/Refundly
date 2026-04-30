import { createFileRoute } from "@tanstack/react-router";
import { findings, type ActionStatus } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { Mail, Landmark, XCircle, Receipt } from "lucide-react";

export const Route = createFileRoute("/actions")({
  component: ActionsPage,
});

const buckets = [
  { key: "Refund emails generated", icon: Mail, types: ["Refund eligible"] },
  { key: "Bank disputes prepared", icon: Landmark, types: ["Duplicate charge", "Suspicious charge"] },
  { key: "Subscriptions ready to cancel", icon: XCircle, types: ["Subscription waste"] },
  { key: "Fee reversal requests ready", icon: Receipt, types: ["Hidden fee"] },
];

const statuses: ActionStatus[] = ["Drafted", "Submitted", "Waiting for merchant", "Recovered", "Rejected"];

function ActionsPage() {
  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Autonomous Action Center</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
          Actions prepared by the AI agent
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Drafts, disputes and cancellation requests staged for review or auto-send.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {buckets.map((b) => {
          const items = findings.filter((f) => b.types.includes(f.type));
          const Icon = b.icon;
          return (
            <div key={b.key} className="rounded-2xl border border-border bg-gradient-card p-5">
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" />
                <span className="text-2xl font-semibold tabular-nums">{items.length}</span>
              </div>
              <div className="mt-3 text-sm">{b.key}</div>
              <div className="text-xs text-muted-foreground mt-1">
                £{items.reduce((s, f) => s + f.recoverable, 0).toFixed(2)} potential
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Recovery status tracker</div>
            <div className="text-xs text-muted-foreground">Live status of every prepared action</div>
          </div>
        </div>
        <div className="divide-y divide-border">
          {findings.map((f) => (
            <div
              key={f.id}
              className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.8fr_1fr] gap-3 md:gap-4 px-5 py-4 items-center"
            >
              <div>
                <div className="font-medium">{f.merchant}</div>
                <div className="text-xs text-muted-foreground">{f.action}</div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Recoverable </span>
                <span className="text-primary font-semibold">£{f.recoverable.toFixed(2)}</span>
              </div>
              <StatusBadge status={f.actionStatus} />
              <div className="flex items-center gap-1 md:justify-end">
                {statuses.map((s, i) => {
                  const reachedIdx = statuses.indexOf(f.actionStatus);
                  const reached = i <= reachedIdx && f.actionStatus !== "Rejected";
                  return (
                    <div
                      key={s}
                      title={s}
                      className={`h-1.5 flex-1 md:w-10 md:flex-none rounded-full ${
                        reached ? "bg-gradient-primary" : "bg-muted"
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
