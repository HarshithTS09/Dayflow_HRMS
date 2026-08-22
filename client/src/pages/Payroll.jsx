import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { LoadingBlock, EmptyState } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import * as payrollService from "../services/payrollService";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
    n || 0
  );

export default function Payroll() {
  const { user, employee } = useAuth();
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await payrollService.getMyPayroll();
      setRecords(data);
      setSelected(data[0] || null);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return <LoadingBlock label="Loading payroll..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Payroll</h1>
        <p className="text-sm text-ink-500">Your salary details are read-only.</p>
      </div>

      {records.length === 0 ? (
        <Card>
          <EmptyState
            title="No payroll records yet"
            description="HR hasn't generated a payslip for you yet. Check back after the next pay cycle."
          />
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Pay periods" className="lg:col-span-1" padded={false}>
            <ul className="divide-y divide-ink-100">
              {records.map((r) => (
                <li key={r._id}>
                  <button
                    onClick={() => setSelected(r)}
                    className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-sm transition-colors ${
                      selected?._id === r._id ? "bg-pulse-50" : "hover:bg-ink-100/60"
                    }`}
                  >
                    <span className="font-medium text-ink-900">{r.payPeriod}</span>
                    <span className="text-ink-500">{currency(r.netSalary)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          {selected && (
            <Card className="lg:col-span-2" padded={false}>
              <div className="border-b border-ink-100 px-6 py-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-lg font-bold text-ink-900">Salary slip</p>
                    <p className="text-sm text-ink-500">Pay period: {selected.payPeriod}</p>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => window.print()}>
                    Download / Print
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 px-6 py-5 text-sm">
                <Field label="Employee name" value={employee?.fullName} />
                <Field label="Employee ID" value={user?.employeeId} />
                <Field label="Designation" value={employee?.designation} />
                <Field label="Department" value={employee?.department} />
              </div>

              <div className="grid grid-cols-2 divide-x divide-ink-100 border-t border-ink-100">
                <div className="px-6 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Earnings
                  </p>
                  <Line label="Basic" value={selected.earnings.basic} />
                  <Line label="HRA" value={selected.earnings.hra} />
                  <Line label="Allowances" value={selected.earnings.allowances} />
                </div>
                <div className="px-6 py-5">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink-500">
                    Deductions
                  </p>
                  <Line label="Tax" value={selected.deductions.tax} />
                  <Line label="Provident fund" value={selected.deductions.providentFund} />
                  <Line label="Other" value={selected.deductions.other} />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-ink-100 bg-ink-100/40 px-6 py-4">
                <span className="font-display text-sm font-bold text-ink-900">Net salary</span>
                <span className="font-display text-lg font-extrabold text-status-present">
                  {currency(selected.netSalary)}
                </span>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-ink-500">{label}</p>
      <p className="font-medium text-ink-900">{value}</p>
    </div>
  );
}

function Line({ label, value }) {
  return (
    <div className="mb-1.5 flex items-center justify-between text-sm">
      <span className="text-ink-700">{label}</span>
      <span className="font-medium text-ink-900">{currency(value)}</span>
    </div>
  );
}
