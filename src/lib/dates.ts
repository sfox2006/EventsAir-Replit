export function dateOrdinal(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new Error("Use a valid YYYY-MM-DD date");
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(0);
  date.setUTCFullYear(y, m - 1, d);
  date.setUTCHours(0, 0, 0, 0);
  if (
    y < 100 ||
    date.getUTCFullYear() !== y ||
    date.getUTCMonth() !== m - 1 ||
    date.getUTCDate() !== d
  )
    throw new Error("Invalid calendar date");
  return date.getTime() / 86400000;
}
export function durationDays(start: string, end: string) {
  const n = dateOrdinal(end) - dateOrdinal(start);
  if (n < 0) throw new Error("End date cannot precede start date");
  return n;
}
export const durationLabel = (start: string, end: string) => {
  const n = durationDays(start, end);
  return `${n} ${n > 1 ? "days" : "day"}`;
};
export function referenceDate(
  timeZone: string,
  value = import.meta.env.VITE_REFERENCE_DATE || "2026-10-09",
  now = new Date(),
) {
  if (value !== "live") {
    dateOrdinal(value);
    return value;
  }
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const p = (type: string) => parts.find((x) => x.type === type)!.value;
  return `${p("year")}-${p("month")}-${p("day")}`;
}
export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateOrdinal(value) * 86400000));
export function dateRange(start: string, end: string) {
  if (start === end) return formatDate(start);
  const a = formatDate(start),
    b = formatDate(end);
  return start.slice(0, 4) === end.slice(0, 4)
    ? `${a.replace(/, \d{4}$/, "")} - ${b}`
    : `${a} - ${b}`;
}
export function dateStatus(start: string, end: string, today: string) {
  const t = dateOrdinal(today),
    s = dateOrdinal(start),
    e = dateOrdinal(end);
  return t < s
    ? `${s - t} days to go`
    : t > e
      ? `Ended ${t - e} days ago`
      : "In progress";
}
export const addDays = (value: string, n: number) =>
  new Date((dateOrdinal(value) + n) * 86400000).toISOString().slice(0, 10);
export const timeLabel = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};
