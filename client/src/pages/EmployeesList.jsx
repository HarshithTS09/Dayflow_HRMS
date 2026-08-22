import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Card from "../components/ui/Card";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";
import * as employeeService from "../services/employeeService";

export default function EmployeesList() {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      const data = await employeeService.getEmployees(search);
      setEmployees(data);
      setLoading(false);
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Employees</h1>
        <p className="text-sm text-ink-500">Search and manage your workforce.</p>
      </div>

      <div className="relative max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or employee ID"
          className="w-full rounded-lg border border-ink-300 bg-paper-raised py-2.5 pl-9 pr-3.5 text-sm text-ink-900 focus:border-pulse-500 focus:outline-none"
        />
      </div>

      <Card padded={false}>
        {loading ? (
          <LoadingBlock />
        ) : employees.length === 0 ? (
          <div className="p-5">
            <EmptyState title="No employees found" description="Try a different search term." />
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wide text-ink-500">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Employee ID</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Designation</th>
                <th className="px-5 py-3 font-medium">Email</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e._id} className="border-b border-ink-100 last:border-0 hover:bg-ink-100/40">
                  <td className="px-5 py-3">
                    <Link to={`/hr/employees/${e._id}`} className="font-semibold text-ink-900 hover:underline">
                      {e.fullName}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-ink-700">{e.user?.employeeId}</td>
                  <td className="px-5 py-3 text-ink-700">{e.department}</td>
                  <td className="px-5 py-3 text-ink-700">{e.designation}</td>
                  <td className="px-5 py-3 text-ink-700">{e.user?.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
