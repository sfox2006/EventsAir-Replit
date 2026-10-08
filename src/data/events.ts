import type { EventRecord } from "../types";
const rows = [
  ["ls26", "L&S26 Conference", "Event", "2026-05-22", "2026-05-24", "Sydney"],
  ["cis-test", "CIS TEST 1", "Event", "2026-03-19", "2026-03-21", "Gold Coast"],
  [
    "consilium26",
    "Consilium 2026",
    "Event",
    "2026-10-15",
    "2026-10-17",
    "Hope Island, Gold Coast",
  ],
  [
    "consilium-list",
    "Consilium List",
    "Contact Store",
    "2026-04-10",
    "2026-04-11",
    "",
  ],
  [
    "gala",
    "Gala Dinner and Lecture with Andrew Roberts",
    "Event",
    "2026-09-15",
    "2026-09-15",
    "11 Jamison St11 Jamison St, Sydney",
  ],
  [
    "ls26-workshop",
    "L&S26 Workshop",
    "Event",
    "2026-05-02",
    "2026-05-02",
    "Sydney",
  ],
  [
    "liberty-list",
    "Liberty & Society List",
    "Contact Store",
    "2026-03-15",
    "2026-03-16",
    "",
  ],
];
export const defaultModules = [
  "Registrations",
  "Agenda",
  "Functions",
  "Notes",
  "Marketing",
];
export const events: EventRecord[] = rows.map(
  ([id, name, kind, startDate, endDate, locationDisplay], seedOrder) => ({
    id,
    name,
    kind: kind as EventRecord["kind"],
    startDate,
    endDate,
    locationDisplay,
    durationEvidence: ["ls26", "consilium26"].includes(id)
      ? "observed"
      : "inferred",
    venue: "",
    city: locationDisplay.includes("Sydney") ? "Sydney" : locationDisplay,
    state: "",
    country: "",
    uniqueCode: "",
    alias: id === "ls26" ? "ls26" : "",
    timeZone: id === "consilium26" ? "Australia/Brisbane" : "Australia/Sydney",
    currency: "AUD",
    favorite: id === "ls26",
    archived: false,
    seedOrder,
    contactStoreId: id === "ls26" ? "liberty-list" : "",
    modules: defaultModules,
    preferences: { mode: "In-Person", access: "all" },
    widgets: (id === "consilium26"
      ? ["Contacts", "Links", "Event Information"]
      : ["Event Information"]
    ).map((kind, order) => ({
      id: `${id}-${order}`,
      eventId: id,
      kind: kind as "Contacts" | "Links" | "Event Information",
      title: kind,
      filter: {},
      order,
    })),
  }),
);
