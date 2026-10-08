import type { EventRecord, Sort, Values } from "../types";
import { durationDays } from "./dates";
export const textMatches = (value: unknown, query: unknown) =>
  !query ||
  (value !== null &&
    value !== undefined &&
    String(value)
      .toLocaleLowerCase()
      .includes(String(query).trim().toLocaleLowerCase()));
export function inRange(value: unknown, from: unknown, to: unknown) {
  if (!from && !to) return true;
  if (value === undefined || value === null || value === "") return false;
  const v = String(value).toLocaleLowerCase();
  return (
    (!from || v >= String(from).toLocaleLowerCase()) &&
    (!to || v <= String(to).toLocaleLowerCase())
  );
}
export function validateRanges(f: Values) {
  for (const key of Object.keys(f)) {
    if (
      key.endsWith("From") &&
      f[key] &&
      f[key.replace(/From$/, "To")] &&
      String(f[key]).toLocaleLowerCase() >
        String(f[key.replace(/From$/, "To")]).toLocaleLowerCase()
    )
      throw new Error("From must not be after To");
  }
}
export function filterEvents(
  events: EventRecord[],
  filter: Values = {},
  search = "",
  view = "all",
  period = "2026-10",
) {
  return events.filter(
    (e) =>
      (filter.includeArchived || !e.archived) &&
      textMatches(e.name, search) &&
      ["name", "city", "state", "country", "uniqueCode"].every((k) =>
        textMatches(e[k as keyof EventRecord], filter[k]),
      ) &&
      inRange(e.startDate, filter.startDateFrom, filter.startDateTo) &&
      inRange(e.endDate, filter.endDateFrom, filter.endDateTo) &&
      (view === "all" ||
        e.startDate.startsWith(view === "year" ? period.slice(0, 4) : period)),
  );
}
export function sortEvents(rows: EventRecord[], sort: Sort, view = "all") {
  return [...rows].sort((a, b) => {
    if (!sort)
      return (
        Number(b.favorite) - Number(a.favorite) ||
        (view === "all" ? 0 : a.startDate.localeCompare(b.startDate)) ||
        a.seedOrder - b.seedOrder
      );
    const value = (e: EventRecord) =>
      sort.field === "duration"
        ? durationDays(e.startDate, e.endDate)
        : sort.field === "favorite"
          ? Number(e.favorite)
          : sort.field === "alerts"
            ? ""
            : e[sort.field as keyof EventRecord];
    const av = value(a),
      bv = value(b);
    const result =
      typeof av === "number" && typeof bv === "number"
        ? av - bv
        : String(av).localeCompare(String(bv));
    return (
      (sort.direction === "asc" ? result : -result) || a.seedOrder - b.seedOrder
    );
  });
}
export function paginate<T>(rows: T[], page: number, size = 50) {
  return rows.slice((page - 1) * size, page * size);
}
