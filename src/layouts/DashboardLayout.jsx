import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({ children }) {
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    window.dispatchEvent(new Event("resize"));
  }, [desktopCollapsed]);

  return (
    <div className="flex min-h-screen overflow-x-hidden bg-slate-50">
      <div className="hidden md:flex">
        <Sidebar
          collapsed={desktopCollapsed}
          onToggleCollapse={() => setDesktopCollapsed((current) => !current)}
        />
      </div>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-[1px] md:hidden"
        />
      )}

      <div
        className={[
          "fixed inset-y-0 left-0 z-40 w-[260px] max-w-[85vw] transform border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Sidebar mobile onNavigate={() => setMobileOpen(false)} onClose={() => setMobileOpen(false)} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onMenuToggle={() => setMobileOpen((current) => !current)}
          onToggleSidebar={() => setDesktopCollapsed((current) => !current)}
          mobileMenuOpen={mobileOpen}
        />

        <main className="flex-1 overflow-x-hidden p-4 md:p-6 xl:p-8">{children}</main>
      </div>
    </div>
  );
}