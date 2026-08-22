import { useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import { useAuth } from "../context/AuthContext";
import * as employeeService from "../services/employeeService";

export default function Profile() {
  const { user, employee, refresh } = useAuth();
  const [form, setForm] = useState({
    phone: employee?.phone || "",
    address: employee?.address || "",
  });
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!employee) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      await employeeService.updateEmployee(employee._id, form);
      await refresh();
      setSuccess("Profile updated");
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Profile</h1>
        <p className="text-sm text-ink-500">Your personal and job details.</p>
      </div>

      {success && <Alert variant="success">{success}</Alert>}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-pulse-50 font-display text-2xl font-bold text-pulse-600">
              {employee.fullName.slice(0, 2).toUpperCase()}
            </div>
            <p className="font-display text-lg font-bold text-ink-900">{employee.fullName}</p>
            <p className="text-sm text-ink-500">{employee.designation}</p>
            <p className="mt-1 text-xs text-ink-500">{user.employeeId}</p>
          </div>
        </Card>

        <Card
          title="Personal details"
          className="md:col-span-2"
          action={
            !editing && (
              <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )
          }
        >
          {editing ? (
            <form onSubmit={handleSave} className="space-y-4">
              {error && <Alert>{error}</Alert>}
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
              <div className="flex gap-2">
                <Button type="submit" variant="accent" disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <Field label="Email" value={user.email} />
              <Field label="Employee ID" value={user.employeeId} />
              <Field label="Phone" value={employee.phone || "Not set"} />
              <Field label="Address" value={employee.address || "Not set"} />
              <Field label="Department" value={employee.department} />
              <Field
                label="Date of joining"
                value={new Date(employee.dateOfJoining).toLocaleDateString()}
              />
            </dl>
          )}
        </Card>
      </div>
    </div>
  );
}

function Field({ label, value }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink-900">{value}</dd>
    </div>
  );
}
