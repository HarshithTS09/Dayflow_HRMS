import { useMemo } from "react";

// The workday window used to compute ring progress. 9:00 to 18:00 = 9 hours.
const WORKDAY_START_HOUR = 9;
const WORKDAY_HOURS = 9;

function computeProgress(checkIn, checkOut) {
  if (!checkIn) return 0;
  const now = checkOut ? new Date(checkOut) : new Date();
  const start = new Date(checkIn);
  const elapsedHours = (now - start) / (1000 * 60 * 60);
  return Math.min(1, Math.max(0, elapsedHours / WORKDAY_HOURS));
}

const STATE_COPY = {
  "not-started": { label: "Not checked in", sub: "Your day hasn't started yet" },
  live: { label: "Workday in progress", sub: "You're checked in" },
  done: { label: "Workday complete", sub: "You've checked out" },
};

export default function WorkdayPulseRing({ checkIn, checkOut }) {
  const state = !checkIn ? "not-started" : checkOut ? "done" : "live";
  const progress = useMemo(() => computeProgress(checkIn, checkOut), [checkIn, checkOut]);

  const size = 168;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference * progress;

  const ringColor =
    state === "not-started"
      ? "var(--color-ink-300)"
      : state === "live"
      ? "var(--color-pulse-500)"
      : "var(--color-status-present)";

  const timeLabel = checkIn
    ? new Date(checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "--:--";

  return (
    <div className="flex items-center gap-5">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-ink-100)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeDasharray={`${dash} ${circumference}`}
            strokeLinecap="round"
            style={{ transition: "stroke-dasharray 500ms ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {state === "live" && (
            <span className="relative mb-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pulse-500 opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-pulse-500" />
            </span>
          )}
          <span className="font-display text-2xl font-extrabold text-ink-900">{timeLabel}</span>
          <span className="text-xs text-ink-500">check-in</span>
        </div>
      </div>
      <div>
        <p className="font-display text-lg font-bold text-ink-900">{STATE_COPY[state].label}</p>
        <p className="text-sm text-ink-500">{STATE_COPY[state].sub}</p>
        {checkOut && (
          <p className="mt-1 text-sm text-ink-500">
            Checked out at{" "}
            {new Date(checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        )}
      </div>
    </div>
  );
}
