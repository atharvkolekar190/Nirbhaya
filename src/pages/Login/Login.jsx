import { useState } from "react";
import { ArrowRight, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const DEMO_USERNAME = "admin";
const DEMO_PASSWORD = "nirbhaya123";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const destination = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = (event) => {
    event.preventDefault();

    if (username === DEMO_USERNAME && password === DEMO_PASSWORD) {
      sessionStorage.setItem("nirbhaya-authenticated", "true");
      navigate(destination, { replace: true });
      return;
    }

    setError("Incorrect username or password. Please try again.");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(79,70,229,0.28),_transparent_32%),radial-gradient(circle_at_85%_80%,_rgba(14,165,233,0.18),_transparent_30%)]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-slate-950/40 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-200">
              NIRBHAYA Safety Center
            </p>
            <h1 className="mt-4 max-w-sm text-4xl font-bold leading-tight">
              Your safety network, in one calm place.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-indigo-100">
              Monitor your device, review alerts, and stay connected to the people you trust.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-indigo-100">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_0_5px_rgba(110,231,183,0.15)]" />
            Safety systems ready
          </div>
        </section>

        <section className="p-7 sm:p-12">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-[0.16em] text-slate-900"
          >
            <ShieldCheck className="h-5 w-5 text-indigo-600" />
            NIRBHAYA
          </button>

          <div className="mt-12 max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">Secure access</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Welcome back</h2>
            <p className="mt-3 text-slate-500">Sign in to open your personal safety dashboard.</p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Username</span>
                <span className="relative block">
                  <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Password</span>
                <span className="relative block">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                  />
                </span>
              </label>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
              Demo access: <span className="font-semibold text-slate-700">admin</span> / <span className="font-semibold text-slate-700">nirbhaya123</span>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
