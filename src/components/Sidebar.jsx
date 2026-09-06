import {
  LayoutDashboard,
  MapPin,
  Siren,
  BarChart3,
  History,
  Users,
  Settings,
} from "lucide-react";

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
    label: "Sensor Analytics",
    icon: BarChart3,
    path: "/analytics",
  },
  {
    label: "Safety History",
    icon: History,
    path: "/history",
  },
  {
    label: "Emergency Contacts",
    icon: Users,
    path: "/emergency-contacts",
  },
];

export default function Sidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      
      {/* Logo */}
      <div className="flex h-20 items-center px-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            NIRBHAYA
          </h1>
          <p className="text-xs text-slate-500">
            Smart Safety System
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <Icon size={19} strokeWidth={1.8} />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="border-t border-slate-200 p-4">
        <a
          href="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <Settings size={19} strokeWidth={1.8} />
          Settings
        </a>
      </div>
    </aside>
  );
}