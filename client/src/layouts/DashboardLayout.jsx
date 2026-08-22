import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  Clock,
  CalendarClock,
  Wallet,
  Users,
  ClipboardCheck,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/ui/Logo";

const employeeNav = [
  { to: "/dashboard", label: "Workday Pulse", icon: LayoutDashboard, end: true },
  { to: "/dashboard/profile", label: "Profile", icon: User },
  { to: "/dashboard/attendance", label: "Attendance", icon: Clock },
  { to: "/dashboard/leave", label: "Leave", icon: CalendarClock },
  { to: "/dashboard/payroll", label: "Payroll", icon: Wallet },
];

const hrNav = [
  { to: "/hr", label: "Workforce Pulse", icon: LayoutDashboard, end: true },
  { to: "/hr/employees", label: "Employees", icon: Users },
  { to: "/hr/attendance", label: "Attendance", icon: Clock },
  { to: "/hr/leave", label: "Leave Approvals", icon: ClipboardCheck },
  { to: "/hr/payroll", label: "Payroll", icon: Wallet },
];

export default function DashboardLayout() {
  const { user, employee, logout } = useAuth();
  const nav = user?.role === "hr" ? hrNav : employeeNav;

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink-100 bg-paper-raised px-4 py-6">
        <div className="mb-8 flex items-center gap-2 px-2">
          <Logo size={32} />
          <div>
            <p className="font-display text-sm font-extrabold leading-tight text-ink-900">
              DAYFLOW
            </p>
            <p className="text-[10px] leading-tight text-ink-500">Every workday, aligned.</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-ink-900 text-white"
                    : "text-ink-700 hover:bg-ink-100"
                }`
              }
            >
              <Icon size={17} strokeWidth={2.2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-6 border-t border-ink-100 pt-4">
          <div className="mb-3 flex items-center gap-2.5 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pulse-50 font-display text-xs font-bold text-pulse-600">
              {(employee?.fullName || user?.employeeId || "U").slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">
                {employee?.fullName || user?.employeeId}
              </p>
              <p className="truncate text-xs capitalize text-ink-500">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-700 transition-colors hover:bg-status-rejected-bg hover:text-status-rejected"
          >
            <LogOut size={17} strokeWidth={2.2} />
            Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
