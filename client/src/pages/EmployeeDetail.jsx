import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Alert, LoadingBlock } from "../components/ui/Feedback";
import * as employeeService from "../services/employeeService";

export default function EmployeeDetail() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    setLoading(true);
    const data = await employeeService.getEmployeeById(id);
    setEmployee(data);
    setForm({
      fullName: data.fullName,
      designation: data.designation,
      department: data.department,
      phone: data.phone || "",
      address: data.address || "",
      salaryStructure: { ...data.salaryStructure },
    });
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await employeeService.updateEmployee(id, form);
      setSuccess("Employee details updated");
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <LoadingBlock label="Loading employee..." />;

  return (
    <div className="space-y-6">
      <Link to="/hr/employees" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ArrowLeft size={15} /> Back to employees
      </Link>

      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">{employee.fullName}</h1>
        <p className="text-sm text-ink-500">{employee.user?.email} · {employee.user?.employeeId}</p>
      </div>

      {success && <Alert variant="success">{success}</Alert>}

      <form onSubmit={handleSave} className="grid gap-6 lg:grid-cols-2">
        {error && (
          <div className="lg:col-span-2">
            <Alert>{error}</Alert>
          </div>
        )}

        <Card title="Job details">
          <div className="space-y-4">
            <Input
              id="fullName"
              label="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
            <Input
              id="designation"
              label="Designation"
              value={form.designation}
              onChange={(e) => setForm({ ...form, designation: e.target.value })}
            />
            <Input
              id="department"
              label="Department"
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
            />
            <Input
              id="phone"
              label="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <Input
              id="address"
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </div>
        </Card>

        <Card title="Salary structure">
          <div className="space-y-4">
            {["basic", "hra", "allowances", "deductions"].map((field) => (
              <Input
                key={field}
                id={field}
                type="number"
                label={field[0].toUpperCase() + field.slice(1)}
                value={form.salaryStructure[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salaryStructure: {
                      ...form.salaryStructure,
                      [field]: Number(e.target.value),
                    },
                  })
                }
              />
            ))}
          </div>
        </Card>

        <div className="lg:col-span-2">
          <Button type="submit" variant="accent" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
