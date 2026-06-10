import { cn } from "@/lib/utils";
import { Link, useRouterState } from "@tanstack/react-router";
import { Outlet } from "@tanstack/react-router";
import {
  BarChart3,
  History,
  LayoutDashboard,
  PiggyBank,
  PlusCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", to: "/" as const, icon: LayoutDashboard },
  { label: "Add Expense", to: "/add" as const, icon: PlusCircle },
  { label: "History", to: "/history" as const, icon: History },
  { label: "Budget Manager", to: "/budget" as const, icon: PiggyBank },
  { label: "Reports", to: "/reports" as const, icon: BarChart3 },
];

function NavItem({ label, to, icon: Icon }: (typeof NAV_ITEMS)[0]) {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const isActive =
    to === "/" ? currentPath === "/" : currentPath.startsWith(to);

  return (
    <Link
      to={to}
      data-ocid={`nav.${label.toLowerCase().replace(/\s+/g, "_")}.link`}
      className={cn(
        "relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 cursor-pointer select-none",
        isActive
          ? "text-white"
          : "text-white/70 hover:text-white hover:bg-white/10",
      )}
      style={isActive ? { backgroundColor: "#3D5AFE" } : {}}
    >
      {isActive && (
        <span
          className="absolute left-0 w-0.5 h-7 rounded-r-full"
          style={{ backgroundColor: "#7B93FF" }}
        />
      )}
      <Icon size={16} className="flex-shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function Layout() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F7F8FA]">
      {/* Sidebar */}
      <aside
        className="flex flex-col flex-shrink-0 w-[200px] h-full"
        style={{ backgroundColor: "#1E2235" }}
      >
        {/* App Title */}
        <div className="flex items-center gap-2 px-5 py-6 border-b border-white/10">
          <span
            className="text-2xl leading-none"
            role="img"
            aria-label="wallet"
          >
            💰
          </span>
          <span className="text-white font-display font-semibold text-base leading-tight">
            ExpenseTracker
          </span>
        </div>

        {/* Navigation */}
        <nav
          className="flex-1 py-4 px-3 space-y-1"
          aria-label="Main navigation"
        >
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs text-center">
            © {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Accent separator */}
      <div
        className="w-px flex-shrink-0"
        style={{
          background: "linear-gradient(to bottom, #3D5AFE, #7B93FF, #3D5AFE)",
        }}
      />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto bg-[#F7F8FA]">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;
