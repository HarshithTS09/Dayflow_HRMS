import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { Alert } from "../components/ui/Feedback";
import Logo from "../components/ui/Logo";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === "hr" ? "/hr" : "/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex justify-center">
            <Logo size={44} />
          </div>
          <h1 className="font-display text-2xl font-extrabold text-ink-900">Welcome back</h1>
          <p className="mt-1 text-sm text-ink-500">Every workday, perfectly aligned.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-ink-100 bg-paper-raised p-6 shadow-sm">
          {error && <Alert>{error}</Alert>}
          <Input
            id="email"
            type="email"
            label="Email"
            placeholder="you@dayflow.demo"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            id="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
            {submitting ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink-500">
          New to Dayflow?{" "}
          <Link to="/register" className="font-semibold text-ink-900 hover:underline">
            Create an account
          </Link>
        </p>

        <div className="mt-6 rounded-xl border border-dashed border-ink-300 p-3.5 text-center text-xs text-ink-500">
          Demo: <span className="font-mono">hr@dayflow.demo</span> /{" "}
          <span className="font-mono">employee@dayflow.demo</span> — password{" "}
          <span className="font-mono">Password123!</span>
        </div>
      </div>
    </div>
  );
}
