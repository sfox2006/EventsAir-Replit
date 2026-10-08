import type { Contact, Values } from "../types";
import { inRange, textMatches } from "./filterEvents";
import { creationBuckets } from "../data/contacts";
export function filterContacts(contacts: Contact[], f: Values = {}) {
  return contacts.filter((c) => {
    if (
      (!f.includeInactive && c.inactive) ||
      (!f.includeIncomplete && c.incomplete)
    )
      return false;
    if (
      f.id &&
      !String(f.id)
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .includes(c.id.toLowerCase())
    )
      return false;
    if (
      ![
        "firstName",
        "position",
        "street",
        "city",
        "state",
        "country",
        "postcode",
        "email",
        "nextAction",
        "externalId",
        "bio",
        "photoStatus",
      ].every((k) => textMatches(c[k as keyof Contact], f[k]))
    )
      return false;
    if (
      !["lastName", "organization", "photoDate", "dietaryUpdatedDate"].every(
        (k) => inRange(c[k as keyof Contact], f[`${k}From`], f[`${k}To`]),
      )
    )
      return false;
    if (
      f.includeInactive &&
      !inRange(c.inactiveDate, f.inactiveDateFrom, f.inactiveDateTo)
    )
      return false;
    if (
      f.includeIncomplete &&
      (!inRange(c.incompleteDate, f.incompleteDateFrom, f.incompleteDateTo) ||
        !textMatches(c.incompleteSite, f.incompleteSite))
    )
      return false;
    if (
      f.checkedIn &&
      f.checkedIn !== "All" &&
      c.checkedIn !== (f.checkedIn === "Checked-in")
    )
      return false;
    if (
      f.checkedIn === "Checked-in" &&
      !inRange(c.checkInDate, f.checkInDateFrom, f.checkInDateTo)
    )
      return false;
    if (
      f.badgePrinted &&
      f.badgePrinted !== "Either" &&
      c.badgePrinted !== (f.badgePrinted === "Yes")
    )
      return false;
    for (const k of [
      "marketingPrivacy",
      "processingConsent",
      "visibility",
      "dietaryRequirements",
    ]) {
      const selected = f[k];
      if (Array.isArray(selected) && selected.length) {
        const value = c[k as keyof Contact];
        if (
          Array.isArray(value)
            ? !selected.some((x) => value.includes(x))
            : !selected.includes(String(value))
        )
          return false;
      }
    }
    for (const k of ["trackingIncomplete", "trackingSubmitted"])
      if (!textMatches(c[k as keyof Contact], f[k])) return false;
    if (
      Array.isArray(f.blankFields) &&
      !f.blankFields.every((k) => {
        const v = c[k as keyof Contact];
        return (
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && !v.length)
        );
      })
    )
      return false;
    return true;
  });
}
export const candidateHistory = (rows: Contact[]) =>
  creationBuckets.map(([date]) => ({
    date,
    count: rows.filter((c) => c.createdDate <= date).length,
  }));
