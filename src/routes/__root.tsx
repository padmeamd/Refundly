import { Outlet, Link, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { Radar, LayoutDashboard, ListChecks, Zap, FileBarChart, Sparkles, PlayCircle } from "lucide-react";
import appCss from "../styles.css?url";
import { CoinBurst } from "../components/CoinBurst";

const nav: { to: "/" | "/demo" | "/findings" | "/actions" | "/report"; label: string; icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/demo", label: "Demo", icon: PlayCircle },
  { to: "/findings", label: "Findings", icon: ListChecks },
  { to: "/actions", label: "Action Center", icon: Zap },
  { to: "/report", label: "Report", icon: FileBarChart },
];

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Page not found.</p>
        <Link to="/" className="mt-6 inline-flex items-center rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground">
          Go home
        </Link>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Refundly — Recover lost money automatically" },
      { name: "description", content: "Autonomous AI agent that scans transactions, finds refundable charges, and launches recovery actions without manual work." },
      { property: "og:title", content: "Refundly" },
      { property: "og:description", content: "AI that finds and recovers money you didn't know you lost." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "alternate icon", type: "image/svg+xml", href: "/logo.svg" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const location = useLocation();
  return (
    <div className="min-h-screen">
      <CoinBurst />
      {/* Top nav — single floating bar across the top */}
      <header className="sticky top-0 z-30 px-4 md:px-8 pt-4">
        <div className="mx-auto max-w-7xl glass ring-frame rounded-full pl-3 pr-2 py-2 flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2.5 pl-2 pr-3 group">
            <div className="relative h-9 w-9 rounded-full bg-gradient-ink flex items-center justify-center shadow-soft">
              <Radar className="h-4.5 w-4.5 text-primary-foreground" strokeWidth={2.5} />
              <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-display text-[17px] font-semibold tracking-tight">Refundly</div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground -mt-0.5">AI · Recovery Agent</div>
            </div>
          </Link>

          <nav className="ml-auto flex items-center gap-0.5">
            {nav.map((item) => {
              const active = item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to);
              const Icon = item.icon;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`relative flex items-center gap-2 rounded-full px-3 md:px-4 py-2 text-[13px] transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "text-foreground/70 hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden md:flex ml-1 items-center gap-1.5 rounded-full bg-accent/30 border border-accent/40 pl-2.5 pr-3 py-1.5 text-[11px] font-medium">
            <Sparkles className="h-3 w-3 text-primary" />
            Live agent
          </div>
        </div>
      </header>

      <main className="min-w-0">
        <Outlet />
      </main>

      <footer className="px-6 md:px-10 pb-10 pt-16 max-w-7xl mx-auto">
        <div className="border-t border-border pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            All systems operational · Audit-ready
          </div>
          <div>© 2026 Refundly · Built for the fintech hackathon</div>
        </div>
      </footer>
    </div>
  );
}
