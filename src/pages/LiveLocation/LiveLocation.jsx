import { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  CheckCircle2,
  Crosshair,
  LocateFixed,
  MapPin,
  ShieldCheck,
  Wifi,
} from "lucide-react";

import { fetchDeviceData, POLLING_INTERVAL_MS, triggerMacro } from "../../services/dataService";
import { startPolling } from "../../services/polling";

const locationMarkerIcon = new L.DivIcon({
  className: "custom-location-marker",
  html: `
    <div class="relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-indigo-600 shadow-lg">
      <span class="block h-2.5 w-2.5 rounded-full bg-white"></span>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -12],
});

function LiveLocation() {
  const [deviceData, setDeviceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshState, setRefreshState] = useState("idle");
  const refreshTimerRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    let mounted = true;
    mountedRef.current = true;

    const stopPolling = startPolling({
      load: fetchDeviceData,
      intervalMs: POLLING_INTERVAL_MS,
      onData: (data) => {
        if (!mounted) return;
        setDeviceData(data);
        setError(null);
        setLoading(false);
      },
      onError: () => {
        if (!mounted) return;
        setError("Unable to load live location data right now.");
        setLoading(false);
      },
    });

    return () => {
      mounted = false;
      mountedRef.current = false;
      stopPolling();
      if (refreshTimerRef.current) window.clearTimeout(refreshTimerRef.current);
    };
  }, []);

  const handleRefreshLocation = async () => {
    if (refreshState === "pending") return;

    const baseline = Math.max(
      Date.parse(deviceData?.location?.latitudeTimestamp || "") || 0,
      Date.parse(deviceData?.location?.longitudeTimestamp || "") || 0,
    );
    setRefreshState("pending");
    setError(null);

    try {
      await triggerMacro("location");
    } catch (triggerError) {
      setRefreshState("error");
      setError(triggerError.message);
      return;
    }

    let attempts = 0;
    const checkForFreshLocation = async () => {
      if (!mountedRef.current) return;
      attempts += 1;

      try {
        const latest = await fetchDeviceData();
        const latestTimestamp = Math.max(
          Date.parse(latest.location?.latitudeTimestamp || "") || 0,
          Date.parse(latest.location?.longitudeTimestamp || "") || 0,
        );
        const hasFreshCoordinates =
          Number.isFinite(latest.location?.latitude) &&
          Number.isFinite(latest.location?.longitude) &&
          latestTimestamp > baseline;

        if (hasFreshCoordinates) {
          setDeviceData(latest);
          setRefreshState("fresh");
          return;
        }

        if (attempts >= 5) {
          setDeviceData(latest);
          setRefreshState("timeout");
          setError("The location workflow was accepted, but no newer valid coordinates arrived yet.");
          return;
        }
      } catch {
        if (attempts >= 5) {
          setRefreshState("error");
          setError("Unable to check for the refreshed location.");
          return;
        }
      }

      refreshTimerRef.current = window.setTimeout(checkForFreshLocation, 15000);
    };

    refreshTimerRef.current = window.setTimeout(checkForFreshLocation, 15000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
            <span className="text-sm font-medium">Loading location data...</span>
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
            <Crosshair className="h-5 w-5" />
            <span className="font-medium">{error || "Live location data is unavailable."}</span>
          </div>
        </div>
      </div>
    );
  }

  const location = deviceData.location || {};
  const hasCoordinates = Number.isFinite(location.latitude) && Number.isFinite(location.longitude);
  const latitude = hasCoordinates ? location.latitude : null;
  const longitude = hasCoordinates ? location.longitude : null;
  const locationStatus =
    location.freshness?.latitude?.status === "stale" ||
    location.freshness?.longitude?.status === "stale"
      ? "Stale"
      : hasCoordinates
        ? "Live"
        : "Unavailable";
  const lastUpdated = location.lastUpdated;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Live Location</h1>
            <p className="mt-1 text-sm text-slate-600">
              View the current location of the connected NIRBHAYA band.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <button
              type="button"
              onClick={handleRefreshLocation}
              disabled={refreshState === "pending"}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <LocateFixed className="h-4 w-4" />
              {refreshState === "pending" ? "Waiting for fresh location..." : "Start / Refresh Live Location"}
            </button>
            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm md:self-auto">
              <CheckCircle2 className="h-3.5 w-3.5" />
              GPS {refreshState === "pending" ? "Pending" : locationStatus}
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[1.5fr_0.85fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                <MapPin className="h-4 w-4 text-indigo-600" />
                Current location
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
                {locationStatus}
              </span>
            </div>

            <div className="h-[460px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              {hasCoordinates ? <MapContainer
                center={[latitude, longitude]}
                zoom={15}
                scrollWheelZoom={true}
                className="h-full w-full"
                attributionControl={true}
              >
                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <Marker position={[latitude, longitude]} icon={locationMarkerIcon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold text-slate-900">NIRBHAYA Band</div>
                      <div className="text-slate-600">Current Location</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer> : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  No valid phone coordinates are available from ThingSpeak.
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <LocateFixed className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Location Details
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">GPS Status</h2>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">GPS Status</span>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    Available
                  </span>
                </div>

                {refreshState === "pending" && (
                  <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3 text-xs leading-5 text-indigo-800">
                    Waiting for MacroDroid to refresh the phone location and upload newer Fields 5 and 6 values.
                  </div>
                )}

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Latitude</span>
                  <span className="font-semibold text-slate-900">{latitude ?? "Unavailable"}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Longitude</span>
                  <span className="font-semibold text-slate-900">{longitude ?? "Unavailable"}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Accuracy</span>
                  <span className="font-semibold text-slate-900">Unavailable</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Last Updated</span>
                  <span className="font-semibold text-slate-900">
                    {lastUpdated ? new Date(lastUpdated).toLocaleString() : "Unavailable"}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Device Status
                  </div>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Connection</h2>
                </div>
              </div>

              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Device</span>
                  <span className="font-semibold text-slate-900">{deviceData.deviceName}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Device ID</span>
                  <span className="font-semibold text-slate-900">{deviceData.deviceId}</span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="text-slate-600">Connection</span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    <Wifi className="h-3.5 w-3.5" />
                    {deviceData.connectionStatus}
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default LiveLocation;
