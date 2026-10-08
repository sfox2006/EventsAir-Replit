import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EventRecord, Values } from "../types";
import { useDemo } from "../state/DemoContext";
import { Dialog } from "./Dialog";
import { Field, Check } from "./Fields";
import { addDays, durationDays, referenceDate } from "../lib/dates";
import { defaultModules } from "../data/events";
import { moduleGroups } from "../data/catalogs";
const tabs = ["Details", "Modules", "ExternalConnections", "AccessRights"];
export function EventForm({ event }: { event?: EventRecord }) {
  const { tab = "Details" } = useParams();
  const { store, update, editEvent } = useDemo();
  const navigate = useNavigate();
  const close = () =>
    navigate(event ? `/event/${event.id}/setup` : "/event/selection");
  const [initial] = useState<EventRecord>(() =>
    event
      ? structuredClone(event)
      : {
          id: crypto.randomUUID(),
          name: "",
          kind: "Event",
          startDate: referenceDate("America/New_York"),
          endDate: addDays(referenceDate("America/New_York"), 1),
          durationEvidence: "inferred",
          locationDisplay: "",
          venue: "",
          city: "",
          state: "",
          country: "",
          uniqueCode: "",
          alias: "",
          timeZone: "America/New_York",
          currency: "AUD",
          favorite: false,
          archived: false,
          seedOrder: store.events.length,
          contactStoreId: "",
          modules: [...defaultModules],
          preferences: { mode: "In-Person", access: "all" },
          widgets: [],
        },
  );
  const [draft, setDraft] = useState(initial),
    [error, setError] = useState("");
  const dirty = JSON.stringify(initial) !== JSON.stringify(draft);
  const set = (key: keyof EventRecord, value: unknown) =>
    setDraft((d) => ({ ...d, [key]: value }));
  const pref = (key: string, value: Values[string]) =>
    setDraft((d) => ({
      ...d,
      preferences: { ...d.preferences, [key]: value },
    }));
  const field = (
    label: string,
    key: keyof EventRecord,
    type = "text",
    options?: string[],
    disabled = false,
  ) => (
    <Field
      key={key}
      label={label}
      value={String(draft[key] || "")}
      onChange={(v) => set(key, v)}
      type={type}
      options={options}
      disabled={disabled}
    />
  );
  const pfield = (
    label: string,
    key: string,
    type = "text",
    options?: string[],
  ) => (
    <Field
      key={key}
      label={label}
      value={String(draft.preferences[key] || "")}
      onChange={(v) => pref(key, v)}
      type={type}
      options={options}
    />
  );
  function save() {
    try {
      if (!draft.name.trim()) throw new Error("Name is required");
      durationDays(draft.startDate, draft.endDate);
      if (
        draft.alias &&
        store.events.some(
          (e) =>
            e.id !== draft.id &&
            e.alias.toLowerCase() === draft.alias.toLowerCase(),
        )
      )
        throw new Error("Alias must be unique among local events");
      const n = draft.preferences.expectedAttendees;
      if (n && (!/^\d+$/.test(String(n)) || !Number.isSafeInteger(Number(n))))
        throw new Error("Expected attendees must be a nonnegative integer");
      const saved = {
        ...draft,
        name: draft.name.trim(),
        locationDisplay:
          dirty && draft.city !== initial.city
            ? draft.city
            : draft.locationDisplay,
        widgets: event
          ? draft.widgets
          : [
              {
                id: crypto.randomUUID(),
                eventId: draft.id,
                kind: "Event Information" as const,
                title: "Event Information",
                filter: {},
                order: 0,
              },
            ],
      };
      if (event) editEvent(event.id, () => saved);
      else update((s) => ({ ...s, events: [...s.events, saved] }));
      close();
    } catch (e) {
      setError((e as Error).message);
    }
  }
  async function logo(file?: File) {
    if (!file) return;
    try {
      if (
        !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
          file.type,
        ) ||
        file.size > 5_000_000
      )
        throw new Error("Choose a raster image under 5 MB");
      const url = URL.createObjectURL(file);
      try {
        const img = new Image();
        img.src = url;
        await img.decode();
        const canvas = document.createElement("canvas");
        canvas.width = 400;
        canvas.height = Math.round((img.height * 400) / img.width);
        if (canvas.height > 4000)
          throw new Error("Image aspect ratio is too tall");
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        pref("logo", canvas.toDataURL("image/png"));
      } finally {
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <Dialog
      title={event ? "Event Preferences" : "New Event"}
      close={close}
      wide
    >
      <div className="tabs">
        {tabs.map((t, i) => (
          <button
            key={t}
            className={tab === t ? "selected" : ""}
            onClick={() =>
              navigate(
                event
                  ? `/event/${event.id}/setup/event/preferences/${t}`
                  : `/event/selection/addevent/${t}/new`,
              )
            }
          >
            {["Details", "Modules", "External Connections", "Access Rights"][i]}
          </button>
        ))}
      </div>
      <p className="muted">
        Changes are saved only in this browser.{" "}
        {event
          ? ""
          : "Demo dates follow the reference clock (original New observation was Oct 8–9)."}
      </p>
      {tab === "Details" ? (
        <>
          <div className="fields">
            {field("Type", "kind", "text", ["Event", "Contact Store"], !!event)}
            {!event && (
              <Field
                label="Clone From"
                value=""
                options={["", ...store.events.map((e) => e.name)]}
                onChange={(v) => {
                  const source = store.events.find((e) => e.name === v);
                  if (source)
                    setDraft((d) => ({
                      ...d,
                      kind: source.kind,
                      timeZone: source.timeZone,
                      currency: source.currency,
                      venue: source.venue,
                      city: source.city,
                      state: source.state,
                      country: source.country,
                      locationDisplay: source.locationDisplay,
                      contactStoreId: source.contactStoreId,
                      modules: [...source.modules],
                      preferences: structuredClone(source.preferences),
                    }));
                }}
              />
            )}
            {field("Name", "name")}
            {field("Alias", "alias")}
            <p>
              URL preview: https://demo.example.invalid/
              {draft.alias || "your-alias"}
            </p>
            {field("Start Date", "startDate", "date")}
            {field("End Date", "endDate", "date")}
            {field("Event Location Time Zone", "timeZone", "text", [
              "America/New_York",
              "Australia/Sydney",
              "Australia/Brisbane",
            ])}
            {field("Event Currency", "currency", "text", ["AUD"])}
            {pfield("Event Format (catalog uninspected)", "format", "text", [
              "",
              "Demo example",
            ])}
            {pfield("Attendance Mode", "mode", "text", [
              "In-Person",
              "Hybrid",
              "Virtual",
            ])}
            {pfield("Expected Attendees", "expectedAttendees", "number")}
          </div>
          <Check
            label="Enable Multi-currency"
            checked={!!draft.preferences.multiCurrency}
            onChange={(v) => pref("multiCurrency", v)}
          />
          {!event && (
            <p className="muted">
              Clone copies preferences and location only; excludes ID, name,
              alias, dates and contact records.
            </p>
          )}
          <details>
            <summary>Location</summary>
            <div className="fields">
              {field("Venue", "venue")}
              {field("City", "city")}
              {field("State", "state")}
              {field("Country", "country")}
            </div>
          </details>
          <label className="field">
            <span>
              Logo · resized proportionally to 400px wide, kept locally
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={(e) => void logo(e.target.files?.[0])}
            />
          </label>
          {draft.preferences.logo && (
            <img
              className="logo-preview"
              src={String(draft.preferences.logo)}
              alt="Local event logo preview"
            />
          )}
          <h3>Application Settings</h3>
          <div className="fields">
            {pfield("Event Group (catalog uninspected)", "group", "text", [
              "",
              "Demo example",
            ])}
            <label className="field">
              <span>Contact Store</span>
              <select
                disabled={!!event}
                value={draft.contactStoreId}
                onChange={(e) => set("contactStoreId", e.target.value)}
              >
                <option value="">None</option>
                {store.events
                  .filter((e) => e.kind === "Contact Store")
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </label>
            {field("Unique Code", "uniqueCode")}
          </div>
        </>
      ) : tab === "Modules" ? (
        <>
          <p>
            Demo toggles store preferences only; original effects on navigation
            are unverified.
          </p>
          <div className="grid two">
            {Object.entries(moduleGroups).map(([group, items]) => (
              <fieldset key={group}>
                <legend>{group}</legend>
                {items.map((x) => (
                  <Check
                    key={x}
                    label={x}
                    checked={draft.modules.includes(x)}
                    onChange={(v) =>
                      set(
                        "modules",
                        v
                          ? [...draft.modules, x]
                          : draft.modules.filter((m) => m !== x),
                      )
                    }
                  />
                ))}
              </fieldset>
            ))}
          </div>
        </>
      ) : tab === "ExternalConnections" ? (
        <>
          <p>
            Demo / no connection. No payment, email, SMS or outbound
            integration.
          </p>
          {Object.entries({
            Payments: [
              "EventsAir Pay Account",
              "E-Commerce Account",
              "E-Commerce Reference",
              "PayPal Account",
            ],
            "Email & Comms": ["Send Email From", "Text Message Gateway"],
          }).map(([group, fields]) => (
            <fieldset key={group}>
              <legend>{group}</legend>
              <div className="fields">
                {fields.map((x) =>
                  pfield(x, x, "text", ["", "Demo / no connection"]),
                )}
              </div>
              {group === "Payments" && (
                <Check
                  label="Test Mode"
                  checked={!!draft.preferences.testMode}
                  onChange={(v) => pref("testMode", v)}
                />
              )}
            </fieldset>
          ))}
          <details>
            <summary>Attendee App & OnAIR Communications</summary>
            {pfield("From Email Name", "fromName", "text", ["", "Demo sender"])}
            {pfield("From Email Address", "fromEmail", "text", [
              "",
              "demo@example.invalid",
            ])}
          </details>
        </>
      ) : (
        <>
          <fieldset>
            <legend>Access Rights</legend>
            {[
              ["all", "Allow all users to access this event"],
              ["specified", "Specify users"],
            ].map(([v, label]) => (
              <label className="check" key={v}>
                <input
                  type="radio"
                  name="access"
                  checked={draft.preferences.access === v}
                  onChange={() => pref("access", v)}
                />
                {label}
              </label>
            ))}
          </fieldset>
          {draft.preferences.access === "specified" && (
            <fieldset disabled>
              <legend>User selection unavailable</legend>
              <input placeholder="Original selector not inspected" />
            </fieldset>
          )}
          <p>
            These preferences do not secure this public demo. No authentication
            or roles are implemented.
          </p>
        </>
      )}
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <div className="dialog-actions">
        <button onClick={close}>Cancel</button>
        <button className="primary" disabled={!!event && !dirty} onClick={save}>
          Save
        </button>
      </div>
    </Dialog>
  );
}
