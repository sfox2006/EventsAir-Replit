import type { Store } from "../types";
import { events } from "../data/events";
import { durationDays } from "./dates";
export const STORAGE_KEY = "eventsair-demo-v1";
export const initialStore = (): Store => ({
  version: 1,
  events: structuredClone(events),
  sort: null,
  presets: {},
  askHelp: true,
  recents: ["ls26", "ls26-workshop", "cis-test"],
});
function validValues(value: unknown): boolean {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every(
      (v) =>
        typeof v === "string" ||
        typeof v === "boolean" ||
        (Array.isArray(v) && v.every((item) => typeof item === "string")),
    )
  );
}
export function readStore(): { store: Store; blocked: boolean } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { store: initialStore(), blocked: false };
    const s = JSON.parse(raw);
    if (
      s.version !== 1 ||
      !Array.isArray(s.events) ||
      !Object.values(s.presets || {}).every(validValues) ||
      typeof s.presets !== "object" ||
      s.presets === null ||
      Array.isArray(s.presets) ||
      !Array.isArray(s.recents) ||
      !s.recents.every((id: unknown) => typeof id === "string") ||
      typeof s.askHelp !== "boolean"
    )
      throw new Error("Unsupported store");
    for (const e of s.events) {
      if (
        Object.entries(events[0]).some(
          ([key, value]) =>
            !["widgets", "preferences", "modules"].includes(key) &&
            typeof e[key] !== typeof value,
        ) ||
        typeof e.id !== "string" ||
        typeof e.name !== "string" ||
        !Array.isArray(e.widgets) ||
        !Array.isArray(e.modules) ||
        !validValues(e.preferences) ||
        !["Event", "Contact Store"].includes(e.kind)
      )
        throw new Error("Invalid event");
      durationDays(e.startDate, e.endDate);
      new Intl.DateTimeFormat("en-US", { timeZone: e.timeZone });
      for (const w of e.widgets)
        if (
          !["Contacts", "Links", "Event Information"].includes(w.kind) ||
          typeof w.title !== "string" ||
          !validValues(w.filter) ||
          typeof w.id !== "string" ||
          typeof w.order !== "number"
        )
          throw new Error("Invalid widget");
    }
    if (
      s.sort &&
      (!["asc", "desc"].includes(s.sort.direction) ||
        ![
          "favorite",
          "name",
          "startDate",
          "duration",
          "locationDisplay",
          "alerts",
          "kind",
        ].includes(s.sort.field))
    )
      throw new Error("Invalid sort");
    return { store: s, blocked: false };
  } catch (error) {
    return { store: initialStore(), blocked: error instanceof DOMException };
  }
}
export function writeStore(store: Store) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}
