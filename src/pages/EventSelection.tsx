import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Star,
  PlusCircle,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { formatDate, durationLabel, referenceDate } from "../lib/dates";
import {
  filterEvents,
  sortEvents,
  paginate,
  validateRanges,
} from "../lib/filterEvents";
import type { EventRecord, Values } from "../types";
import { DataTable } from "../components/DataTable";
import { Pagination } from "../components/Pagination";
import { Dialog } from "../components/Dialog";
import { FilterField, Check } from "../components/Fields";
export function EventSelection() {
  const { store, update, editEvent, notice } = useDemo();
  const navigate = useNavigate(),
    location = useLocation();
  const [view, setView] = useState("all"),
    [period, setPeriod] = useState(
      referenceDate("Australia/Sydney").slice(0, 7),
    ),
    [searchOpen, setSearchOpen] = useState(false),
    [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState<Values>({}),
    [page, setPage] = useState(1),
    [hidden, setHidden] = useState(false),
    [help, setHelp] = useState(false),
    [guided, setGuided] = useState(false),
    [deleting, setDeleting] = useState<EventRecord | null>(null),
    [switching, setSwitching] = useState("");
  useEffect(() => setPage(1), [filter, search, period, view, store.sort]);
  const rows = sortEvents(
    filterEvents(store.events, filter, search, view, period),
    store.sort,
    view,
  );
  const activeFilter = Object.values(filter).some(Boolean);
  function open(e: EventRecord) {
    if (e.kind === "Contact Store")
      return notice(
        e.name,
        "Contact Store workspace was not inspected; unavailable in this demo.",
      );
    setSwitching(e.name);
    update((s) => ({
      ...s,
      recents: [e.id, ...s.recents.filter((id) => id !== e.id)].slice(0, 6),
    }));
    setTimeout(() => {
      setSwitching("");
      navigate(`/event/${e.id}/dashboard`);
    }, 160);
  }
  function move(n: number) {
    const [y, m] = period.split("-").map(Number);
    const date = new Date(
      Date.UTC(
        view === "year" ? y + n : y,
        view === "year" ? m - 1 : m - 1 + n,
        1,
      ),
    );
    setPeriod(date.toISOString().slice(0, 7));
  }
  function sort(field: string) {
    update((s) => ({
      ...s,
      sort:
        s.sort?.field === field
          ? s.sort.direction === "asc"
            ? { field, direction: "desc" }
            : null
          : { field, direction: "asc" },
    }));
  }
  return (
    <main className="home">
      <div className="greeting">
        <div>
          {!hidden && (
            <h1>
              👋 <strong>Good morning, Sam!</strong>{" "}
              <span>
                You have {rows.length} events
                {view === "all"
                  ? "."
                  : ` in ${view === "year" ? period.slice(0, 4) : new Date(`${period}-01T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}.`}
              </span>
            </h1>
          )}
        </div>
        <div className="actions">
          <button
            className="primary"
            onClick={() =>
              store.askHelp
                ? setHelp(true)
                : navigate("/event/selection/addevent/Details/new")
            }
          >
            <PlusCircle size={18} /> New
          </button>
          <button
            aria-label={hidden ? "Show greeting" : "Hide greeting"}
            onClick={() => setHidden(!hidden)}
          >
            <ChevronDown className={hidden ? "flipped" : ""} size={18} />
          </button>
        </div>
      </div>
      <div className="toolbar">
        <div className="view-tabs">
          {["all", "month", "year"].map((v) => (
            <button
              key={v}
              className={view === v ? "selected" : ""}
              onClick={() => setView(v)}
            >
              {v === "all" ? "View all events" : `by ${v}`}
            </button>
          ))}
          {view !== "all" && (
            <div className="period">
              <button aria-label="Previous period" onClick={() => move(-1)}>
                <ChevronLeft size={18} />
              </button>
              <span>
                {view === "year"
                  ? period.slice(0, 4)
                  : new Date(`${period}-01T12:00:00Z`).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric", timeZone: "UTC" },
                    )}
              </span>
              <button aria-label="Next period" onClick={() => move(1)}>
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="actions">
          {searchOpen ? (
            <>
              <input
                aria-label="Search events"
                placeholder="Search by name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setSearch(query.trim())}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setQuery("");
                  setSearch("");
                }}
              >
                Close
              </button>
            </>
          ) : (
            <button onClick={() => setSearchOpen(true)}>
              <Search size={16} /> Search
            </button>
          )}
          <Link className="button" to="/event/selection/filters/details">
            <SlidersHorizontal size={16} />
            {activeFilter ? "Filter applied" : "Filter"}
          </Link>
        </div>
      </div>
      {(search || activeFilter) && (
        <p role="status">
          {rows.length} events match{" "}
          {search && activeFilter
            ? "your search and filter"
            : search
              ? "your search"
              : "your filter"}
          .{" "}
          {activeFilter && (
            <Link to="/event/selection/filters/details">Edit your filter</Link>
          )}
        </p>
      )}
      <section className="card event-table">
        <DataTable
          headers={[
            "favorite",
            "name",
            "startDate",
            "duration",
            "locationDisplay",
            "alerts",
            "kind",
          ]
            .map((field, i) => (
              <button onClick={() => sort(field)}>
                {
                  [
                    "Fave",
                    "Name",
                    "Start",
                    "Duration",
                    "Location",
                    "Alerts",
                    "Type",
                  ][i]
                }{" "}
                {store.sort?.field === field
                  ? store.sort.direction === "asc"
                    ? "▲"
                    : "▼"
                  : ""}
              </button>
            ))
            .concat([<span />])}
          empty={!rows.length}
        >
          {paginate(rows, page).map((e) => (
            <tr key={e.id}>
              <td>
                <button
                  aria-label={`${e.favorite ? "Un-favorite" : "Favorite"} ${e.name}`}
                  onClick={() =>
                    editEvent(e.id, (x) => ({ ...x, favorite: !x.favorite }))
                  }
                >
                  <Star
                    size={18}
                    fill={e.favorite ? "#ffc443" : "none"}
                    color={e.favorite ? "#d4a32e" : "#c6c4cf"}
                  />
                </button>
              </td>
              <td className="event-name">
                <button title={e.name} onClick={() => open(e)}>
                  {e.name}
                </button>
              </td>
              <td>{formatDate(e.startDate)}</td>
              <td>{durationLabel(e.startDate, e.endDate)}</td>
              <td className="truncate" title={e.locationDisplay}>
                {e.locationDisplay}
              </td>
              <td></td>
              <td>
                <span className={e.kind === "Contact Store" ? "badge" : ""}>
                  {e.kind}
                </span>
              </td>
              <td>
                <details>
                  <summary aria-label={`Actions for ${e.name}`}>•••</summary>
                  <div className="dropdown right">
                    <button onClick={() => open(e)}>Open</button>
                    <button
                      onClick={() =>
                        editEvent(e.id, (x) => ({ ...x, archived: true }))
                      }
                    >
                      Archive
                    </button>
                    <button onClick={() => setDeleting(e)}>Delete</button>
                  </div>
                </details>
              </td>
            </tr>
          ))}
        </DataTable>
        <Pagination total={rows.length} page={page} setPage={setPage} />
      </section>
      <div className="home-art" aria-hidden="true">
        <span>◇</span>
        <span>▤</span>
        <span>◯</span>
      </div>
      {location.pathname === "/event/selection/filters/details" && (
        <EventFilters
          filter={filter}
          apply={setFilter}
          close={() => navigate("/event/selection")}
        />
      )}{" "}
      {help && (
        <Dialog title="New Event" close={() => setHelp(false)}>
          <h2>Hi Sam, would you like some help setting up your event?</h2>
          <Check
            label="Ask every time I create a new event"
            checked={store.askHelp}
            onChange={(v) => update((s) => ({ ...s, askHelp: v }))}
          />
          <div className="dialog-actions">
            <button
              onClick={() => {
                setHelp(false);
                navigate("/event/selection/addevent/Details/new");
              }}
            >
              No thanks
            </button>
            <button
              className="primary"
              onClick={() => {
                setHelp(false);
                setGuided(true);
              }}
            >
              Yes please
            </button>
          </div>
        </Dialog>
      )}
      {guided && (
        <Dialog title="Guided setup unavailable" close={() => setGuided(false)}>
          <p>The guided flow was not inspected.</p>
          <button
            className="primary"
            onClick={() => {
              setGuided(false);
              navigate("/event/selection/addevent/Details/new");
            }}
          >
            Open manual form
          </button>
        </Dialog>
      )}
      {deleting && (
        <Dialog title="Delete demo event" close={() => setDeleting(null)}>
          <p>
            Delete “{deleting.name}” from this browser? Reset demo can restore
            fixtures.
          </p>
          <button
            className="primary"
            onClick={() => {
              update((s) => ({
                ...s,
                events: s.events.filter((e) => e.id !== deleting.id),
              }));
              setDeleting(null);
            }}
          >
            Delete
          </button>
        </Dialog>
      )}
      {switching && (
        <div role="status" className="switching">
          <span className="spinner" />
          Switching to {switching}…
        </div>
      )}
    </main>
  );
}
function EventFilters({
  filter,
  apply,
  close,
}: {
  filter: Values;
  apply: (f: Values) => void;
  close: () => void;
}) {
  const [draft, setDraft] = useState(filter),
    [error, setError] = useState("");
  return (
    <Dialog title="Filter events · Details" close={close} wide>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          try {
            validateRanges(draft);
            apply(draft);
            close();
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <div className="fields">
          {[
            ["Name", "name"],
            ["Start Date from", "startDateFrom"],
            ["Start Date to", "startDateTo"],
            ["End Date from", "endDateFrom"],
            ["End Date to", "endDateTo"],
            ["City", "city"],
            ["State", "state"],
            ["Country", "country"],
            ["Unique Code", "uniqueCode"],
          ].map(([label, name]) => (
            <FilterField
              key={name}
              label={label}
              name={name}
              draft={draft}
              setDraft={setDraft}
              type={name.includes("Date") ? "date" : "text"}
            />
          ))}
        </div>
        <Check
          label="Include Archived Events"
          checked={!!draft.includeArchived}
          onChange={(v) => setDraft({ ...draft, includeArchived: v })}
        />
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button type="button" onClick={() => setDraft({})}>
            Clear
          </button>
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="primary">Apply</button>
        </div>
      </form>
    </Dialog>
  );
}
