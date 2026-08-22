import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { User, Clock, CalendarClock, Wallet, LogOut, AlertCircle } from "lucide-react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { LoadingBlock, Alert, EmptyState } from "../components/ui/Feedback";
import WorkdayPulseRing from "../components/dashboard/WorkdayPulseRing";
import { useAuth } from "../context/AuthContext";
import * as attendanceService from "../services/attendanceService";
import * as leaveService from "../services/leaveService";

const todayISO = () => new Date().toISOString().slice(0, 10);

const quickActions = [
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/attendance", label: "Attendance", icon: Clock },
  { to: "/dashboard/leave", label: "Apply Leave", icon: CalendarClock },
  { to: "/dashboard/payroll", label: "Payroll", icon: Wallet },
];

export default function EmployeeDashboard() {
  const { employee, logout } = useAuth();
  const [today, setToday] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [attendanceRecords, myLeaves] = await Promise.all([
        attendanceService.getMyAttendance({ from: todayISO(), to: todayISO() }),
        leaveService.getMyLeaves(),
      ]);
      setToday(attendanceRecords[0] || null);
      setLeaves(myLeaves);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCheckIn = async () => {
    setActionError("");
    setActionLoading(true);
    try {
      await attendanceService.checkIn();
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not check in");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setActionError("");
    setActionLoading(true);
    try {
      await attendanceService.checkOut();
      await load();
    } catch (err) {
      setActionError(err.response?.data?.message || "Could not check out");
    } finally {
      setActionLoading(false);
    }
  };

  const pending = leaves.filter((l) => l.status === "pending");
  const approved = leaves.filter((l) => l.status === "approved");
  const rejected = leaves.filter((l) => l.status === "rejected");
  const mostRecent = leaves[0];

  if (loading) return <LoadingBlock label="Loading your workday..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">
          {greeting()}, {employee?.fullName?.split(" ")[0] || "there"}
        </h1>
        <p className="text-sm text-ink-500">
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      <Card title="Workday Pulse">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <WorkdayPulseRing checkIn={today?.checkIn} checkOut={today?.checkOut} />
          <div className="flex flex-col items-end gap-2">
            {actionError && <Alert>{actionError}</Alert>}
            {!today?.checkIn && (
              <Button variant="accent" onClick={handleCheckIn} disabled={actionLoading}>
                Check in
              </Button>
            )}
            {today?.checkIn && !today?.checkOut && (
              <Button variant="ghost" onClick={handleCheckOut} disabled={actionLoading}>
                Check out
              </Button>
            )}
            {today?.checkIn && <StatusBadge status={today.status} />}
          </div>
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-ink-500">
          Quick actions
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {quickActions.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 bg-paper-raised px-4 py-5 text-center transition-colors hover:border-pulse-500/40 hover:bg-pulse-50"
            >
              <Icon size={20} className="text-ink-700" strokeWidth={2} />
              <span className="text-sm font-medium text-ink-900">{label}</span>
            </Link>
          ))}
          <button
            onClick={logout}
            className="flex flex-col items-center gap-2 rounded-xl border border-ink-100 bg-paper-raised px-4 py-5 text-center transition-colors hover:border-status-rejected/40 hover:bg-status-rejected-bg"
          >
            <LogOut size={20} className="text-ink-700" strokeWidth={2} />
            <span className="text-sm font-medium text-ink-900">Logout</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Leave summary">
          <div className="mb-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-display text-xl font-extrabold text-status-pending">{pending.length}</p>
              <p className="text-xs text-ink-500">Pending</p>
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-status-approved">{approved.length}</p>
              <p className="text-xs text-ink-500">Approved</p>
            </div>
            <div>
              <p className="font-display text-xl font-extrabold text-status-rejected">{rejected.length}</p>
              <p className="text-xs text-ink-500">Rejected</p>
            </div>
          </div>
          {mostRecent ? (
            <div className="rounded-lg bg-ink-100/60 px-3.5 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold capitalize text-ink-900">
                  {mostRecent.leaveType} leave
                </span>
                <StatusBadge status={mostRecent.status} />
              </div>
              <p className="mt-1 text-xs text-ink-500">
                {new Date(mostRecent.startDate).toLocaleDateString()} —{" "}
                {new Date(mostRecent.endDate).toLocaleDateString()} ({mostRecent.days}{" "}
                {mostRecent.days === 1 ? "day" : "days"})
              </p>
            </div>
          ) : (
            <EmptyState
              title="No leave requests yet"
              description="Apply for leave and track its status here."
              action={
                <Link to="/dashboard/leave">
                  <Button size="sm" variant="ghost">Apply for leave</Button>
                </Link>
              }
            />
          )}
        </Card>

        <Card title="Alerts">
          <ul className="space-y-2.5">
            {!today?.checkIn && (
              <li className="flex items-start gap-2.5 text-sm text-ink-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-status-pending" />
                You haven't checked in today yet.
              </li>
            )}
            {pending.length > 0 && (
              <li className="flex items-start gap-2.5 text-sm text-ink-700">
                <AlertCircle size={16} className="mt-0.5 shrink-0 text-status-pending" />
                You have {pending.length} leave request{pending.length > 1 ? "s" : ""} awaiting HR review.
              </li>
            )}
            {today?.checkIn && pending.length === 0 && (
              <li className="text-sm text-ink-500">You're all caught up — nothing needs attention.</li>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}
