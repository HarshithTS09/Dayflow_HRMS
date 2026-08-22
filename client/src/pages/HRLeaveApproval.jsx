import { useEffect, useState } from "react";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import StatusBadge from "../components/ui/StatusBadge";
import { LoadingBlock, EmptyState, Alert } from "../components/ui/Feedback";
import LeaveTimeline from "../components/leave/LeaveTimeline";
import * as leaveService from "../services/leaveService";

export default function HRLeaveApproval() {
  const [leaves, setLeaves] = useState([]);
  const [filters, setFilters] = useState({ status: "pending", leaveType: "" });
  const [loading, setLoading] = useState(true);
  const [commentDrafts, setCommentDrafts] = useState({});
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const params = {};
    if (filters.status) params.status = filters.status;
    if (filters.leaveType) params.leaveType = filters.leaveType;
    const data = await leaveService.getAllLeaves(params);
    setLeaves(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDecision = async (id, decision) => {
    setError("");
    setBusyId(id);
    try {
      const comment = commentDrafts[id] || "";
      if (decision === "approve") await leaveService.approveLeave(id, comment);
      else await leaveService.rejectLeave(id, comment);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update the request");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-ink-900">Leave approvals</h1>
        <p className="text-sm text-ink-500">Review and act on employee leave requests.</p>
      </div>

      {error && <Alert>{error}</Alert>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md">
        <Select
          id="status"
          label="Status"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          options={[
            { value: "", label: "All statuses" },
            { value: "pending", label: "Pending" },
            { value: "approved", label: "Approved" },
            { value: "rejected", label: "Rejected" },
          ]}
        />
        <Select
          id="leaveType"
          label="Leave type"
          value={filters.leaveType}
          onChange={(e) => setFilters({ ...filters, leaveType: e.target.value })}
          options={[
            { value: "", label: "All types" },
            { value: "paid", label: "Paid" },
            { value: "sick", label: "Sick" },
            { value: "unpaid", label: "Unpaid" },
          ]}
        />
      </div>

      {loading ? (
        <LoadingBlock />
      ) : leaves.length === 0 ? (
        <Card>
          <EmptyState title="No leave requests" description="Nothing matches the selected filters." />
        </Card>
      ) : (
        <div className="space-y-4">
          {leaves.map((l) => (
            <Card key={l._id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-base font-bold text-ink-900">
                    {l.employee?.fullName}{" "}
                    <span className="font-normal text-ink-500">({l.employee?.user?.employeeId})</span>
                  </p>
                  <p className="text-sm capitalize text-ink-700">
                    {l.leaveType} leave · {l.days} {l.days === 1 ? "day" : "days"}
                  </p>
                  <p className="text-xs text-ink-500">
                    {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                  </p>
                  {l.remarks && <p className="mt-2 text-sm text-ink-700">"{l.remarks}"</p>}
                </div>
                <StatusBadge status={l.status} />
              </div>

              <div className="mt-4">
                <LeaveTimeline status={l.status} />
              </div>

              {l.status === "pending" ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <input
                    placeholder="Add a comment (optional)"
                    value={commentDrafts[l._id] || ""}
                    onChange={(e) => setCommentDrafts({ ...commentDrafts, [l._id]: e.target.value })}
                    className="min-w-[220px] flex-1 rounded-lg border border-ink-300 bg-paper-raised px-3.5 py-2 text-sm text-ink-900 focus:border-pulse-500 focus:outline-none"
                  />
                  <Button
                    size="sm"
                    variant="success"
                    disabled={busyId === l._id}
                    onClick={() => handleDecision(l._id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busyId === l._id}
                    onClick={() => handleDecision(l._id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              ) : (
                l.hrComment && (
                  <p className="mt-4 rounded-lg bg-ink-100/60 px-3 py-2 text-xs text-ink-700">
                    <span className="font-semibold">HR comment: </span>
                    {l.hrComment}
                  </p>
                )
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
