import { cn } from "@/lib/utils";
import type { FindingStatus, ActionStatus, FindingType } from "@/lib/mock-data";

const map: Record<string, string> = {
  "Ready to claim": "bg-primary/15 text-primary border-primary/30",
  "Auto-dispute prepared": "bg-accent/15 text-accent border-accent/30",
  "Refund email generated": "bg-warning/15 text-warning border-warning/30",
  "Low confidence": "bg-muted text-muted-foreground border-border",
  Drafted: "bg-muted text-muted-foreground border-border",
  Submitted: "bg-accent/15 text-accent border-accent/30",
  "Waiting for merchant": "bg-warning/15 text-warning border-warning/30",
  Recovered: "bg-primary/15 text-primary border-primary/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  "Duplicate charge": "bg-accent/15 text-accent border-accent/30",
  "Hidden fee": "bg-warning/15 text-warning border-warning/30",
  "Subscription waste": "bg-primary/15 text-primary border-primary/30",
  "Refund eligible": "bg-primary/15 text-primary border-primary/30",
  "Suspicious charge": "bg-destructive/15 text-destructive border-destructive/30",
};

export function StatusBadge({
  status,
  className,
}: {
  status: FindingStatus | ActionStatus | FindingType | string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        map[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}