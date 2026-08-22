import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Alert, LoadingBlock, EmptyState } from "../components/ui/Feedback";
import * as payrollService from "../services/payrollService";
import * as employeeService from "../services/employeeService";

const currency = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);

const currentPeriod = () => new Date().toISOString().slice(0, 7);

const emptyForm = {
  payPeriod: currentPeriod(),
  earnings: { basic: 0, hra: 0, allowances: 0 },
  deductions: { tax: 0, providentFund: 0, other: 0 },
};

export default function HRPayroll() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    employeeService.getEmployees().then((data) => {
      setEmployees(data);
      if (data[0]) setSelectedEmployee(data[0]._id);
    });
  }, []);

  const loadRecords = async (employeeId) => {
    if (!employeeId) return;
    setLoading(true);
    const data = await payrollService.getAllPayroll({ employee: employeeId });
    setRecords(data);
    setLoading(false);
  };

  useEffect(() => {
    loadRecords(selectedEmployee);
  }, [selectedEmployee]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      // Use employee id as the target: the API upserts by (employee, payPeriod)
      await payrollService.upsertPayroll(selectedEmployee, form);
      setSuccess("Payroll record saved");
      setForm(emptyForm);
      await loadRecords(selectedEmployee);
    } catch (err) {
      setError(err.response?.data?.message || "Could not save payroll record");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Payroll</h1>
        <p className="text-sm text-ink-500">Generate and review employee payroll.</p>
      </div>

      <Select
        id="employee"
        label="Employee"
        value={selectedEmployee}
        onChange={(e) => setSelectedEmployee(e.target.value)}
        options={employees.map((e) => ({ value: e._id, label: e.fullName }))}
        className="max-w-sm"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Payroll history" padded={false}>
          {loading ? (
            <LoadingBlock />
          ) : records.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No payroll records" description="Generate the first payslip using the form." />
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {records.map((r) => (
                <li key={r._id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                  <span className="font-medium text-ink-900">{r.payPeriod}</span>
                  <span className="text-ink-700">{currency(r.netSalary)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Generate / update payslip">
          <form onSubmit={handleSave} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}
            <Input
              id="payPeriod"
              label="Pay period"
              type="month"
              value={form.payPeriod}
              onChange={(e) => setForm({ ...form, payPeriod: e.target.value })}
            />
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Earnings</p>
            <div className="grid grid-cols-3 gap-3">
              {["basic", "hra", "allowances"].map((f) => (
                <Input
                  key={f}
                  id={`earn-${f}`}
                  type="number"
                  label={f[0].toUpperCase() + f.slice(1)}
                  value={form.earnings[f]}
                  onChange={(e) =>
                    setForm({ ...form, earnings: { ...form.earnings, [f]: Number(e.target.value) } })
                  }
                />
              ))}
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">Deductions</p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                id="ded-tax"
                type="number"
                label="Tax"
                value={form.deductions.tax}
                onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, tax: Number(e.target.value) } })}
              />
              <Input
                id="ded-pf"
                type="number"
                label="PF"
                value={form.deductions.providentFund}
                onChange={(e) =>
                  setForm({ ...form, deductions: { ...form.deductions, providentFund: Number(e.target.value) } })
                }
              />
              <Input
                id="ded-other"
                type="number"
                label="Other"
                value={form.deductions.other}
                onChange={(e) => setForm({ ...form, deductions: { ...form.deductions, other: Number(e.target.value) } })}
              />
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={saving || !selectedEmployee}>
              {saving ? "Saving..." : "Save payslip"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
