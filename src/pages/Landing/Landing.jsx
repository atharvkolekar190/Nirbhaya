import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BellRing,
  CheckCircle2,
  Compass,
  LocateFixed,
  MapPinned,
  ShieldCheck,
  Smartphone,
  Waves,
} from "lucide-react";

import FeatureCard from "../../components/landing/FeatureCard";
import StepCard from "../../components/landing/StepCard";

const featureList = [
  {
    icon: Activity,
    title: "Automatic Detection",
    description:
      "Detects unusual motion and uses sensor information to identify potential emergencies.",
  },
  {
    icon: BellRing,
    title: "Quick SOS",
    description:
      "Provides manual and voice-based methods to trigger an emergency alert.",
  },
  {
    icon: LocateFixed,
    title: "Location Awareness",
    description:
      "Uses GPS to provide the user's current location during an emergency.",
  },
  {
    icon: Smartphone,
    title: "Reliable Communication",
    description:
      "Uses available communication technologies to transmit emergency information.",
  },
];

const processSteps = [
  {
    step: "01",
    title: "Detect",
    description: "Sensors identify a possible emergency.",
  },
  {
    step: "02",
    title: "Verify",
    description: "A short verification period helps reduce accidental alerts.",
  },
  {
    step: "03",
    title: "Locate",
    description: "GPS obtains the user's current location.",
  },
  {
    step: "04",
    title: "Alert",
    description: "Emergency information is communicated to registered contacts.",
  },
];

function Landing() {
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/85 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => scrollToSection("home")}
            className="flex items-center gap-3 text-left"
            aria-label="Go to home section"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-md shadow-slate-300/50">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-bold tracking-[0.14em] text-slate-900">NIRBHAYA</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500">
                Smart Safety System
              </div>
            </div>
          </button>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <button type="button" onClick={() => scrollToSection("home")} className="transition hover:text-slate-900">
              Home
            </button>
            <button type="button" onClick={() => scrollToSection("features")} className="transition hover:text-slate-900">
              Features
            </button>
            <button type="button" onClick={() => scrollToSection("how-it-works")} className="transition hover:text-slate-900">
              How It Works
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Login
          </button>
        </nav>
      </header>

      <main>
        <section id="home" className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(79,70,229,0.12),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(37,99,235,0.08),_transparent_28%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:py-24">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Intelligent emergency response
              </div>

              <h1 className="max-w-xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Smart Safety, When It Matters Most.
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                NIRBHAYA is an intelligent wearable safety system designed to detect potential
                emergencies, determine the user's location, and enable rapid communication with
                trusted contacts.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-500"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("features")}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  Explore Features
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-indigo-600" />
                  GPS-aware alerts
                </div>
                <div className="flex items-center gap-2">
                  <Waves className="h-4 w-4 text-indigo-600" />
                  Sensor-based detection
                </div>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute left-2 top-8 h-32 w-32 rounded-full bg-indigo-100 blur-3xl" />
              <div className="absolute bottom-4 right-4 h-36 w-36 rounded-full bg-sky-100 blur-3xl" />

              <div className="relative w-full max-w-md">
                <div className="absolute -left-4 top-10 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <MapPinned className="h-4 w-4 text-indigo-600" />
                    Live location
                  </div>
                </div>

                <div className="absolute -right-4 bottom-16 rounded-2xl border border-white/70 bg-white/80 p-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <BellRing className="h-4 w-4 text-red-500" />
                    Emergency mode
                  </div>
                </div>

                <div className="relative mx-auto flex h-[430px] w-[260px] items-center justify-center">
                  <div className="absolute top-0 h-24 w-24 rounded-full border-[10px] border-slate-200 bg-slate-100" />
                  <div className="absolute top-20 h-4 w-20 rounded-full bg-slate-200" />

                  <div className="relative h-full w-full rounded-[2.2rem] border border-slate-200 bg-slate-900 p-4 shadow-[0_30px_60px_rgba(15,23,42,0.25)]">
                    <div className="flex h-full flex-col rounded-[1.7rem] bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-300">
                          NIRBHAYA
                        </span>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500/20 text-indigo-200">
                          <ShieldCheck className="h-4 w-4" />
                        </div>
                      </div>

                      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>Safety status</span>
                          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                            Active
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 text-indigo-200">
                            <Activity className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-2xl font-bold text-white">92%</div>
                            <div className="text-[10px] uppercase tracking-[0.18em] text-slate-400">
                              Monitoring
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-slate-300">
                            <MapPinned className="h-4 w-4 text-indigo-300" />
                            <span className="text-[10px] uppercase tracking-[0.18em]">GPS</span>
                          </div>
                          <div className="mt-3 text-sm font-semibold text-white">Locked</div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="flex items-center gap-2 text-slate-300">
                            <BellRing className="h-4 w-4 text-red-300" />
                            <span className="text-[10px] uppercase tracking-[0.18em]">SOS</span>
                          </div>
                          <div className="mt-3 text-sm font-semibold text-white">Ready</div>
                        </div>
                      </div>

                      <div className="mt-auto rounded-2xl border border-indigo-400/30 bg-indigo-500/10 p-3">
                        <div className="flex items-center justify-between text-xs text-indigo-100">
                          <span>Trusted contacts</span>
                          <span className="font-semibold">05</span>
                        </div>
                        <div className="mt-3 h-2 rounded-full bg-slate-700">
                          <div className="h-2 w-3/4 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Safety Features</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Safety Features
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {featureList.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </section>

        <section id="how-it-works" className="bg-slate-900 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">Process</p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                How NIRBHAYA Works
              </h2>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <StepCard
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                  isLast={index === processSteps.length - 1}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.05)] sm:p-12">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Stay Connected. Stay Safer.
              </h2>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                Explore the NIRBHAYA safety system and its intelligent monitoring capabilities.
              </p>
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Access Safety Dashboard
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 text-center text-sm text-slate-600 sm:px-6 lg:flex-row lg:text-left lg:px-8">
          <div className="font-medium text-slate-800">NIRBHAYA — Smart Women Safety System</div>
          <div>© 2026 NIRBHAYA. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
