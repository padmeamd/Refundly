import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles, TrendingUp, AlertCircle, Target, ArrowUpRight, Quote } from "lucide-react";
import { stats, scanSteps, findings } from "@/lib/mock-data";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/")({
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(false);
  const [step, setStep] = useState(-1);

  const runScan = () => {
    setScanning(true);
    setStep(0);
    let i = 0;
    const tick = () => {
      i += 1;
      if (i < scanSteps.length) {
        setStep(i);
        setTimeout(tick, 650);
      } else {
        setTimeout(() => navigate({ to: "/report" }), 600);
      }
    };
    setTimeout(tick, 650);
  };

  const statCards = [
    { label: "Money found", value: 420, prefix: "£", icon: TrendingUp, tint: "bg-accent/30 border-accent/50" },
    { label: "Recoverable now", value: 180, prefix: "£", icon: Target, tint: "bg-primary text-primary-foreground border-primary" },
    { label: "Issues detected", value: stats.issuesDetected, prefix: "", icon: AlertCircle, tint: "bg-secondary border-border" },
    { label: "Success probability", value: stats.successProbability, suffix: "%", icon: Sparkles, tint: "bg-card border-border" },
  ];

  return (
    <div className="px-4 sm:px-6 md:px-8 pt-6 sm:pt-8 md:pt-12 max-w-7xl mx-auto">
      {/* Hero — editorial split layout */}
      <section className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] ring-frame bg-gradient-card p-5 sm:p-8 md:p-10 lg:p-14 shadow-elegant grain animate-fade-in">
        {/* Decorative orbits */}
        <svg className="absolute -right-24 -top-24 sm:-right-32 sm:-top-32 h-[320px] w-[320px] sm:h-[500px] sm:w-[500px] opacity-50 animate-spin-slow pointer-events-none" viewBox="0 0 500 500" fill="none">
          <circle cx="250" cy="250" r="240" stroke="oklch(0.36 0.08 260 / 0.18)" strokeDasharray="2 8" />
          <circle cx="250" cy="250" r="180" stroke="oklch(0.55 0.12 255 / 0.25)" strokeDasharray="1 6" />
          <circle cx="250" cy="250" r="120" stroke="oklch(0.36 0.08 260 / 0.2)" />
          <circle cx="430" cy="250" r="6" fill="oklch(0.55 0.12 255)" />
          <circle cx="250" cy="70" r="4" fill="oklch(0.76 0.06 240)" />
          <circle cx="130" cy="250" r="3" fill="oklch(0.36 0.08 260)" />
        </svg>
        <div className="absolute -left-20 -bottom-24 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-accent/30 blur-3xl pointer-events-none" />

        <div className="relative grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          <div className="lg:col-span-7 min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full bg-background/70 backdrop-blur ring-frame px-3.5 py-1.5 text-[11px] uppercase tracking-[0.2em] text-primary font-medium">
              <ShieldCheck className="h-3.5 w-3.5" /> Audit-ready agent
            </span>
            <h1 className="mt-5 sm:mt-6 font-display text-[2.5rem] leading-[1] sm:text-5xl md:text-6xl lg:text-7xl sm:leading-[0.95] font-medium">
              Recover lost money,{" "}
              <span className="relative inline-block">
                <span className="italic text-gradient">automatically.</span>
                <svg className="absolute -bottom-2 left-0 w-full" height="14" viewBox="0 0 300 14" preserveAspectRatio="none">
                  <path d="M2 8 Q 75 2 150 7 T 298 6" stroke="oklch(0.5 0.13 155)" strokeWidth="3" fill="none" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-5 sm:mt-6 text-[15px] sm:text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed">
              An autonomous AI agent that scans transactions, finds refundable charges, and launches recovery actions — without manual work.
            </p>

            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={runScan}
                disabled={scanning}
                className="group relative inline-flex items-center gap-2 rounded-full bg-primary px-6 sm:px-7 py-3.5 sm:py-4 text-sm font-semibold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] disabled:opacity-70 overflow-hidden"
              >
                <span className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative">{scanning ? "Scanning…" : "Run Recovery Scan"}</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <Link to="/findings" className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-5 py-3 sm:py-3.5 text-sm font-medium hover:bg-background transition-colors">
                View 7 findings <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-7 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-5 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {["#1f3a2a", "#2f5d3a", "#a16207", "#eab308", "#fde68a"].map((c) => (
                  <div key={c} className="h-6 w-6 sm:h-7 sm:w-7 rounded-full ring-2 ring-background" style={{ background: c }} />
                ))}
              </div>
              <div>Trusted by <span className="text-foreground font-semibold">1,284</span> transactions analysed today</div>
            </div>
          </div>

          {/* Right — sticker money card */}
          <div className="lg:col-span-5 relative mt-2 lg:mt-0">
            <div className="absolute -top-4 sm:-top-6 -left-2 sm:-left-6 rotate-[-6deg] z-20 animate-float-slow">
              <div className="rounded-2xl bg-accent ring-frame px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-primary shadow-soft">
                ✦ Live recovery
              </div>
            </div>
            <div className="relative rounded-3xl bg-gradient-ink text-primary-foreground p-6 sm:p-7 shadow-elegant overflow-hidden">
              <div className="absolute inset-0 dotted-grid opacity-20" />
              <svg className="absolute -right-10 -bottom-10 h-40 w-40 sm:h-56 sm:w-56 opacity-30 pointer-events-none" viewBox="0 0 200 200" fill="none">
                <circle cx="100" cy="100" r="90" stroke="white" strokeDasharray="3 6" />
                <circle cx="100" cy="100" r="60" stroke="white" strokeDasharray="2 4" />
              </svg>
              <div className="relative">
                <div className="flex items-center justify-between text-[10px] sm:text-[11px] uppercase tracking-widest opacity-70 gap-2">
                  <span>Recoverable balance</span>
                  <span className="flex items-center gap-1.5 shrink-0"><span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" /> Live</span>
                </div>
                <div className="mt-4 sm:mt-5 font-display text-5xl sm:text-6xl md:text-7xl font-medium tracking-tight">
                  £180<span className="text-xl sm:text-2xl opacity-50">.40</span>
                </div>
                <div className="mt-2 text-sm opacity-70">across 7 prepared cases</div>

                <div className="mt-6 sm:mt-7 grid grid-cols-3 gap-2">
                  {[
                    { l: "Disputes", v: "2" },
                    { l: "Refunds", v: "3" },
                    { l: "Cancels", v: "2" },
                  ].map((x) => (
                    <div key={x.l} className="rounded-xl bg-white/10 p-2.5 sm:p-3 backdrop-blur-sm">
                      <div className="text-xl sm:text-2xl font-display">{x.v}</div>
                      <div className="text-[9px] sm:text-[10px] uppercase tracking-widest opacity-60 mt-0.5">{x.l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 sm:-bottom-5 -right-2 sm:-right-3 rotate-[8deg] z-20">
              <div className="rounded-xl bg-background ring-frame px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-medium shadow-soft flex items-center gap-1.5">
                <Quote className="h-3 w-3 text-primary" /> 82% recovery confidence
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee ticker */}
      <div className="mt-8 sm:mt-6 overflow-hidden rounded-full bg-primary text-primary-foreground py-2 sm:py-2.5">
        <div className="flex gap-8 sm:gap-12 animate-marquee whitespace-nowrap text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] font-medium px-4">
          {[...Array(2)].map((_, k) => (
            <div key={k} className="flex gap-8 sm:gap-12 shrink-0">
              {["Duplicate charge · £7.40 found", "FitFlex Gym · cancellation drafted", "MetroBank · fee reversal queued", "Trainline · £56.20 ready", "Amazon late delivery · £12 claimed", "✦ Audit log signed"].map((t) => (
                <span key={t} className="flex items-center gap-2 sm:gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" /> {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Scan progress */}
      {scanning && (
        <section className="mt-8 rounded-3xl ring-frame bg-card p-5 sm:p-6 md:p-8 animate-scale-in shadow-soft">
          <div className="flex items-center justify-between mb-5 gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium">Autonomous workflow</div>
              <div className="font-display text-xl sm:text-2xl mt-1">AI agent running</div>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground tabular-nums shrink-0">
              Step {Math.min(step + 1, scanSteps.length)} / {scanSteps.length}
            </div>
          </div>
          <div className="space-y-2.5">
            {scanSteps.map((s, idx) => {
              const done = idx < step;
              const active = idx === step;
              return (
                <div
                  key={s}
                  className={`flex items-center gap-3 sm:gap-4 rounded-2xl border px-3 sm:px-4 py-2.5 sm:py-3 transition-all ${
                    done ? "border-primary/30 bg-primary/5" : active ? "border-accent/50 bg-accent/10" : "border-border bg-background/40 opacity-60"
                  }`}
                >
                  <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${
                    done ? "bg-primary text-primary-foreground" : active ? "bg-accent text-primary animate-pulse-ring" : "bg-muted text-muted-foreground"
                  }`}>
                    {done ? "✓" : idx + 1}
                  </div>
                  <div className="flex-1 text-xs sm:text-sm font-medium min-w-0">{s}</div>
                  {active && (
                    <div className="h-1 w-16 sm:w-24 overflow-hidden rounded-full bg-muted shrink-0">
                      <div className="h-full w-1/2 bg-gradient-primary animate-[shimmer_1.2s_linear_infinite]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Stats — asymmetric */}
      <section className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className={`relative overflow-hidden rounded-3xl border p-5 md:p-6 ring-frame animate-fade-in ${s.tint}`}
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="text-[11px] uppercase tracking-[0.18em] opacity-70">{s.label}</div>
                <Icon className="h-4 w-4 opacity-60" />
              </div>
              <div className="mt-4 font-display text-4xl md:text-5xl font-medium tabular-nums">
                {s.prefix}{s.value}{s.suffix}
              </div>
              <svg className="absolute -bottom-6 -right-4 h-20 w-24 opacity-20" viewBox="0 0 100 100" fill="none">
                <path d="M5 80 Q 30 30 60 50 T 95 20" stroke="currentColor" strokeWidth="2" fill="none" />
              </svg>
            </div>
          );
        })}
      </section>

      {/* Top opportunities */}
      <section className="mt-12">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-primary font-medium">Curated by AI</div>
            <h2 className="font-display text-3xl md:text-4xl mt-1">Top opportunities</h2>
          </div>
          <Link to="/findings" className="text-sm font-medium hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {findings.slice(0, 3).map((f, i) => (
            <Link
              key={f.id}
              to="/findings/$caseId"
              params={{ caseId: f.id }}
              className="group relative overflow-hidden rounded-3xl bg-gradient-card ring-frame p-6 hover:shadow-elegant transition-all hover:-translate-y-1"
            >
              <div className="absolute top-4 right-4 h-12 w-12 rounded-full bg-accent/40 group-hover:bg-accent transition-colors flex items-center justify-center">
                <ArrowUpRight className="h-5 w-5 text-primary" />
              </div>
              <div className="text-[11px] uppercase tracking-widest text-muted-foreground">#{String(i + 1).padStart(2, "0")}</div>
              <StatusBadge status={f.type} className="mt-2" />
              <div className="mt-4 font-display text-2xl">{f.merchant}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f.action}</div>
              <div className="mt-6 pt-4 border-t border-border flex items-end justify-between">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Recoverable</div>
                  <div className="font-display text-3xl text-primary">£{f.recoverable.toFixed(2)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Confidence</div>
                  <div className="font-display text-xl">{f.probability}%</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
