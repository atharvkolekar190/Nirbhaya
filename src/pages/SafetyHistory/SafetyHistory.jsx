import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Filter,
  MapPin,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";

import { fetchSafetyHistory } from "../../services/dataService";

const EVENT_TYPE_OPTIONS = [
  "All Events",
  "Emergency SOS",
  "Voice SOS",
  "Motion Alert",
  "System Check",
];

const STATUS_OPTIONS = ["All", "Resolved", "Cancelled", "Active"];
const DATE_OPTIONS = ["All Time", "Today", "Last 7 Days", "Last 30 Days"];

const statusClasses = {
  Resolved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Cancelled: "border-indigo-200 bg-indigo-50 text-indigo-700",
  Active: "border-red-200 bg-red-50 text-red-700",
  Completed: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

function formatDisplayDate(timestamp) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDisplayTime(timestamp) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatMonthDayYear(timestamp) {
  if (!timestamp) return "--";

  const date = new Date(timestamp);

  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function queryEventMatches(event, searchValue) {
  const haystack = [
    event.type,
    event.status,
    event.description,
    event.location?.name,
    formatDisplayDate(event.timestamp),
    formatDisplayTime(event.timestamp),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(searchValue.toLowerCase());
}

function getDateRangeMatch(event, filter) {
  if (filter === "All Time") {
    return true;
  }

  const eventDate = new Date(event.timestamp);
  const now = new Date();

  if (Number.isNaN(eventDate.getTime())) {
    return true;
  }

  const diffDays = Math.floor((now - eventDate) / (1000 * 60 * 60 * 24));

  if (filter === "Today") {
    return eventDate.toDateString() === now.toDateString();
  }

  if (filter === "Last 7 Days") {
    return diffDays >= 0 && diffDays <= 7;
  }

  if (filter === "Last 30 Days") {
    return diffDays >= 0 && diffDays <= 30;
  }

  return true;
}

function SafetyHistory() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [eventType, setEventType] = useState("All Events");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All Time");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    let active = true;

    const loadHistory = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchSafetyHistory();

        if (!active) {
          return;
        }

        setEvents(data || []);
      } catch (loadError) {
        if (active) {
          setError("Unable to load safety history right now.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setVisibleCount(5);
  }, [search, eventType, statusFilter, dateFilter]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch = !search || queryEventMatches(event, search);
      const matchesType = eventType === "All Events" || event.type === eventType;
      const matchesStatus = statusFilter === "All" || event.status === statusFilter;
      const matchesDate = getDateRangeMatch(event, dateFilter);

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
  }, [events, search, eventType, statusFilter, dateFilter]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = filteredEvents.length > visibleEvents.length;

  const summary = useMemo(() => {
    return {
      total: events.length,
      resolved: events.filter((event) => event.status === "Resolved").length,
      cancelled: events.filter((event) => event.status === "Cancelled").length,
      emergencyAlerts: events.filter(
        (event) => event.type === "Emergency SOS" || event.type === "Voice SOS"
      ).length,
    };
  }, [events]);

  const renderSummaryCard = (title, value, icon, accent) => (
    <div key={title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <div className="h-4 w-4 animate-pulse rounded-full bg-slate-300" />
            <span className="text-sm font-medium">Loading safety history...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 md:p-6">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-5 w-5" />
            <span className="font-medium">{error}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Safety History</h1>
            <p className="mt-1 text-sm text-slate-600">
              Review previous safety events and activity from the connected NIRBHAYA band.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm md:self-auto">
            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            History available
          </div>
        </header>

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {renderSummaryCard(
            "Total Events",
            summary.total,
            <CalendarRange className="h-5 w-5 text-slate-600" />,
            "bg-slate-100 text-slate-600"
          )}
          {renderSummaryCard(
            "Resolved",
            summary.resolved,
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
            "bg-emerald-50 text-emerald-600"
          )}
          {renderSummaryCard(
            "Cancelled",
            summary.cancelled,
            <Filter className="h-5 w-5 text-indigo-600" />,
            "bg-indigo-50 text-indigo-600"
          )}
          {renderSummaryCard(
            "Emergency Alerts",
            summary.emergencyAlerts,
            <AlertTriangle className="h-5 w-5 text-red-600" />,
            "bg-red-50 text-red-600"
          )}
        </section>

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center">
            <label className="relative block min-w-[220px] flex-1">
              <span className="sr-only">Search events</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by event, status, date, or location"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
              />
            </label>

            <select
              value={eventType}
              onChange={(event) => setEventType(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
            >
              {EVENT_TYPE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:bg-white"
            >
              {DATE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">No safety events found</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your safety history will appear here when events are recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {visibleEvents.map((event) => (
              <button
                key={event.id}
                type="button"
                onClick={() => setSelectedEvent(event)}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-indigo-200 hover:shadow-md"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold text-slate-900">{event.type}</p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClasses[event.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                      <span className="inline-flex items-center gap-2">
                        <CalendarRange className="h-4 w-4" />
                        {formatMonthDayYear(event.timestamp)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Clock3 className="h-4 w-4" />
                        {formatDisplayTime(event.timestamp)}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {event.location?.name || "Pune"}
                      </span>
                    </div>
                  </div>

                  <div className="max-w-md text-sm text-slate-600">
                    {event.description}
                  </div>
                </div>
              </button>
            ))}

            {hasMore && (
              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 5)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-indigo-200 hover:text-indigo-700"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Event Details</p>
                <h3 className="mt-1 text-xl font-semibold text-slate-900">{selectedEvent.type}</h3>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                aria-label="Close event details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Date</span>
                <span className="text-slate-800">{formatMonthDayYear(selectedEvent.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Time</span>
                <span className="text-slate-800">{formatDisplayTime(selectedEvent.timestamp)}</span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Location</span>
                <span className="text-slate-800">{selectedEvent.location?.name || "Pune"}</span>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                <span className="font-medium text-slate-500">Status</span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${statusClasses[selectedEvent.status] || "border-slate-200 bg-slate-50 text-slate-700"}`}
                >
                  {selectedEvent.status}
                </span>
              </div>

              {selectedEvent.location?.latitude != null && selectedEvent.location?.longitude != null && (
                <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 p-3">
                  <span className="font-medium text-slate-500">Coordinates</span>
                  <span className="text-slate-800">
                    {selectedEvent.location.latitude}, {selectedEvent.location.longitude}
                  </span>
                </div>
              )}

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-2 font-medium text-slate-500">Description</div>
                <p className="text-slate-700">{selectedEvent.description}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedEvent(null)}
              className="mt-5 w-full rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SafetyHistory;
