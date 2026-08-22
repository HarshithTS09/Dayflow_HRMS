import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, UserCheck, UserX, CalendarClock, ClipboardCheck } from "lucide-react";
import Card from "../components/ui/Card";
import StatusBadge from "../components/ui/StatusBadge";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";
import Button from "../components/ui/Button";
import * as employeeService from "../services/employeeService";
import * as attendanceService from "../services/attendanceService";
import * as leaveService from "../services/leaveService";

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [emps, attendance, leaveList] = await Promise.all([
        employeeService.getEmployees(),
        attendanceService.getAllAttendance({ date: todayISO() }),
        leaveService.getAllLeaves(),
      ]);
      setEmployees(emps);
      setTodayAttendance(attendance);
      setLeaves(leaveList);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingBlock label="Loading workforce data..." />;

  const presentToday = todayAttendance.filter((a) => a.status === "present" || a.status === "half-day").length;
  const onLeaveToday = todayAttendance.filter((a) => a.status === "leave").length;
  const absentToday = employees.length - presentToday - onLeaveToday;
  const pendingLeaves = leaves.filter((l) => l.status === "pending");

  const stats = [
    { label: "Total employees", value: employees.length, icon: Users, color: "text-ink-900" },
    { label: "Present today", value: presentToday, icon: UserCheck, color: "text-status-present" },
    { label: "Absent today", value: Math.max(absentToday, 0), icon: UserX, color: "text-status-absent" },
    { label: "On leave today", value: onLeaveToday, icon: CalendarClock, color: "text-status-leave" },
    { label: "Pending approvals", value: pendingLeaves.length, icon: ClipboardCheck, color: "text-status-pending" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Workforce Pulse</h1>
        <p className="text-sm text-ink-500">
          {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} padded={false} className="px-4 py-4">
            <Icon size={16} className={`mb-2 ${color}`} strokeWidth={2.2} />
            <p className={`font-display text-2xl font-extrabold ${color}`}>{value}</p>
            <p className="text-xs text-ink-500">{label}</p>
          </Card>
        ))}
      </div>

      <Card
        title="Attention required"
        action={
          <Link to="/hr/leave">
            <Button size="sm" variant="ghost">View all</Button>
          </Link>
        }
      >
        {pendingLeaves.length === 0 ? (
          <EmptyState title="Nothing needs attention" description="All leave requests are reviewed." />
        ) : (
          <ul className="divide-y divide-ink-100">
            {pendingLeaves.slice(0, 5).map((l) => (
              <li key={l._id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-ink-900">
                    {l.employee?.fullName || "Employee"}{" "}
                    <span className="font-normal text-ink-500 capitalize">— {l.leaveType} leave</span>
                  </p>
                  <p className="text-xs text-ink-500">
                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={l.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
