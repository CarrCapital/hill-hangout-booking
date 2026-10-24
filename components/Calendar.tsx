"use client";

import { useMemo, useState } from "react";

export type DateRange = { from: string | null; to: string | null };

export type BlockedRange = {
  check_in: string;
  check_out: string;
  kind?: "request" | "block";
};

type Props = {
  value: DateRange;
  onChange: (r: DateRange) => void;
  blocked: BlockedRange[];
  minimumNights: number;
  months?: number;
  minDate?: string; // inclusive
};

function iso(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function parseIso(s: string): Date {
  return new Date(s + "T00:00:00");
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

function addMonths(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(1);
  c.setMonth(c.getMonth() + n);
  return c;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function dayInRange(day: string, from: string, to: string): boolean {
  return day >= from && day < to;
}

function rangeOverlapsBlocked(
  from: string,
  to: string,
  blocked: BlockedRange[],
): boolean {
  return blocked.some((b) => from < b.check_out && to > b.check_in);
}

// Return the set of blocked day strings as a Set, for fast lookup. A booking
// occupies [check_in, check_out) nights, so the checkout day itself is NOT
// blocked.
function blockedDaySet(blocked: BlockedRange[]): Set<string> {
  const out = new Set<string>();
  for (const b of blocked) {
    let d = parseIso(b.check_in);
    const end = parseIso(b.check_out);
    while (d < end) {
      out.add(iso(d));
      d = addDays(d, 1);
    }
  }
  return out;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export default function Calendar({
  value,
  onChange,
  blocked,
  minimumNights,
  months = 2,
  minDate,
}: Props) {
  const [cursor, setCursor] = useState(() => {
    const d = value.from ? parseIso(value.from) : new Date();
    d.setDate(1);
    return d;
  });

  const blockedSet = useMemo(() => blockedDaySet(blocked), [blocked]);
  const todayIso = iso(new Date());
  const floor = minDate && minDate > todayIso ? minDate : todayIso;

  function pickDay(dayIso: string) {
    const { from, to } = value;
    // No from, or both from+to picked → start a new range.
    if (!from || to) {
      onChange({ from: dayIso, to: null });
      return;
    }
    // Second click.
    if (dayIso <= from) {
      // Earlier or equal → restart with new start.
      onChange({ from: dayIso, to: null });
      return;
    }
    // Check minimum nights and no blocked overlap.
    const nights = Math.round(
      (parseIso(dayIso).getTime() - parseIso(from).getTime()) / 86400000,
    );
    if (nights < minimumNights) {
      // Snap to the min night out.
      const snap = iso(addDays(parseIso(from), minimumNights));
      if (rangeOverlapsBlocked(from, snap, blocked)) {
        onChange({ from: dayIso, to: null });
        return;
      }
      onChange({ from, to: snap });
      return;
    }
    if (rangeOverlapsBlocked(from, dayIso, blocked)) {
      // Range crosses a blocked day; restart.
      onChange({ from: dayIso, to: null });
      return;
    }
    onChange({ from, to: dayIso });
  }

  function renderMonth(firstOfMonth: Date) {
    const monthLabel = `${MONTH_NAMES[firstOfMonth.getMonth()]} ${firstOfMonth.getFullYear()}`;
    const firstWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(
      firstOfMonth.getFullYear(),
      firstOfMonth.getMonth() + 1,
      0,
    ).getDate();

    const cells: Array<{
      day: number;
      iso: string;
      inPast: boolean;
      isBlocked: boolean;
      isFrom: boolean;
      isTo: boolean;
      inRange: boolean;
    } | null> = [];
    for (let i = 0; i < firstWeekday; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(
        firstOfMonth.getFullYear(),
        firstOfMonth.getMonth(),
        d,
      );
      const dIso = iso(date);
      const inPast = dIso < floor;
      const isBlocked = blockedSet.has(dIso);
      const isFrom = Boolean(value.from && value.from === dIso);
      const isTo = Boolean(value.to && value.to === dIso);
      const inRange = Boolean(
        value.from &&
          value.to &&
          dayInRange(dIso, value.from, value.to),
      );
      cells.push({ day: d, iso: dIso, inPast, isBlocked, isFrom, isTo, inRange });
    }

    return (
      <div className="cal-month" key={monthLabel}>
        <div className="cal-head">{monthLabel}</div>
        <div className="cal-grid cal-dow">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="cal-dow-cell">
              {w}
            </div>
          ))}
        </div>
        <div className="cal-grid">
          {cells.map((c, i) =>
            c === null ? (
              <div key={i} className="cal-cell empty" />
            ) : (
              <button
                type="button"
                key={i}
                onClick={() => !c.inPast && !c.isBlocked && pickDay(c.iso)}
                className={[
                  "cal-cell",
                  c.inPast ? "past" : "",
                  c.isBlocked ? "blocked" : "",
                  c.isFrom ? "from" : "",
                  c.isTo ? "to" : "",
                  c.inRange ? "in-range" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={c.inPast || c.isBlocked}
                aria-label={c.iso}
              >
                {c.day}
              </button>
            ),
          )}
        </div>
      </div>
    );
  }

  const monthEls = [];
  for (let i = 0; i < months; i++) {
    monthEls.push(renderMonth(addMonths(cursor, i)));
  }

  return (
    <div className="cal-root">
      <div className="cal-nav">
        <button
          type="button"
          className="cal-nav-btn"
          onClick={() => setCursor(addMonths(cursor, -1))}
          aria-label="Previous month"
        >
          ‹
        </button>
        <div className="cal-nav-note">
          Pick check-in, then check-out. Blocked days are greyed out.
        </div>
        <button
          type="button"
          className="cal-nav-btn"
          onClick={() => setCursor(addMonths(cursor, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>
      <div className="cal-months">{monthEls}</div>
      <style jsx>{`
        .cal-root { border: 1px solid var(--line); padding: 1rem; }
        .cal-nav {
          display: flex; align-items: center; gap: 1rem;
          margin: 0 0 .9rem;
        }
        .cal-nav-note {
          flex: 1; text-align: center;
          font-size: .78rem; color: var(--ink3);
          letter-spacing: .03em;
        }
        .cal-nav-btn {
          border: 1px solid var(--line); background: transparent;
          color: var(--ink2); width: 1.9rem; height: 1.9rem;
          border-radius: 50%; cursor: pointer; font-size: 1.1rem;
          line-height: 1;
        }
        .cal-nav-btn:hover { color: var(--ink); border-color: var(--ink3); }
        .cal-months {
          display: grid; grid-template-columns: 1fr; gap: 1.3rem;
        }
        @media (min-width: 36rem) {
          .cal-months { grid-template-columns: 1fr 1fr; gap: 1.6rem; }
        }
        .cal-month { }
        .cal-head {
          font-family: "Newsreader", serif; font-size: 1.02rem;
          margin: 0 0 .55rem; letter-spacing: -.01em;
        }
        .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); }
        .cal-dow { color: var(--ink3); margin-bottom: .2rem; }
        .cal-dow-cell {
          font-size: .66rem; text-align: center; padding: .3rem 0;
          letter-spacing: .08em;
        }
        .cal-cell {
          height: 2.2rem; border: 0; background: transparent;
          color: var(--ink); font-family: inherit; font-size: .88rem;
          cursor: pointer; border-radius: 0;
          display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .cal-cell.empty { visibility: hidden; }
        .cal-cell:hover:not(:disabled):not(.in-range):not(.from):not(.to) {
          background: var(--paper2);
        }
        .cal-cell.past, .cal-cell.blocked {
          color: var(--ink3); text-decoration: line-through;
          cursor: not-allowed; opacity: .55;
        }
        .cal-cell.in-range {
          background: color-mix(in srgb, var(--accent) 25%, var(--paper));
        }
        .cal-cell.from, .cal-cell.to {
          background: var(--ink); color: var(--paper);
        }
      `}</style>
    </div>
  );
}
