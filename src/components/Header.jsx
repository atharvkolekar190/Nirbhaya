import { Bell, Menu, ShieldAlert, UserCircle } from "lucide-react";
import { useLocation } from "react-router-dom";

const titleMap = {
  "/dashboard": "Dashboard",
  "/location": "Live Location",
  "/live-location": "Live Location",
  "/emergency": "Emergency Center",
  "/emergency-center": "Emergency Center",
  "/contacts": "Emergency Contacts",
  "/emergency-contacts": "Emergency Contacts",
  "/history": "Safety History",
  "/safety-history": "Safety History",
  "/analytics": "Sensor Analytics",
  "/sensor-analytics": "Sensor Analytics",
};

export default function Header({ onMenuToggle, mobileMenuOpen = false, onToggleSidebar }) {
  const location = useLocation();
  const pageTitle = titleMap[location.pathname] || "Overview";

  return (
    <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle sidebar"
          aria-expanded={false}
          onClick={onToggleSidebar}
          className="hidden h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 md:inline-flex"
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="nirbhaya-mobile-sidebar-nav"
          aria-expanded={mobileMenuOpen}
          onClick={onMenuToggle}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Overview</p>
          <h2 className="truncate text-lg font-semibold text-slate-900 sm:text-xl">{pageTitle}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden items-center gap-2 rounded-full border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-700 sm:inline-flex">
          <ShieldAlert className="h-3.5 w-3.5" />
          Emergency ready
        </div>

        <button
          type="button"
          aria-label="Notifications"
          className="relative inline-flex h-11 w-11 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
        >
          <Bell size={20} strokeWidth={1.8} />
          <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5">
          <UserCircle size={30} className="text-slate-400" />

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">User</p>
            <p className="text-[11px] text-slate-500">NIRBHAYA Band</p>
          </div>
        </div>
      </div>
    </header>
  );
}