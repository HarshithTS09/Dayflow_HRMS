import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { Alert, LoadingBlock, EmptyState } from "../components/ui/Feedback";
import LeaveTimeline from "../components/leave/LeaveTimeline";
import * as leaveService from "../services/leaveService";

const LEAVE_TYPES = [
  { value: "paid", label: "Paid leave" },
  { value: "sick", label: "Sick leave" },
  { value: "unpaid", label: "Unpaid leave" },
];

const emptyForm = { leaveType: "paid", startDate: "", endDate: "", remarks: "" };

export default function Leave() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await leaveService.getMyLeaves();
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.startDate || !form.endDate) {
      setError("Please select both a start and end date");
      return;
    }
    if (new Date(form.endDate) < new Date(form.startDate)) {
      setError("End date cannot be before start date");
      return;
    }
    setSubmitting(true);
    try {
      await leaveService.applyLeave(form);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit leave request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Leave</h1>
        <p className="text-sm text-ink-500">Apply for time off and track approval status.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card title="Apply for leave" className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Select
              id="leaveType"
              label="Leave type"
              value={form.leaveType}
              onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              options={LEAVE_TYPES}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                id="startDate"
                type="date"
                label="Start date"
                required
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <Input
                id="endDate"
                type="date"
                label="End date"
                required
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="remarks" className="mb-1.5 block text-sm font-medium text-ink-700">
                Remarks
              </label>
              <textarea
                id="remarks"
                rows={3}
                className="w-full rounded-lg border border-ink-300 bg-paper-raised px-3.5 py-2.5 text-sm text-ink-900 focus:border-pulse-500 focus:outline-none"
                value={form.remarks}
                onChange={(e) => setForm({ ...form, remarks: e.target.value })}
                placeholder="Optional context for HR"
              />
            </div>
            <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
              {submitting ? "Submitting..." : "Submit request"}
            </Button>
          </form>
        </Card>

        <Card title="Request history" className="lg:col-span-3" padded={false}>
          {loading ? (
            <div className="p-5">
              <LoadingBlock />
            </div>
          ) : leaves.length === 0 ? (
            <div className="p-5">
              <EmptyState title="No leave requests yet" description="Submit your first request using the form." />
            </div>
          ) : (
            <ul className="divide-y divide-ink-100">
              {leaves.map((l) => (
                <li key={l._id} className="space-y-3 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold capitalize text-ink-900">
                        {l.leaveType} leave · {l.days} {l.days === 1 ? "day" : "days"}
                      </p>
                      <p className="text-xs text-ink-500">
                        {new Date(l.startDate).toLocaleDateString()} —{" "}
                        {new Date(l.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={l.status} />
                  </div>
                  <LeaveTimeline status={l.status} />
                  {l.hrComment && (
                    <p className="rounded-lg bg-ink-100/60 px-3 py-2 text-xs text-ink-700">
                      <span className="font-semibold">HR comment: </span>
                      {l.hrComment}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
