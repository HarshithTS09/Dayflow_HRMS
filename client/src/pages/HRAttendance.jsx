import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import StatusBadge from "../components/ui/StatusBadge";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";
import * as attendanceService from "../services/attendanceService";
import * as employeeService from "../services/employeeService";

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—");

export default function HRAttendance() {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({ date: todayISO(), status: "", employee: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getEmployees().then(setEmployees);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const params = {};
      if (filters.date) params.date = filters.date;
      if (filters.status) params.status = filters.status;
      if (filters.employee) params.employee = filters.employee;
      const data = await attendanceService.getAllAttendance(params);
      setRecords(data);
      setLoading(false);
    };
    load();
  }, [filters]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Attendance</h1>
        <p className="text-sm text-ink-500">Company-wide attendance records.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Select
          id="employee"
          label="Employee"
          value={filters.employee}
          onChange={(e) => setFilters({ ...filters, employee: e.target.value })}
          options={[{ value: "", label: "All employees" }, ...employees.map((e) => ({ value: e._id, label: e.fullName }))]}
        />
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-medium text-ink-700">Date</label>
          <input
            id="date"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
            className="w-full rounded-lg border border-ink-300 bg-paper-raised px-3.5 py-2.5 text-sm text-ink-900 focus:border-pulse-500 focus:outline-none"
          />
        </div>
        <Select
          id="status"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: "", label: "All statuses" },
            { value: "present", label: "Present" },
            { value: "absent", label: "Absent" },
            { value: "half-day", label: "Half-day" },
            { value: "leave", label: "Leave" },
          ]}
        />
      </div>

      <Card padded={false}>
        {loading ? (
          <LoadingBlock />
        ) : records.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No records found" description="Try adjusting the filters above." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3 font-medium">Employee</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Check-in</th>
                <th className="px-5 py-3 font-medium">Check-out</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-b border-ink-100 last:border-0">
                  <td className="px-5 py-3 font-medium text-ink-900">{r.employee?.fullName}</td>
                  <td className="px-5 py-3 text-ink-700">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-ink-700">{fmtTime(r.checkIn)}</td>
                  <td className="px-5 py-3 text-ink-700">{fmtTime(r.checkOut)}</td>
                  <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
