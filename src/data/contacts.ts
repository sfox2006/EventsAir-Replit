import type { Contact } from "../types";
export const creationBuckets: [string, number][] = [
  ["2026-05-11", 6],
  ["2026-05-14", 7],
  ["2026-05-18", 3],
  ["2026-05-22", 21],
  ["2026-05-24", 7],
  ["2026-05-28", 1],
  ["2026-06-15", 7],
  ["2026-06-17", 3],
  ["2026-06-18", 4],
  ["2026-06-21", 1],
  ["2026-06-22", 30],
];
let index = 0;
export const contacts: Contact[] = creationBuckets.flatMap(([createdDate, n]) =>
  Array.from({ length: n }, () => {
    const i = ++index;
    return {
      id: `demo-${String(i).padStart(3, "0")}`,
      eventId: "consilium26",
      createdDate,
      firstName: i % 2 ? "Demo" : "Sample",
      lastName: `Contact ${String(i).padStart(3, "0")}`,
      organization: "Demo organization",
      position: "Demo participant",
      street: "",
      city: "",
      state: "",
      country: "",
      postcode: "",
      email: `contact${i}@example.invalid`,
      photoStatus: "None",
      dietaryRequirements: [],
      inactive: false,
      incomplete: false,
      checkedIn: false,
      badgePrinted: false,
      marketingPrivacy: "No Privacy Recorded",
      processingConsent: "No Consent Recorded",
      visibility: "No Visibility Recorded",
    };
  }),
);
