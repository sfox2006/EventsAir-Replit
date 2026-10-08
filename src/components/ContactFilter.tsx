import { useState } from "react";
import type { Values } from "../types";
import { Dialog } from "./Dialog";
import { FilterField, Check, Multi, Field } from "./Fields";
import { filterCategories } from "../data/catalogs";
import { useDemo } from "../state/DemoContext";
import { validateRanges } from "../lib/filterEvents";
export function ContactFilter({
  filter,
  apply,
  close,
}: {
  filter: Values;
  apply: (f: Values) => void;
  close: () => void;
}) {
  const [draft, setDraft] = useState<Values>(structuredClone(filter)),
    [category, setCategory] = useState("Contact"),
    [tab, setTab] = useState("Details"),
    [name, setName] = useState(""),
    [error, setError] = useState("");
  const { store, update } = useDemo();
  const known = category === "Contact" && tab === "Details";
  const field = (
    label: string,
    key: string,
    type = "text",
    disabled = false,
    options?: string[],
  ) => (
    <FilterField
      key={key}
      label={label}
      name={key}
      draft={draft}
      setDraft={setDraft}
      type={type}
      disabled={disabled}
      options={options}
    />
  );
  const range = (
    label: string,
    key: string,
    disabled = false,
    type = "date",
  ) => (
    <fieldset key={key}>
      <legend>{label}</legend>
      <div className="fields">
        {field("From", `${key}From`, type, disabled)}
        {field("To", `${key}To`, type, disabled)}
      </div>
    </fieldset>
  );
  return (
    <Dialog title="Contacts Filter" close={close} wide>
      <div className="filter-layout">
        <nav className="filter-categories">
          {filterCategories.map((c) => (
            <button
              key={c}
              className={c === category ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </nav>
        <div className="filter-body">
          <div className="tabs">
            {["Details", "Access Control", "Custom Fields"].map((t) => (
              <button
                key={t}
                className={tab === t ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          {known ? (
            <>
              <div className="fields">
                {[
                  ["ID (comma-separated)", "id"],
                  ["First Name", "firstName"],
                  ["Position", "position"],
                  ["Street", "street"],
                  ["City", "city"],
                  ["State", "state"],
                  ["Country", "country"],
                  ["Zip/Post", "postcode"],
                  ["Email", "email"],
                  ["Next Action", "nextAction"],
                  ["External ID", "externalId"],
                  ["Bio", "bio"],
                ].map(([l, k]) => field(l, k))}
                {field("Photo Status", "photoStatus", "text", false, [
                  "",
                  "None",
                  "Uploaded",
                ])}
              </div>
              {range("Last Name", "lastName", false, "text")}
              {range("Organization", "organization", false, "text")}
              {range("Date Uploaded", "photoDate")}
              {range("Dietary Last Updated", "dietaryUpdatedDate")}
              <Multi
                label="Dietary Requirements"
                name="dietaryRequirements"
                options={["Vegetarian", "Vegan", "Gluten-free", "Other"]}
                draft={draft}
                setDraft={setDraft}
              />
              <Check
                label="Include Inactive"
                checked={!!draft.includeInactive}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    includeInactive: v,
                    inactiveDateFrom: "",
                    inactiveDateTo: "",
                  })
                }
              />
              {range("Inactive Date", "inactiveDate", !draft.includeInactive)}
              <Check
                label="Include Incomplete Registrations"
                checked={!!draft.includeIncomplete}
                onChange={(v) =>
                  setDraft({
                    ...draft,
                    includeIncomplete: v,
                    incompleteDateFrom: "",
                    incompleteDateTo: "",
                    incompleteSite: "",
                  })
                }
              />
              {range(
                "Incomplete Registration Date",
                "incompleteDate",
                !draft.includeIncomplete,
              )}
              {field(
                "Incomplete Site",
                "incompleteSite",
                "text",
                !draft.includeIncomplete,
              )}
              {field("Event Check-In", "checkedIn", "text", false, [
                "All",
                "Checked-in",
                "Not Checked-in",
              ])}
              {range(
                "Check-In Date",
                "checkInDate",
                draft.checkedIn !== "Checked-in",
              )}
              {field("Badge Printed", "badgePrinted", "text", false, [
                "Either",
                "Yes",
                "No",
              ])}
              <Multi
                label="Marketing Privacy"
                name="marketingPrivacy"
                options={["No Privacy Recorded", "Opt In", "Opt Out"]}
                draft={draft}
                setDraft={setDraft}
              />
              <Multi
                label="Data Processing"
                name="processingConsent"
                options={[
                  "No Consent Recorded",
                  "Consent Given",
                  "Consent Withdrawn",
                ]}
                draft={draft}
                setDraft={setDraft}
              />
              <Multi
                label="Attendee App & OnAIR Visibility"
                name="visibility"
                options={[
                  "No Visibility Recorded",
                  "Opt In details shared",
                  "Opt Out details anonymized",
                ]}
                draft={draft}
                setDraft={setDraft}
              />
              <fieldset>
                <legend>Tracking Parameters</legend>
                {field("Incomplete", "trackingIncomplete")}
                {field("Submitted", "trackingSubmitted")}
              </fieldset>
              <Multi
                label="Blank Fields (all selected must be blank)"
                name="blankFields"
                options={[
                  "firstName",
                  "lastName",
                  "organization",
                  "position",
                  "street",
                  "city",
                  "state",
                  "country",
                  "postcode",
                  "email",
                  "bio",
                  "externalId",
                  "nextAction",
                  "photoDate",
                  "dietaryRequirements",
                ]}
                draft={draft}
                setDraft={setDraft}
              />
            </>
          ) : (
            <p>
              Original filter rules not inspected; unavailable in this demo.
            </p>
          )}
        </div>
      </div>
      {error && <p role="alert">{error}</p>}
      <div className="preset-bar">
        <Field label="Local preset name" value={name} onChange={setName} />
        <button
          disabled={!known || !name.trim()}
          onClick={() => {
            try {
              validateRanges(draft);
              update((s) => ({
                ...s,
                presets: {
                  ...s.presets,
                  [name.trim()]: structuredClone(draft),
                },
              }));
              setError("Preset saved locally");
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Save
        </button>
        <label>
          Load{" "}
          <select
            aria-label="Load saved filter"
            defaultValue=""
            onChange={(e) => {
              const key = e.target.value;
              if (key) {
                setDraft(structuredClone(store.presets[key]));
                setName(key);
              }
            }}
          >
            <option value="">Select preset</option>
            {Object.keys(store.presets).map((n) => (
              <option key={n}>{n}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="dialog-actions">
        <button
          onClick={() => {
            setDraft({});
            setError("");
          }}
        >
          Clear
        </button>
        <button onClick={close}>Cancel</button>
        <button
          className="primary"
          disabled={!known}
          onClick={() => {
            try {
              validateRanges(draft);
              apply(draft);
              close();
            } catch (e) {
              setError((e as Error).message);
            }
          }}
        >
          Apply
        </button>
      </div>
    </Dialog>
  );
}
