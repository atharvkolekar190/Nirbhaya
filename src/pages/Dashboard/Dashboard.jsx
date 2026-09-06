import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BatteryCharging,
  CheckCircle2,
  Clock3,
  HeartPulse,
  MapPin,
  RadioTower,
  ShieldCheck,
  Signal,
  Wifi,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  fetchDeviceData,
  fetchSafetyHistory,
  fetchSensorHistory,
} from "../../services/dataService";

const statusStyles = (value) => {
  if (!value) {
    return {
      dot: "bg-slate-400",
      badge: "bg-slate-100 text-slate-700 border-slate-200",
      text: "text-slate-700",
      panel: "bg-slate-50 border-slate-200",
    };
  }

  const normalized = value.toString().toLowerCase();

  if (
    normalized.includes("safe") ||
    normalized.includes("connected") ||
    normalized.includes("available") ||
    normalized.includes("normal") ||
    normalized.includes("completed") ||
    normalized.includes("stable") ||
    normalized.includes("standby")
  ) {
    return {
      dot: "bg-emerald-500",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      panel: "border-emerald-200 bg-emerald-50",
    };
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("caution") ||
    normalized.includes("inactive") ||
    normalized.includes("pending")
  ) {
    return {
      dot: "bg-amber-500",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
      text: "text-amber-700",
      panel: "border-amber-200 bg-amber-50",
    };
  }

  if (
    normalized.includes("emergency") ||
    normalized.includes("alert") ||
    normalized.includes("critical") ||
    normalized.includes("danger")
  ) {
    return {
      dot: "bg-red-500",
      badge: "border-red-200 bg-red-50 text-red-700",
      text: "text-red-700",
      panel: "border-red-200 bg-red-50",
    };
  }

  return {
    dot: "bg-indigo-500",
    badge: "border-indigo-200 bg-indigo-50 text-indigo-700",
    text: "text-indigo-700",
    panel: "border-indigo-200 bg-indigo-50",
  };
};

function Dashboard() {
  const [deviceData, setDeviceData] = useState(null);
  const [sensorHistory, setSensorHistory] = useState([]);
  const [safetyHistory, setSafetyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [device, history, events] = await Promise.all([
          fetchDeviceData(),
          fetchSensorHistory(),
          fetchSafetyHistory(),
        ]);

        if (!mounted) {
          return;
        }

        setDeviceData(device);
        setSensorHistory(history || []);
        setSafetyHistory((events || []).slice(0, 3));
      } catch (err) {
        if (mounted) {
          setError("Unable to load dashboard data right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
              <span className="text-sm font-medium">Loading dashboard data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deviceData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{error || "Dashboard data is unavailable."}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const batteryStatus = statusStyles(deviceData.connectionStatus);
  const safetyStatus = statusStyles(deviceData.emergencyStatus);
  const gpsStatus = statusStyles(deviceData.gpsStatus);
  const gsmStatus = statusStyles(deviceData.gsmStatus);
  const loraStatus = statusStyles(deviceData.loraStatus);

  const lastUpdated = deviceData.location?.lastUpdated || "Just now";
  const heartRateValue = deviceData.heartRate?.value ?? 0;
  const heartRateStatus = deviceData.heartRate?.status ?? "Unknown";
  const batteryLevel = deviceData.batteryLevel ?? 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              NIRBHAYA Safety Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor your connected safety band and current safety status.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm md:self-auto">
            <Clock3 className="h-3.5 w-3.5 text-slate-500" />
            Last updated: {lastUpdated}
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Band Status
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{deviceData.connectionStatus}</div>
                </div>
              </div>
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${batteryStatus.dot}`} />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-sm">
              <div className="text-slate-500">Device name</div>
              <div className="mt-1 font-semibold text-slate-900">{deviceData.deviceName}</div>
              <div className="mt-4 text-slate-500">Device ID</div>
              <div className="mt-1 font-medium text-slate-700">{deviceData.deviceId}</div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Heart Rate
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{heartRateValue} BPM</div>
                </div>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
              <span className="text-slate-500">Status</span>
              <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles(heartRateStatus).badge}`}>
                {heartRateStatus}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <BatteryCharging className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Battery
                  </div>
                  <div className="mt-1 text-2xl font-bold text-slate-900">{batteryLevel}%</div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-500">
                <span>Charge</span>
                <span>{batteryLevel}%</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-indigo-500"
                  style={{ width: `${batteryLevel}%` }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    GPS
                  </div>
                  <div className="mt-1 text-xl font-semibold text-slate-900">{deviceData.gpsStatus}</div>
                </div>
              </div>
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${gpsStatus.dot}`} />
            </div>
            <div className="mt-6 border-t border-slate-100 pt-4 text-sm text-slate-600">
              Location tracking is active.
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Sensor Overview
                </div>
                <h2 className="mt-2 text-xl font-semibold text-slate-900">Heart Rate</h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Activity className="h-4 w-4 text-indigo-600" />
                Live monitor
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={sensorHistory} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                    }}
                    labelStyle={{ color: "#0f172a", fontWeight: 600 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heartRate"
                    stroke="#4f46e5"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#4f46e5" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`rounded-2xl border p-5 shadow-sm ${safetyStatus.panel}`}>
            <div className="flex items-center gap-3">
              <span className={`inline-flex h-3 w-3 rounded-full ${safetyStatus.dot}`} />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Safety Status
              </span>
            </div>

            <h2 className={`mt-5 text-3xl font-bold ${safetyStatus.text}`}>
              {deviceData.emergencyStatus}
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              {deviceData.emergencyStatus === "Safe"
                ? "System is operating normally"
                : "Emergency state detected and attention is required."}
            </p>

            <div className="mt-6 rounded-xl border border-slate-200 bg-white/80 p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Emergency status
              </div>
              <div className="mt-2 text-lg font-semibold text-slate-900">
                {deviceData.emergencyStatus}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 xl:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Signal className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Communication Status
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Network health</h2>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-sky-600" />
                  <span className="font-medium text-slate-700">GPS</span>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${gpsStatus.badge}`}>
                  {deviceData.gpsStatus}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <Wifi className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">GSM</span>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${gsmStatus.badge}`}>
                  {deviceData.gsmStatus}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-3">
                  <RadioTower className="h-4 w-4 text-violet-600" />
                  <span className="font-medium text-slate-700">LoRa</span>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${loraStatus.badge}`}>
                  {deviceData.loraStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Recent Safety Activity
                </div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Latest events</h2>
              </div>
            </div>

            <div className="space-y-3">
              {safetyHistory.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No recent safety events available.
                </div>
              ) : (
                safetyHistory.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{event.type}</div>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusStyles(event.status).badge}`}>
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-3 grid gap-1 text-sm text-slate-600">
                      <div>{event.date} • {event.time}</div>
                      <div>{event.location}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
