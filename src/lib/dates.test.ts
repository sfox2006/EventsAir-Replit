import { describe, it, expect } from "vitest";
import {
  dateOrdinal,
  durationDays,
  durationLabel,
  referenceDate,
  dateStatus,
  dateRange,
} from "./dates";
describe("calendar arithmetic and demo clock", () => {
  it("uses date difference, including zero-day events", () => {
    expect(durationDays("2026-05-22", "2026-05-24")).toBe(2);
    expect(durationLabel("2026-09-15", "2026-09-15")).toBe("0 day");
    expect(durationLabel("2026-03-15", "2026-03-16")).toBe("1 day");
  });
  it("rejects nonexistent and reversed dates", () => {
    for (const s of ["2026-02-29", "2026-13-01", "2026-04-31", "x"])
      expect(() => dateOrdinal(s)).toThrow();
    expect(() => durationDays("2026-05-24", "2026-05-22")).toThrow();
    expect(dateOrdinal("2024-02-29")).toBeTypeOf("number");
  });
  it("matches reference statuses and progress boundaries", () => {
    expect(dateStatus("2026-10-15", "2026-10-17", "2026-10-09")).toBe(
      "6 days to go",
    );
    expect(dateStatus("2026-05-22", "2026-05-24", "2026-10-09")).toBe(
      "Ended 138 days ago",
    );
    expect(dateStatus("2026-10-15", "2026-10-17", "2026-10-17")).toBe(
      "In progress",
    );
  });
  it("converts a live instant to event calendar date", () => {
    const now = new Date("2026-10-08T18:30:00Z");
    expect(referenceDate("Australia/Brisbane", "live", now)).toBe("2026-10-09");
    expect(referenceDate("America/New_York", "live", now)).toBe("2026-10-08");
    expect(referenceDate("Australia/Brisbane", "2026-10-09", now)).toBe(
      "2026-10-09",
    );
    expect(() => referenceDate("UTC", "2026-02-29")).toThrow();
  });
  it("formats same-day and cross-year dates", () => {
    expect(dateRange("2026-05-22", "2026-05-24")).toBe("May 22 - May 24, 2026");
    expect(dateRange("2026-12-31", "2027-01-01")).toBe(
      "Dec 31, 2026 - Jan 1, 2027",
    );
    expect(dateRange("2026-09-15", "2026-09-15")).toBe("Sep 15, 2026");
  });
});
