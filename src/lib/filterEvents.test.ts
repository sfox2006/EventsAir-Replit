import { describe, it, expect } from "vitest";
import { events } from "../data/events";
import {
  filterEvents,
  sortEvents,
  paginate,
  validateRanges,
} from "./filterEvents";
describe("Home filtering, order and pagination", () => {
  it("includes both kinds and searches name only", () => {
    expect(filterEvents(events)).toHaveLength(7);
    expect(filterEvents(events, {}, " cONSILIUM ".trim())).toHaveLength(2);
    expect(filterEvents(events, {}, "Sydney")).toHaveLength(0);
  });
  it("combines inclusive date and text constraints", () => {
    expect(
      filterEvents(events, {
        name: "Consilium",
        startDateFrom: "2026-10-15",
        startDateTo: "2026-10-15",
      }).map((x) => x.id),
    ).toEqual(["consilium26"]);
    expect(
      filterEvents(events, { name: "Consilium", country: "Australia" }),
    ).toHaveLength(0);
    expect(() =>
      validateRanges({
        startDateFrom: "2026-10-16",
        startDateTo: "2026-10-15",
      }),
    ).toThrow();
  });
  it("selects start-date periods", () => {
    expect(filterEvents(events, {}, "", "month", "2026-09")).toHaveLength(1);
    expect(filterEvents(events, {}, "", "year", "2026-10")).toHaveLength(7);
  });
  it("excludes archived unless requested", () => {
    const rows = events.map((e) => ({ ...e, archived: e.id === "ls26" }));
    expect(filterEvents(rows)).toHaveLength(6);
    expect(filterEvents(rows, { includeArchived: true })).toHaveLength(7);
  });
  it("explicit sort overrides favorites, otherwise preserves defaults", () => {
    expect(sortEvents(events, null)[0].id).toBe("ls26");
    expect(sortEvents(events, { field: "name", direction: "asc" })[0].id).toBe(
      "cis-test",
    );
    expect(sortEvents(events, null, "year")[1].id).toBe("liberty-list");
    expect(
      sortEvents(events, { field: "duration", direction: "asc" })[0].id,
    ).toBe("gala");
  });
  it("paginates filtered results and empty sets", () => {
    expect(
      paginate(filterEvents(events, { name: "Consilium" }), 1, 1),
    ).toHaveLength(1);
    expect(
      paginate(filterEvents(events, { name: "Consilium" }), 2, 1)[0].id,
    ).toBe("consilium-list");
    expect(paginate(filterEvents(events, { name: "absent" }), 1)).toEqual([]);
  });
});
