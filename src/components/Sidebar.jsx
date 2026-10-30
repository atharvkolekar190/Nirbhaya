import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  History,
  LayoutDashboard,
  MapPin,
  ShieldCheck,
  Siren,
  Users,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const menuItems = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    label: "Live Location",
    icon: MapPin,
    path: "/location",
  },
  {
    label: "Emergency Center",
    icon: Siren,
    path: "/emergency",
  },
  {
    label: "Emergency Contacts",
    icon: Users,
    path: "/emergency-contacts",
  },
  {
    label: "Safety History",
    icon: History,
    path: "/history",
  },
  {
    label: "Sensor Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
];

export default function Sidebar({ collapsed = false, mobile = false, onToggleCollapse, onNavigate, onClose }) {
  const showText = !collapsed || mobile;
  const sidebarNavId = mobile ? "nirbhaya-mobile-sidebar-nav" : "nirbhaya-desktop-sidebar-nav";

  return (
    <aside
      className={[
        "flex h-screen flex-col border-slate-200 bg-white shadow-sm",
        mobile ? "w-[260px] max-w-[85vw]" : "w-[260px] transition-[width] duration-300 ease-out",
        !mobile && collapsed ? "w-[78px]" : "",
        mobile ? "border-r" : "border-r",
      ].join(" ")}
    >
      <div className={`flex items-center ${showText ? "justify-between px-4" : "justify-center px-2"} h-20 border-b border-slate-200`}>
        <div className={`flex items-center gap-3 ${showText ? "" : "justify-center"}`}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </div>

          {showText && (
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">NIRBHAYA</h1>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
                Safety System
              </p>
            </div>
          )}
        </div>

        {mobile ? (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            aria-controls={sidebarNavId}
            onClick={onToggleCollapse}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav id={sidebarNavId} className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                onClick={onNavigate}
                title={!mobile && collapsed ? item.label : undefined}
                aria-label={item.label}
                className={({ isActive }) => [
                  "group relative flex items-center rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 motion-reduce:transition-none",
                  showText ? "gap-3 px-3 py-2.5" : "justify-center px-2 py-2.5",
                  isActive
                    ? "border border-indigo-100 bg-indigo-50 text-indigo-700 shadow-sm before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-full before:bg-indigo-500"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                ].join(" ")}
              >
                <span className="flex h-5 w-5 items-center justify-center text-current">
                  <Icon className="h-5 w-5" strokeWidth={1.8} />
                </span>

                {showText && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}