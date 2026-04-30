import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { findings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/findings")({
  component: FindingsPage,
});

function FindingsPage() {
  return (
    <div className="px-6 md:px-10 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <div className="text-xs uppercase tracking-widest text-primary">Lost money findings</div>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-2">
          {findings.length} recoverable opportunities detected
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          Each finding has been triaged with evidence, recovery probability, and a prepared action.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden animate-fade-in">
        <div className="hidden md:grid grid-cols-[1.4fr_1fr_0.7fr_0.8fr_0.7fr_1.1fr_0.9fr] gap-4 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border bg-background/30">
          <div>Type / Merchant</div>
          <div>Action</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Recoverable</div>
          <div className="text-right">Probability</div>
          <div>Status</div>
          <div className="text-right">Case</div>
        </div>
        {findings.map((f) => (
          <div
            key={f.id}
            className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_0.7fr_0.8fr_0.7fr_1.1fr_0.9fr] gap-3 md:gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-background/30 transition-colors"
          >
            <div>
              <StatusBadge status={f.type} />
              <div className="mt-1.5 font-medium">{f.merchant}</div>
              <div className="text-xs text-muted-foreground">{f.date} · {f.category}</div>
            </div>
            <div className="text-sm text-muted-foreground self-center">{f.action}</div>
            <div className="text-sm md:text-right self-center">£{f.amount.toFixed(2)}</div>
            <div className="md:text-right self-center text-primary font-semibold">
              £{f.recoverable.toFixed(2)}
            </div>
            <div className="md:text-right self-center">
              <div className="inline-flex items-center gap-2">
                <div className="h-1.5 w-16 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-gradient-primary" style={{ width: `${f.probability}%` }} />
                </div>
                <span className="text-sm tabular-nums">{f.probability}%</span>
              </div>
            </div>
            <div className="self-center"><StatusBadge status={f.status} /></div>
            <div className="md:text-right self-center">
              <Link
                to="/findings/$caseId"
                params={{ caseId: f.id }}
                className="inline-flex items-center rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:border-primary/50 hover:text-primary transition-colors"
              >
                View case →
              </Link>
            </div>
          </div>
        ))}
      </div>
      <Outlet />
    </div>
  );
}
