const STEPS_BASE = ["Applied", "Pending"];

export default function LeaveTimeline({ status }) {
  const finalStep = status === "rejected" ? "Rejected" : "Approved";
  const steps = [...STEPS_BASE, finalStep];

  const activeIndex = status === "pending" ? 1 : 2; // Applied is always complete

  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isDone = i <= activeIndex;
        const isCurrent = i === activeIndex;
        const isRejectedFinal = step === "Rejected" && isDone;
        return (
          <div key={step} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                  isRejectedFinal
                    ? "bg-status-rejected text-white"
                    : isDone
                    ? "bg-status-approved text-white"
                    : "bg-ink-100 text-ink-500"
                } ${isCurrent && !isRejectedFinal ? "ring-2 ring-status-pending ring-offset-2" : ""}`}
              >
                {i + 1}
              </div>
              <span
                className={`text-[11px] font-medium ${
                  isDone ? "text-ink-900" : "text-ink-500"
                }`}
              >
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-0.5 flex-1 ${i < activeIndex ? "bg-status-approved" : "bg-ink-100"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
