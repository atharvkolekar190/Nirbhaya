import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ActivitySquare,
  Clock3,
  Gauge,
  HeartPulse,
  MapPin,
  RadioTower,
  ShieldCheck,
  Wifi,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { fetchDeviceData, fetchSensorReadings } from "../../services/dataService";

const TIME_RANGES = ["1 Hour", "6 Hours", "24 Hours"];

const statusTone = (status) => {
  const value = (status || "").toString().toLowerCase();

  if (value === "normal" || value === "connected" || value === "available") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (value === "elevated" || value === "warning" || value === "standby") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-red-200 bg-red-50 text-red-700";
};

const motionLevelLabel = (value) => {
  if (value >= 65) return "High";
  if (value >= 35) return "Normal";
  return "Low";
};

function SensorAnalytics() {
  const [deviceData, setDeviceData] = useState(null);
  const [sensorData, setSensorData] = useState({
    heartRate: [],
    motion: [],
    recentReadings: [],
    lastUpdated: "Just now",
  });
  const [timeRange, setTimeRange] = useState("1 Hour");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [device, readings] = await Promise.all([
          fetchDeviceData(),
          fetchSensorReadings(),
        ]);

        if (!active) {
          return;
        }

        setDeviceData(device);
        setSensorData(readings || {
          heartRate: [],
          motion: [],
          recentReadings: [],
          lastUpdated: "Just now",
        });
      } catch (err) {
        if (active) {
          setError("Unable to load sensor analytics right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, []);

  const selectedRangeData = useMemo(() => {
    const rangeMap = sensorData.rangeMap || {};
    return rangeMap[timeRange] || {
      heartRate: sensorData.heartRate || [],
      motion: sensorData.motion || [],
      recentReadings: sensorData.recentReadings || [],
    };
  }, [sensorData, timeRange]);

  const summaryCards = useMemo(() => {
    if (!deviceData) {
      return [];
    }

    const heartRateValue = deviceData.heartRate?.value ?? 0;
    const heartRateStatus = deviceData.heartRate?.status ?? "Normal";

    return [
      {
        title: "Heart Rate",
        value: `${heartRateValue} BPM`,
        status: heartRateStatus,
        icon: HeartPulse,
        iconClass: "bg-red-50 text-red-600",
      },
      {
        title: "Motion",
        value: deviceData.motion?.status ?? "Normal",
        status: deviceData.motion?.status ?? "Normal",
        icon: Activity,
        iconClass: "bg-indigo-50 text-indigo-600",
      },
      {
        title: "GPS",
        value: deviceData.gpsStatus ?? "Available",
        status: deviceData.gpsStatus ?? "Available",
        icon: MapPin,
        iconClass: "bg-sky-50 text-sky-600",
      },
      {
        title: "Device/Band",
        value: deviceData.connectionStatus ?? "Connected",
        status: deviceData.connectionStatus ?? "Connected",
        icon: ShieldCheck,
        iconClass: "bg-emerald-50 text-emerald-600",
      },
    ];
  }, [deviceData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
            <span className="text-sm font-medium">Loading sensor analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deviceData) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <ActivitySquare className="h-5 w-5" />
            <span className="font-medium">{error || "Sensor analytics data is unavailable."}</span>
          </div>
        </div>
      </div>
    );
  }

  const lastUpdated = deviceData.location?.lastUpdated || sensorData.lastUpdated || "Just now";
  const chartSeries = selectedRangeData.heartRate || [];
  const motionSeries = selectedRangeData.motion || [];
  const activityRows = selectedRangeData.recentReadings || [];

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Sensor Analytics</h1>
            <p className="mt-1 text-sm text-slate-600">
              Monitor sensor readings and view recent activity from the connected NIRBHAYA band.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm md:self-auto">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            Live Monitoring
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => {
            const Icon = card.icon;

            return (
              <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon className={`h-5 w-5 ${card.iconClass.replace(/bg-[^\s]+|text-[^\s]+/g, "").trim() || ""}`} />
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(card.status)}`}>
                    {card.status}
                  </span>
                </div>

                <div className="mt-5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  {card.title}
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{card.value}</div>
              </div>
            );
          })}
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Heart Rate</div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Recent heart-rate readings</h2>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 p-1">
              {TIME_RANGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTimeRange(option)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    timeRange === option
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartSeries} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
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
                  dataKey="bpm"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#4f46e5" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Motion / Activity</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Recent motion readings</h2>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={motionSeries} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
                  <Tooltip
                    formatter={(value) => [`${motionLevelLabel(value)} activity`, "Motion"]}
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #e2e8f0",
                      backgroundColor: "#fff",
                    }}
                  />
                  <Bar dataKey="motion" fill="#93c5fd" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Gauge className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Sensor Status</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Current sensor health</h2>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              {[
                { label: "MPU6050", value: "Connected", icon: Activity },
                { label: "MAX30102", value: "Connected", icon: HeartPulse },
                { label: "GPS", value: deviceData.gpsStatus || "Available", icon: MapPin },
                { label: "GSM", value: deviceData.gsmStatus || "Connected", icon: Wifi },
                { label: "LoRa", value: deviceData.loraStatus || "Standby", icon: RadioTower },
              ].map((sensor) => {
                const Icon = sensor.icon;
                const tone = statusTone(sensor.value);

                return (
                  <div key={sensor.label} className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">{sensor.label}</span>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tone}`}>
                      {sensor.value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent Readings</div>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">Latest sensor summary</h2>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Clock3 className="h-4 w-4" />
              Last updated: {lastUpdated}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="pb-3 pr-4 font-medium">Time</th>
                  <th className="pb-3 pr-4 font-medium">Heart Rate</th>
                  <th className="pb-3 pr-4 font-medium">Motion</th>
                  <th className="pb-3 pr-4 font-medium">GPS</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(activityRows.length > 0 ? activityRows : [
                  { time: "10:25 AM", bpm: 82, motion: "Normal", gps: "Available", status: "Normal" },
                  { time: "10:20 AM", bpm: 86, motion: "Normal", gps: "Available", status: "Normal" },
                  { time: "10:15 AM", bpm: 80, motion: "Low", gps: "Available", status: "Normal" },
                  { time: "10:10 AM", bpm: 84, motion: "Normal", gps: "Available", status: "Normal" },
                  { time: "10:05 AM", bpm: 81, motion: "Low", gps: "Available", status: "Normal" },
                ]).map((row) => (
                  <tr key={`${row.time}-${row.bpm}`} className="border-b border-slate-100 text-slate-700 last:border-b-0">
                    <td className="py-3 pr-4">{row.time}</td>
                    <td className="py-3 pr-4">{row.bpm} BPM</td>
                    <td className="py-3 pr-4">{row.motion}</td>
                    <td className="py-3 pr-4">{row.gps}</td>
                    <td className="py-3">
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusTone(row.status || "Normal")}`}>
                        {row.status || "Normal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SensorAnalytics;
