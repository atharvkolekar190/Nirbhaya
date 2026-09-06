import { Bell, UserCircle } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-8">
      
      <div>
        <p className="text-sm text-slate-500">
          Welcome back
        </p>
        <h2 className="text-xl font-semibold text-slate-900">
          NIRBHAYA Safety Center
        </h2>
      </div>

      <div className="flex items-center gap-5">
        <button className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
          <Bell size={21} strokeWidth={1.8} />

          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
        </button>

        <div className="flex items-center gap-2">
          <UserCircle size={32} className="text-slate-400" />

          <div className="hidden sm:block">
            <p className="text-sm font-medium text-slate-800">
              User
            </p>
            <p className="text-xs text-slate-500">
              NIRBHAYA Band
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}