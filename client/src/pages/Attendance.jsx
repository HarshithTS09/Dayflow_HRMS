import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";
import * as attendanceService from "../services/attendanceService";

const fmtTime = (d) =>
  d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—";

export default function Attendance() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("week"); // week | month

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - (range === "week" ? 7 : 30));
      const data = await attendanceService.getMyAttendance({
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
      });
      setRecords(data);
      setLoading(false);
    };
    load();
  }, [range]);

  const presentCount = records.filter((r) => r.status === "present").length;
  const halfDayCount = records.filter((r) => r.status === "half-day").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Attendance</h1>
          <p className="text-sm text-ink-500">Your check-in and check-out history.</p>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-ink-300">
          {[
            { key: "week", label: "Last 7 days" },
            { key: "month", label: "Last 30 days" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={`px-3.5 py-2 text-sm font-medium transition-colors ${
                range === opt.key ? "bg-ink-900 text-white" : "bg-paper-raised text-ink-700 hover:bg-ink-100"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card padded={false} className="px-4 py-4">
          <p className="text-xs text-ink-500">Days recorded</p>
          <p className="font-display text-xl font-extrabold text-ink-900">{records.length}</p>
        </Card>
        <Card padded={false} className="px-4 py-4">
          <p className="text-xs text-ink-500">Present</p>
          <p className="font-display text-xl font-extrabold text-status-present">{presentCount}</p>
        </Card>
        <Card padded={false} className="px-4 py-4">
          <p className="text-xs text-ink-500">Half-day</p>
          <p className="font-display text-xl font-extrabold text-status-half">{halfDayCount}</p>
        </Card>
      </div>

      <Card padded={false}>
        {loading ? (
          <LoadingBlock />
        ) : records.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No attendance records" description="Check in from your dashboard to start tracking your workday." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium">Check-out</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">
                    {new Date(r.date).toLocaleDateString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3 text-ink-700">{fmtTime(r.checkIn)}</td>
                  <td className="px-5 py-3 text-ink-700">{fmtTime(r.checkOut)}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={r.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
