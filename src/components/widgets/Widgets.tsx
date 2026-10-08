import { useRef, useState } from "react";
import { Pencil, Copy, Check as CheckIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { EventRecord, Widget } from "../../types";
import { useDemo } from "../../state/DemoContext";
import { contacts } from "../../data/contacts";
import { filterContacts, candidateHistory } from "../../lib/filterContacts";
import {
  dateRange,
  dateStatus,
  referenceDate,
  dateOrdinal,
} from "../../lib/dates";
import { linkGroups } from "../../data/links";
import { ContactFilter } from "../ContactFilter";
export function DemoWidget({
  widget: w,
  event,
  remove,
}: {
  widget: Widget;
  event: EventRecord;
  remove: () => void;
}) {
  const { editEvent, notice } = useDemo();
  const [renaming, setRenaming] = useState(false),
    [title, setTitle] = useState(w.title),
    [filtering, setFiltering] = useState(false),
    [copied, setCopied] = useState("");
  const cancelled = useRef(false);
  const rows = filterContacts(
    contacts.filter((c) => c.eventId === event.id),
    w.filter,
  );
  const history = candidateHistory(rows).map((x) => ({
    ...x,
    ordinal: dateOrdinal(x.date),
  }));
  const patch = (part: Partial<Widget>) =>
    editEvent(event.id, (e) => ({
      ...e,
      widgets: e.widgets.map((x) => (x.id === w.id ? { ...x, ...part } : x)),
    }));
  const commit = () => {
    if (!cancelled.current) patch({ title: title.trim() || w.title });
    setRenaming(false);
  };
  return (
    <section
      className={`card widget ${w.kind === "Links" ? "links-widget" : ""}`}
    >
      <div className="widget-heading">
        <div className="widget-title">
          {renaming ? (
            <input
              aria-label="Widget name"
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  cancelled.current = true;
                  setRenaming(false);
                  setTitle(w.title);
                }
                if (e.key === "Enter") commit();
              }}
            />
          ) : (
            <h3>{w.title}</h3>
          )}
          {w.kind === "Contacts" && (
            <>
              <span className="count-badge">{rows.length}</span>
              <button
                className="rename"
                aria-label={`Rename ${w.title}`}
                onClick={() => {
                  cancelled.current = false;
                  setTitle(w.title);
                  setRenaming(true);
                }}
              >
                <Pencil size={14} />
              </button>
            </>
          )}
        </div>
        <details>
          <summary aria-label={`Menu for ${w.title}`}>•••</summary>
          <div className="dropdown right">
            {w.kind === "Event Information" ? (
              <button onClick={() => notice("Event Information menu")}>
                Event Information options
              </button>
            ) : (
              <>
                {w.kind === "Contacts" && (
                  <button onClick={() => setFiltering(true)}>Filter</button>
                )}
                <button onClick={remove}>Remove</button>
              </>
            )}
          </div>
        </details>
      </div>
      {w.kind === "Event Information" ? (
        <div className="event-info">
          <div className="event-orb">◈</div>
          <div>
            <h2>{event.name}</h2>
            <p>{dateRange(event.startDate, event.endDate)}</p>
            <strong>
              {dateStatus(
                event.startDate,
                event.endDate,
                referenceDate(event.timeZone),
              )}
            </strong>
          </div>
        </div>
      ) : w.kind === "Contacts" ? (
        <>
          <div
            className="chart"
            role="img"
            aria-label={`Candidate contact history, ${rows.length} matching fictional contacts. Native chart formula unverified.`}
          >
            <ResponsiveContainer width="100%" height={132}>
              <LineChart
                data={history}
                margin={{ top: 10, right: 10, bottom: 0, left: -25 }}
              >
                <XAxis
                  dataKey="ordinal"
                  type="number"
                  domain={[
                    dateOrdinal("2026-05-11"),
                    dateOrdinal("2026-06-22"),
                  ]}
                  ticks={[
                    "2026-05-11",
                    "2026-05-25",
                    "2026-06-08",
                    "2026-06-22",
                  ].map(dateOrdinal)}
                  tickFormatter={(v) =>
                    new Date(v * 86400000).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      timeZone: "UTC",
                    })
                  }
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  domain={[0, Math.max(100, Math.ceil(rows.length / 50) * 50)]}
                  ticks={[0, 50, 100]}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  labelFormatter={(v) =>
                    new Date(Number(v) * 86400000).toISOString().slice(0, 10)
                  }
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#7634ed"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <details className="chart-caption">
            <summary>Candidate history · demo data</summary>
            <p>
              Candidate history from assistant-reported creation totals; native
              chart formula unverified. Filtered records are fictional demo
              data.
            </p>
          </details>
          {event.id !== "consilium26" && (
            <p className="muted">No contact fixture for this event.</p>
          )}
        </>
      ) : (
        <div className="link-scroll">
          {Object.entries(linkGroups).map(([group, items]) => (
            <section key={group}>
              <h4>{group}</h4>
              {(event.id === "consilium26" ? items : []).map((item) => (
                <div className="link-row" key={item.url}>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    {item.label}
                  </a>
                  {item.check && (
                    <CheckIcon
                      color="#24a577"
                      size={14}
                      aria-label="Source displayed a check mark"
                    />
                  )}
                  <button
                    aria-label={`Copy ${item.label} link`}
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(item.url);
                        setCopied("Link copied");
                      } catch {
                        setCopied(
                          "Could not copy link. Select the link to copy it manually.",
                        );
                      }
                    }}
                  >
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </section>
          ))}
          {event.id !== "consilium26" && <p>No link fixture for this event.</p>}
          <p role="status">{copied}</p>
        </div>
      )}
      {filtering && (
        <ContactFilter
          filter={w.filter}
          apply={(filter) => patch({ filter })}
          close={() => setFiltering(false)}
        />
      )}
    </section>
  );
}
