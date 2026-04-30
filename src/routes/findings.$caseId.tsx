import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { findings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";
import { X, Send, Check, EyeOff, FileText, Brain, Shield } from "lucide-react";

export const Route = createFileRoute("/findings/$caseId")({
  component: CaseModal,
});

function CaseModal() {
  const { caseId } = Route.useParams();
  const navigate = useNavigate();
  const f = findings.find((x) => x.id === caseId);

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

  return (
    <div
      className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={close}
    >
      <div
        className="relative w-full max-w-3xl my-8 rounded-2xl border border-border bg-card shadow-elegant animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute top-4 right-4 h-9 w-9 rounded-full bg-muted hover:bg-secondary flex items-center justify-center"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="p-6 md:p-8 border-b border-border">
          <StatusBadge status={f.type} />
          <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight">{f.merchant}</h2>
          <div className="text-sm text-muted-foreground mt-1">
            {f.category} · {f.date}
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            <Stat label="Charge" value={`£${f.amount.toFixed(2)}`} />
            <Stat label="Recoverable" value={`£${f.recoverable.toFixed(2)}`} accent />
            <Stat label="Probability" value={`${f.probability}%`} />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-5">
          <Block icon={Shield} title="Evidence summary">{f.evidence}</Block>
          <Block icon={Brain} title="Why AI thinks this is recoverable">{f.reasoning}</Block>
          <Block icon={FileText} title="Generated message">
            <div className="rounded-lg border border-border bg-background/40 p-4 text-sm leading-relaxed font-mono">
              {f.message}
            </div>
          </Block>

          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Audit trail</div>
            <div className="rounded-lg border border-border overflow-hidden">
              {f.audit.map((a, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 px-4 py-2.5 border-b border-border last:border-0 text-sm bg-background/30"
                >
                  <span className="text-xs text-muted-foreground tabular-nums w-20">{a.time}</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{a.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 md:p-8 border-t border-border flex flex-wrap gap-2 justify-end">
          <button className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-background/40">
            <EyeOff className="h-4 w-4" /> Ignore
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-primary/40 text-primary px-4 py-2 text-sm hover:bg-primary/10">
            <Check className="h-4 w-4" /> Mark as recovered
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg bg-gradient-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-glow">
            <Send className="h-4 w-4" /> Auto-send recovery request
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-background/40 p-4">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums ${accent ? "text-primary" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function Block({
  icon: Icon,
  title,
  children,
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
