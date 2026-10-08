import { describe, it, expect } from "vitest";
import { contacts } from "../data/contacts";
import { filterContacts, candidateHistory } from "./filterContacts";
describe("fictional contacts and candidate series", () => {
  it("reproduces all reported buckets", () => {
    expect(filterContacts(contacts)).toHaveLength(90);
    expect(candidateHistory(contacts).map((p) => p.count)).toEqual([
      6, 13, 16, 37, 44, 45, 52, 55, 59, 60, 90,
    ]);
  });
  it("recalculates count and history from active predicates", () => {
    const rows = filterContacts(contacts, { firstName: "Demo" });
    expect(rows).toHaveLength(45);
    expect(candidateHistory(rows).at(-1)?.count).toBe(45);
    expect(candidateHistory(rows)[0].count).toBe(3);
    expect(
      filterContacts(contacts, { id: "demo-001, demo-002", firstName: "Demo" }),
    ).toHaveLength(1);
  });
  it("uses inclusive lexicographic bounds and OR within groups", () => {
    expect(
      filterContacts(contacts, {
        lastNameFrom: "Contact 001",
        lastNameTo: "Contact 002",
      }),
    ).toHaveLength(2);
    expect(
      filterContacts(contacts, {
        marketingPrivacy: ["Opt In", "No Privacy Recorded"],
      }),
    ).toHaveLength(90);
    expect(
      filterContacts(contacts, { marketingPrivacy: ["Opt In"] }),
    ).toHaveLength(0);
  });
  it("excludes inactive/incomplete by default and handles null range values", () => {
    const c = { ...contacts[0], inactive: true, incomplete: true };
    expect(filterContacts([c])).toHaveLength(0);
    expect(
      filterContacts([c], { includeInactive: true, includeIncomplete: true }),
    ).toHaveLength(1);
    expect(
      filterContacts([c], {
        includeInactive: true,
        includeIncomplete: true,
        photoDateFrom: "2026-01-01",
      }),
    ).toHaveLength(0);
  });
  it("requires all selected blanks and respects checked-in/badge constraints", () => {
    expect(
      filterContacts(contacts, { blankFields: ["city", "bio"] }),
    ).toHaveLength(90);
    expect(
      filterContacts(contacts, { blankFields: ["city", "email"] }),
    ).toHaveLength(0);
    expect(filterContacts(contacts, { checkedIn: "Checked-in" })).toHaveLength(
      0,
    );
    expect(filterContacts(contacts, { badgePrinted: "No" })).toHaveLength(90);
  });
});
