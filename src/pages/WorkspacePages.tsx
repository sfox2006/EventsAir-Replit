import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import type { EventRecord, Contact } from "../types";
import { useDemo } from "../state/DemoContext";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { Dialog } from "../components/Dialog";
import { Check } from "../components/Fields";
import { contacts } from "../data/contacts";
import { agenda } from "../data/agenda";
import { timeLabel, formatDate } from "../lib/dates";
import { expressGroups, setupGroups } from "../data/catalogs";
function UnavailableButtons({ items }: { items: string[] }) {
  const { notice } = useDemo();
  return (
    <div className="actions">
      {items.map((x) => (
        <button key={x} onClick={() => notice(x)}>
          {x}
        </button>
      ))}
    </div>
  );
}
export function Agenda({ event }: { event: EventRecord }) {
  const { yyyymmdd } = useParams();
  const { notice } = useDemo();
  if (event.id !== "ls26")
    return (
      <p>
        No agenda fixture for this event; the original agenda was not copied.
      </p>
    );
  const day = yyyymmdd || "20260522";
  if (!agenda[day])
    return (
      <p>
        404 · Unknown agenda day.{" "}
        <Link to={`/event/${event.id}/agenda`}>Agenda</Link>
      </p>
    );
  return (
    <>
      <div className="toolbar">
        <div className="tabs">
          {Object.keys(agenda).map((d) => (
            <Link
              className={day === d ? "selected" : ""}
              key={d}
              to={`/event/ls26/agenda/${d}`}
            >
              {formatDate(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`)}
            </Link>
          ))}
        </div>
        <UnavailableButtons items={["Drag mode OFF", "New", "Unlocked"]} />
      </div>
      <section className="card">
        <DataTable headers={["Time", "Title / Description"]}>
          {agenda[day].map((item, i) => (
            <tr key={i}>
              <td className="time-cell">
                {timeLabel(item.start)} - {timeLabel(item.end)}
              </td>
              <td>
                <button
                  className="session-title"
                  onClick={() =>
                    notice(
                      item.title,
                      `${timeLabel(item.start)} - ${timeLabel(item.end)}. ${item.description || "No description supplied."} Read-only demo detail.`,
                    )
                  }
                >
                  {item.title}
                </button>
                {item.description && <p>{item.description}</p>}
              </td>
            </tr>
          ))}
        </DataTable>
      </section>
    </>
  );
}
export function Attendees({ event }: { event: EventRecord }) {
  const { notice } = useDemo();
  const [query, setQuery] = useState(""),
    [pins, setPins] = useState<string[]>([]),
    [recent, setRecent] = useState<string[]>([]),
    [page, setPage] = useState(1),
    [columns, setColumns] = useState([
      "ID",
      "Name",
      "Position",
      "Org",
      "Full Address",
      "City",
      "State",
      "Email",
    ]),
    [configure, setConfigure] = useState(false),
    [detail, setDetail] = useState<Contact | null>(null);
  useEffect(() => setPage(1), [query, event.id]);
  const rows = contacts.filter(
    (c) =>
      c.eventId === event.id &&
      `${c.firstName} ${c.lastName}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const show = (id: string) => {
    const c = contacts.find((c) => c.id === id);
    if (c) {
      setDetail(c);
      setRecent((s) => [id, ...s.filter((x) => x !== id)].slice(0, 6));
    }
  };
  const display = (c: Contact, k: string) =>
    ({
      ID: c.id,
      Name: `${c.firstName} ${c.lastName}`,
      Position: c.position,
      Org: c.organization,
      "Full Address": c.street,
      City: c.city,
      State: c.state,
      Email: c.email,
    })[k];
  return (
    <>
      <p className="muted">
        Fictional demo contact list; original Attendees query and scope are
        unverified.
      </p>
      {event.id === "ls26" && (
        <p>
          No copied attendee fixture. The assistant reported 63 contacts and 0
          registrations; the settled original screen total/query was not
          established.
        </p>
      )}
      <div className="toolbar">
        <label>
          Search{" "}
          <input
            aria-label="Search attendees"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <UnavailableButtons items={["Filter", "New"]} />
        <button onClick={() => setConfigure(true)}>Configure columns</button>
        <Check
          label={`Show ${event.name}`}
          checked
          onChange={() =>
            notice(
              "Organization-wide scope",
              "Only the current fixture event is supported.",
            )
          }
        />
      </div>
      <div className="attendee-layout">
        <aside className="card">
          <h3>Recent</h3>
          {recent.map((id) => (
            <button className="article" key={id} onClick={() => show(id)}>
              {id}
            </button>
          ))}
          <h3>My Pins</h3>
          {pins.map((id) => (
            <button className="article" key={id} onClick={() => show(id)}>
              {id}
            </button>
          ))}
        </aside>
        <section className="card">
          <DataTable headers={["Pin", ...columns]} empty={!rows.length}>
            {rows.slice((page - 1) * 50, page * 50).map((c) => (
              <tr key={c.id}>
                <td>
                  <button
                    aria-label={`Pin ${c.id}`}
                    onClick={() =>
                      setPins((s) =>
                        s.includes(c.id)
                          ? s.filter((x) => x !== c.id)
                          : [...s, c.id],
                      )
                    }
                  >
                    {pins.includes(c.id) ? "●" : "○"}
                  </button>
                </td>
                {columns.map((k) => (
                  <td key={k}>
                    {k === "Name" ? (
                      <button onClick={() => show(c.id)}>
                        {display(c, k)}
                      </button>
                    ) : (
                      display(c, k)
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </DataTable>
          <Pagination total={rows.length} page={page} setPage={setPage} />
        </section>
      </div>
      {configure && (
        <Dialog
          title="Configure columns · demo choice"
          close={() => setConfigure(false)}
        >
          {[
            "ID",
            "Name",
            "Position",
            "Org",
            "Full Address",
            "City",
            "State",
            "Email",
          ].map((k) => (
            <Check
              key={k}
              label={k}
              checked={columns.includes(k)}
              onChange={(v) =>
                setColumns((s) => (v ? [...s, k] : s.filter((x) => x !== k)))
              }
            />
          ))}
        </Dialog>
      )}
      {detail && (
        <Dialog
          title={`${detail.firstName} ${detail.lastName}`}
          close={() => setDetail(null)}
        >
          <p>Fictional read-only contact</p>
          <p>{detail.email}</p>
          <p>{detail.organization}</p>
          <p>Candidate creation date: {detail.createdDate}</p>
        </Dialog>
      )}
    </>
  );
}
export function Reporting({ event }: { event: EventRecord }) {
  const { notice } = useDemo();
  const [library, setLibrary] = useState("Quick Reports"),
    [selected, setSelected] = useState("");
  const libraries = [
    "Quick Reports",
    "Contact",
    "Notes",
    "Marketing",
    "Registrations",
    "Agenda",
    "Functions",
    "Accommodation",
    "Travel",
    "Presentations",
    "Exhibition",
    "Sponsorship",
    "Financial",
    "Accounting",
    "EventStream",
  ];
  const reports = [
    "King Room L&S 2026 Accommodation List by Status",
    "Marketing List",
    "Twin Room L&S 2026 Accommodation List by Status",
  ];
  return (
    <>
      <div className="grid three">
        <section className="card">
          <h3>Report Libraries</h3>
          <div className="catalog-list">
            {libraries.map((l) => (
              <button
                className={l === library ? "selected" : ""}
                key={l}
                onClick={() => {
                  setLibrary(l);
                  setSelected("");
                  if (l !== "Quick Reports") notice(`${l} report library`);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </section>
        <div>
          <section className="card">
            <h3>Set Filter</h3>
            <button onClick={() => notice("Target Group")}>Target Group</button>
            <p>0 Records Selected</p>
          </section>
          <section className="card">
            <h3>Select Report</h3>
            <UnavailableButtons items={["Reports", "Selected Records"]} />
            {library === "Quick Reports" && event.id === "ls26" ? (
              reports.map((r) => (
                <button
                  className={`article ${selected === r ? "selected" : ""}`}
                  key={r}
                  onClick={() => setSelected(r)}
                >
                  {r}
                </button>
              ))
            ) : (
              <p>No report fixture.</p>
            )}
          </section>
        </div>
        <section className="card">
          <h3>Report Options</h3>
          <p>Original report options unavailable.</p>
        </section>
      </div>
      <div className="toolbar">
        <UnavailableButtons items={["Add Custom", "Copy"]} />
        <div className="actions">
          {["Preview Viewer", "Preview PDF"].map((x) => (
            <button
              disabled={!selected}
              key={x}
              onClick={() =>
                notice(
                  x,
                  "Original report contents and preview workflow were not inspected; no report generated.",
                )
              }
            >
              {x}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
export function Communications({ event }: { event: EventRecord }) {
  const { notice } = useDemo();
  const [query, setQuery] = useState("");
  const rows =
    event.id === "ls26"
      ? [
          "!example",
          "Application Progressed L&S26",
          "Application Received L&S26",
          "Application Rejected",
          "Offer Withdrawn",
        ].filter((x) => x.toLowerCase().includes(query.toLowerCase()))
      : [];
  const subject = (x: string) =>
    x.includes("Progressed")
      ? "L&S 2026 Application Successful 🎉"
      : x.includes("Received")
        ? "🎉 L&S 2026 Application Received!"
        : ["Application Rejected", "Offer Withdrawn"].includes(x)
          ? "L&S 2026 Application Unsuccessful"
          : "";
  return (
    <>
      <UnavailableButtons items={["Actions"]} />
      <div className="grid comms-grid">
        <section className="card">
          <div className="toolbar">
            <h3>Merge Docs / Email templates</h3>
            <label>
              Search{" "}
              <input value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <UnavailableButtons items={["New"]} />
          </div>
          <DataTable
            headers={[
              "Title",
              "Subject",
              "From Name",
              "From Email Address",
              "Tag Code",
            ]}
            empty={!rows.length}
          >
            {rows.map((x) => (
              <tr key={x}>
                <td>
                  <button onClick={() => notice(x)}>{x}</button>
                </td>
                <td>{subject(x)}</td>
                <td>Demo sender</td>
                <td>demo@example.invalid</td>
                <td>
                  {x === "!example"
                    ? "EXAMPLE"
                    : x.toUpperCase().replace(/\W+/g, "_")}
                </td>
              </tr>
            ))}
          </DataTable>
          <p className="muted">
            Sender and tag metadata are synthetic. No communications are sent.
          </p>
        </section>
        <div>
          <section className="card">
            <h3>Status</h3>
            {event.id === "ls26" ? (
              <div
                className="zeros"
                aria-label="Four zero markers; status definitions unverified"
              >
                {[0, 1, 2, 3].map((i) => (
                  <span key={i}>0</span>
                ))}
              </div>
            ) : (
              <p>No status fixture.</p>
            )}
          </section>
          <section className="card">
            <h3>Surveys</h3>
            <p>{event.id === "ls26" ? "0 surveys" : "No survey fixture"}</p>
          </section>
          <section className="card">
            <h3>Planned Comms</h3>
            <p>
              {event.id === "ls26"
                ? "0 future planned comms"
                : "No planned communications fixture"}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
export function Alerts({ event }: { event: EventRecord }) {
  return (
    <div className="grid two">
      {Object.entries({
        "Event Alerts": ["Level", "Alert Date", "Details"],
        "Inventory Alerts": ["Level", "Item", "Inventory"],
        "Project Alerts": ["Status", "Due Date", "Task"],
        "Accommodation Alerts": [
          "Level",
          "Hotel",
          "Room Type",
          "Date",
          "Inventory",
        ],
      }).map(([title, headers], i) => (
        <section className="card" key={title}>
          <div className="toolbar">
            <h3>{title}</h3>
            <UnavailableButtons
              items={i < 3 ? ["All", "Export to Excel"] : ["Matrix"]}
            />
          </div>
          {event.id === "ls26" ? (
            <DataTable headers={headers} empty />
          ) : (
            <p>No alert fixture for this event.</p>
          )}
        </section>
      ))}
    </div>
  );
}
export function Accounting({ event }: { event: EventRecord }) {
  const { reload, notice } = useDemo();
  const [loading, setLoading] = useState(false);
  const income: number[] = [],
    expenses: number[] = [];
  const revenue = income.reduce((a, b) => a + b, 0),
    expense = expenses.reduce((a, b) => a + b, 0);
  const money = (cents: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
    }).format(cents / 100);
  return (
    <>
      <div className="toolbar">
        <button
          onClick={() => {
            setLoading(true);
            reload();
            setTimeout(() => setLoading(false), 180);
          }}
        >
          Refresh
        </button>
        <details>
          <summary className="button">Add Widget</summary>
          <div className="dropdown">
            {[
              "Top 10 Income Budget Variations",
              "Top 10 Expense Budget Variations",
              "Profit",
              "Income",
              "Expense",
            ].map((x) => (
              <button
                key={x}
                onClick={() =>
                  notice(
                    x,
                    "Original accounting widget formula and layout uninspected; unavailable in this demo.",
                  )
                }
              >
                {x}
              </button>
            ))}
          </div>
        </details>
      </div>
      <section className="card tools-card">
        <h3>Tools</h3>
        <UnavailableButtons items={["Budget", "Account Inquiry"]} />
      </section>
      <section className="card financial">
        <h3>Financial Summary</h3>
        {loading ? (
          <p role="status">Loading demo store…</p>
        ) : event.id === "ls26" ? (
          <div className="finance-row">
            <div className="profit">
              <span>Profit</span>
              <strong>{money(revenue - expense)}</strong>
            </div>
            <div>
              <h4>Revenue</h4>
              <strong>{money(revenue)}</strong>
              <h4>Expenses</h4>
              <strong>{money(expense)}</strong>
            </div>
          </div>
        ) : (
          <p>No financial fixture.</p>
        )}
      </section>
    </>
  );
}
export function Project({ event }: { event: EventRecord }) {
  return (
    <>
      <h2>
        🤔{" "}
        {event.id === "ls26"
          ? "Hmmmm. You don't have any projects..."
          : "No project fixture"}
      </h2>
      <UnavailableButtons
        items={["Refresh", "Filter", "New project", "Actions"]}
      />
      <div className="empty-state">
        <div aria-hidden="true" className="planning-art">
          ◇ ▤ ◯
        </div>
        <h2>
          {event.id === "ls26"
            ? "You don't have any projects right now"
            : "Original projects were not inspected"}
        </h2>
        <p>
          Create a project with New project or import using Actions. These
          workflows are unavailable in the demo.
        </p>
      </div>
    </>
  );
}
export function RunSheet({ event }: { event: EventRecord }) {
  return (
    <>
      <h2>
        🤔{" "}
        {event.id === "ls26"
          ? "Hmmmm. You don't have any tasks..."
          : "No run sheet fixture"}
      </h2>
      <div className="toolbar">
        <UnavailableButtons
          items={["Refresh", "Filter", "New task", "Actions", "View by Date"]}
        />
        <Link className="button" to={`/event/${event.id}/agenda`}>
          Show Agenda (demo navigation)
        </Link>
      </div>
      {event.id === "ls26" ? (
        <section className="card">
          <DataTable
            headers={[
              "Date",
              "Start Time",
              "End Time",
              "Items",
              "Location",
              "Agenda",
              "Team Members",
              "Status",
              "Priority",
              "Note",
            ]}
            empty
          />
        </section>
      ) : (
        <p>No run sheet fixture.</p>
      )}
    </>
  );
}
export function Online({ event }: { event: EventRecord }) {
  return (
    <div className="grid two">
      {Object.entries({
        "Event Website": [],
        "Interactive Sites": [
          "L&S Conference 2026 Application Form",
          "TEST Registration Site",
        ],
        "Mobile Apps": ["Attendee app"],
        "App Store": ["L&S Conference 2026 Hotel Portal"],
      }).map(([title, rows]) => (
        <OnlineCard
          key={title}
          title={title}
          rows={event.id === "ls26" ? rows : []}
          hasFixture={event.id === "ls26"}
        />
      ))}
    </div>
  );
}
function OnlineCard({
  title,
  rows,
  hasFixture,
}: {
  title: string;
  rows: string[];
  hasFixture: boolean;
}) {
  const [query, setQuery] = useState(""),
    [asc, setAsc] = useState(true);
  const { notice } = useDemo();
  return (
    <section className="card">
      <div className="toolbar">
        <h3>{title}</h3>
        <UnavailableButtons items={["New"]} />
      </div>
      {title !== "Event Website" && (
        <div className="toolbar">
          <label>
            Search{" "}
            <input value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <button onClick={() => setAsc(!asc)}>
            Name ({asc ? "A-Z" : "Z-A"})
          </button>
        </div>
      )}
      {hasFixture ? (
        rows
          .filter((x) => x.toLowerCase().includes(query.toLowerCase()))
          .sort((a, b) => (asc ? a.localeCompare(b) : b.localeCompare(a)))
          .map((x) => (
            <button
              key={x}
              className="article"
              onClick={() =>
                notice(
                  x,
                  "Original editor and destination URL not inspected; unavailable in this demo.",
                )
              }
            >
              {x}
            </button>
          ))
      ) : (
        <p>No online fixture for this event.</p>
      )}
    </section>
  );
}
export function Catalog({
  groups,
  onSelect,
}: {
  groups: Record<string, string[]>;
  onSelect?: (x: string) => void;
}) {
  const { notice } = useDemo();
  return (
    <div className="grid two">
      {Object.entries(groups).map(([title, items]) => (
        <section className="card" key={title}>
          <h3>{title}</h3>
          <div className="catalog-list">
            {items.map((x) => (
              <button
                className="catalog-item"
                key={x}
                onClick={() => (onSelect ? onSelect(x) : notice(x))}
              >
                <strong>{x}</strong>
                <span>{x} tools · original workflow unavailable</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
export function ExpressActions() {
  return <Catalog groups={expressGroups} />;
}
export function Setup({ event }: { event: EventRecord }) {
  const { notice } = useDemo();
  const navigate = useNavigate();
  const [secondary, setSecondary] = useState(false);
  return (
    <>
      <Catalog
        groups={setupGroups}
        onSelect={(x) => (x === "Event" ? setSecondary(true) : notice(x))}
      />
      {secondary && (
        <Dialog title="Event setup" close={() => setSecondary(false)}>
          <div className="catalog-list">
            {[
              "Preferences",
              "Custom Domain",
              "Event Policy",
              "Data Consent",
              "Data Log Settings",
              "Alerts",
            ].map((x) => (
              <button
                key={x}
                onClick={() => {
                  setSecondary(false);
                  if (x === "Preferences")
                    navigate(
                      `/event/${event.id}/setup/event/preferences/Details`,
                    );
                  else notice(x);
                }}
              >
                {x}
              </button>
            ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
