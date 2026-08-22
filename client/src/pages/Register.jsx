import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import Logo from "../components/ui/Logo";

export default function Register() {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    role: "employee",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      const user = await registerUser(form);
      navigate(user.role === "hr" ? "/hr" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size={44} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Create your account</h1>
          <p className="mt-1 text-sm text-ink-500">Join Dayflow to get aligned.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-paper-raised p-6 shadow-sm">
          {error && <Alert>{error}</Alert>}
          <Input id="fullName" label="Full name" required value={form.fullName} onChange={set("fullName")} />
          <Input id="employeeId" label="Employee ID" required value={form.employeeId} onChange={set("employeeId")} placeholder="EMP001" />
          <Input id="email" type="email" label="Email" required value={form.email} onChange={set("email")} />
          <Input
            id="password"
            type="password"
            label="Password"
            required
            value={form.password}
            onChange={set("password")}
            hint="At least 6 characters"
          />
          <Select
            id="role"
            label="Role"
            value={form.role}
            onChange={set("role")}
            options={[
              { value: "employee", label: "Employee" },
              { value: "hr", label: "HR / Admin" },
            ]}
          />
          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink-900 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
