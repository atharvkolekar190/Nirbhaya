import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock3,
  Mic,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Signal,
  Wifi,
} from "lucide-react";

import { fetchDeviceData, fetchEmergencyContacts } from "../../services/dataService";

const statusStyles = (value) => {
  const normalized = (value || "").toString().toLowerCase();

  if (
    normalized.includes("safe") ||
    normalized.includes("ready") ||
    normalized.includes("connected") ||
    normalized.includes("available") ||
    normalized.includes("normal") ||
    normalized.includes("standby")
  ) {
    return {
      accent: "border-emerald-200 bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      icon: "bg-emerald-50 text-emerald-600",
      panel: "border-emerald-200 bg-emerald-50",
      text: "text-emerald-700",
    };
  }

  if (
    normalized.includes("warning") ||
    normalized.includes("alert") ||
    normalized.includes("pending") ||
    normalized.includes("inactive")
  ) {
    return {
      accent: "border-amber-200 bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      icon: "bg-amber-50 text-amber-600",
      panel: "border-amber-200 bg-amber-50",
      text: "text-amber-700",
    };
  }

  return {
    accent: "border-red-200 bg-red-50 text-red-700",
    dot: "bg-red-500",
    icon: "bg-red-50 text-red-600",
    panel: "border-red-200 bg-red-50",
    text: "text-red-700",
  };
};

function EmergencyCenter() {
  const navigate = useNavigate();

  const [deviceData, setDeviceData] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [device, emergencyContacts] = await Promise.all([
          fetchDeviceData(),
          fetchEmergencyContacts(),
        ]);

        if (!mounted) {
          return;
        }

        setDeviceData(device);
        setContacts(emergencyContacts || []);
      } catch (err) {
        if (mounted) {
          setError("Unable to load emergency center data right now.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!sosTriggered) {
      return undefined;
    }

    if (countdown <= 0) {
      return undefined;
    }

    const timer = setInterval(() => {
      setCountdown((previous) => previous - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [sosTriggered, countdown]);

  const statusInfo = useMemo(() => statusStyles(deviceData?.emergencyStatus), [deviceData]);
  const visibleContacts = contacts.slice(0, 3);

  const handleConfirmSos = () => {
    setSosTriggered(true);
    setCountdown(10);
    setShowConfirm(false);
  };

  const handleCancelAlert = () => {
    setSosTriggered(false);
    setCountdown(10);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-300" />
            <span className="text-sm font-medium">Loading emergency data...</span>
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
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">{error || "Emergency center data is unavailable."}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Emergency Center</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage emergency assistance and monitor the current response status.
          </p>
        </header>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className={`flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${statusInfo.panel}`}>
            <div className="flex items-center gap-3">
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${statusInfo.icon}`}>
                {deviceData.emergencyStatus === "Safe" ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Current Safety Status
                </div>
                <div className={`mt-1 text-2xl font-bold ${statusInfo.text}`}>
                  {deviceData.emergencyStatus}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span className={`inline-flex h-2.5 w-2.5 rounded-full ${statusInfo.dot}`} />
              {deviceData.emergencyStatus === "Safe" ? "No active emergency" : "Emergency response active"}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Manual SOS</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Trigger emergency alert</h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Trigger an emergency alert when immediate assistance is required.
            </p>

            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-500"
            >
              Send SOS
            </button>

            {sosTriggered && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold">Emergency alert triggered</span>
                  </div>
                  <span className="text-sm font-medium text-red-700">{countdown}s</span>
                </div>

                <div className="mt-3 text-sm text-red-700">
                  This is a frontend demo only. No real emergency communication is being sent.
                </div>

                <button
                  type="button"
                  onClick={handleCancelAlert}
                  className="mt-4 inline-flex items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  Cancel Alert
                </button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mic className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Voice Activation</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Voice command</h2>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              Use the configured voice command to initiate an emergency response.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Ready
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Signal className="h-5 w-5" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Response Status</div>
                <h2 className="mt-1 text-xl font-semibold text-slate-900">Emergency Response</h2>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Signal className="h-4 w-4 text-sky-600" />
                  <span className="font-medium text-slate-700">GPS</span>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {deviceData.gpsStatus}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Wifi className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium text-slate-700">GSM</span>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {deviceData.gsmStatus}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-violet-600" />
                  <span className="font-medium text-slate-700">LoRa</span>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                  {deviceData.loraStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Emergency Contacts</div>
                  <h2 className="mt-1 text-xl font-semibold text-slate-900">Registered Contacts</h2>
                </div>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {contacts.length} total
              </span>
            </div>

            <div className="space-y-3">
              {visibleContacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  No emergency contacts available.
                </div>
              ) : (
                visibleContacts.map((contact) => (
                  <div key={contact.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="font-semibold text-slate-900">{contact.name}</div>
                      <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                        Priority {contact.priority}
                      </span>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">{contact.relationship}</div>
                  </div>
                ))
              )}
            </div>

            <button
              type="button"
              onClick={() => navigate("/emergency-contacts")}
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              Manage Contacts
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Emergency verification</div>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">After an emergency trigger, a short verification period allows accidental alerts to be cancelled.</h2>
              <div className="mt-3 text-2xl font-bold text-slate-900">10 seconds</div>
            </div>
          </div>
        </section>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <BellRing className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Send Emergency Alert?</h3>
                <p className="mt-1 text-sm text-slate-600">Are you sure you want to trigger an emergency alert?</p>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSos}
                className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-500"
              >
                Confirm SOS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmergencyCenter;
