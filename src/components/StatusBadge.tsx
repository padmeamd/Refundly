import { cn } from "@/lib/utils";
import type { FindingStatus, ActionStatus, FindingType, AutomationDecision } from "@/lib/mock-data";

const map: Record<string, string> = {
  // Finding status
  "Ready to claim":       "bg-primary/15 text-primary border-primary/30",
  "Auto-dispute prepared":"bg-accent/15 text-accent border-accent/30",
  "Refund email generated":"bg-warning/15 text-warning border-warning/30",
  "Low confidence":       "bg-muted text-muted-foreground border-border",
  "Flagged for review":   "bg-destructive/15 text-destructive border-destructive/30",
  // Action status
  Drafted:                "bg-muted text-muted-foreground border-border",
  Submitted:              "bg-accent/15 text-accent border-accent/30",
  "Waiting for merchant": "bg-warning/15 text-warning border-warning/30",
  Recovered:              "bg-primary/15 text-primary border-primary/30",
  Rejected:               "bg-muted text-muted-foreground/60 border-border",
  // Finding types
  "Duplicate charge":     "bg-accent/15 text-accent border-accent/30",
  "Hidden fee":           "bg-warning/15 text-warning border-warning/30",
  "Subscription waste":   "bg-primary/15 text-primary border-primary/30",
  "Refund eligible":      "bg-primary/15 text-primary border-primary/30",
  "Suspicious charge":    "bg-destructive/15 text-destructive border-destructive/30",
  "Cancelled service":    "bg-muted text-muted-foreground border-border",
  // HITL automation decisions
  AUTO_READY:             "bg-primary/15 text-primary border-primary/40",
  NEEDS_HUMAN_REVIEW:     "bg-warning/15 text-warning border-warning/40",
  NOT_WORTH_PURSUING:     "bg-muted text-muted-foreground/70 border-border",
};

const dotColour: Record<string, string> = {
  AUTO_READY:         "bg-primary",
  NEEDS_HUMAN_REVIEW: "bg-warning",
  NOT_WORTH_PURSUING: "bg-muted-foreground/40",
};

const hitlLabels: Record<AutomationDecision, string> = {
  AUTO_READY: "Auto-send allowed",
  NEEDS_HUMAN_REVIEW: "Human review required",
  NOT_WORTH_PURSUING: "Low confidence — not submitted",
};

export function StatusBadge({
  status,
  className,
}: {
  status: FindingStatus | ActionStatus | FindingType | AutomationDecision | string;
  className?: string;
}) {
  const label = hitlLabels[status as AutomationDecision] ?? status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        map[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full bg-current opacity-70", dotColour[status as string])} />
      {label}
    </span>
  );
}

/** Standalone HITL badge — larger, used in case detail header */
export function HitlBadge({
  decision,
  className,
}: {
  decision: AutomationDecision;
  className?: string;
}) {
  const styles: Record<AutomationDecision, string> = {
    AUTO_READY:
      "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20",
    NEEDS_HUMAN_REVIEW:
      "bg-warning/10 text-warning border-warning/30 ring-1 ring-warning/20",
    NOT_WORTH_PURSUING:
      "bg-muted text-muted-foreground border-border",
  };
  const icons: Record<AutomationDecision, string> = {
    AUTO_READY: "⚡",
    NEEDS_HUMAN_REVIEW: "👤",
    NOT_WORTH_PURSUING: "✕",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold",
        styles[decision],
        className
      )}
    >
      <span>{icons[decision]}</span>
      {hitlLabels[decision]}
    </span>
  );
}
