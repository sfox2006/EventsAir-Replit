import { useState } from "react";
import { Star, RefreshCw, Plus } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import type { EventRecord, Widget } from "../types";
import { DemoWidget } from "../components/widgets/Widgets";
import { widgetOptions } from "../data/catalogs";
import { Dialog } from "../components/Dialog";
export function EventDashboard({ event }: { event: EventRecord }) {
  const { editEvent, reload, notice } = useDemo();
  const [adding, setAdding] = useState(false),
    [loading, setLoading] = useState(false),
    [removed, setRemoved] = useState<Widget | null>(null);
  return (
    <>
      <div className="page-heading">
        <h1>Event dashboard</h1>
        <div className="actions">
          <button
            onClick={() =>
              editEvent(event.id, (e) => ({ ...e, favorite: !e.favorite }))
            }
          >
            <Star size={16} fill={event.favorite ? "#ffc443" : "none"} />
            {event.favorite ? "Un-favorite" : "Add to favorites"}
          </button>
          <button
            onClick={() => {
              setLoading(true);
              reload();
              setTimeout(() => setLoading(false), 180);
            }}
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="primary" onClick={() => setAdding(true)}>
            <Plus size={16} />
            Add Widget
          </button>
        </div>
      </div>
      {loading ? (
        <p role="status">Loading demo store…</p>
      ) : (
        <div
          className={`dashboard-grid ${event.widgets.length === 1 ? "single-widget" : ""}`}
        >
          {[...event.widgets]
            .sort((a, b) => a.order - b.order)
            .map((w) => (
              <DemoWidget
                key={w.id}
                event={event}
                widget={w}
                remove={() => {
                  setRemoved(w);
                  editEvent(event.id, (e) => ({
                    ...e,
                    widgets: e.widgets.filter((x) => x.id !== w.id),
                  }));
                }}
              />
            ))}
        </div>
      )}
      {removed && (
        <p role="status">
          Widget removed locally.{" "}
          <button
            onClick={() => {
              editEvent(event.id, (e) => ({
                ...e,
                widgets: [...e.widgets, removed],
              }));
              setRemoved(null);
            }}
          >
            Undo
          </button>
        </p>
      )}
      {!["ls26", "consilium26"].includes(event.id) && (
        <p className="muted">
          Original widget configuration for this event was not inspected.
        </p>
      )}
      {adding && (
        <Dialog title="Add Widget" close={() => setAdding(false)}>
          <p>
            Some widgets can be added more than once, each with its own filter
            and name.
          </p>
          <div className="catalog-list">
            {widgetOptions.map((kind) => (
              <button
                key={kind}
                onClick={() => {
                  setAdding(false);
                  if (kind === "Contacts" || kind === "Links") {
                    editEvent(event.id, (e) => ({
                      ...e,
                      widgets: [
                        ...e.widgets,
                        {
                          id: crypto.randomUUID(),
                          eventId: e.id,
                          kind,
                          title: kind,
                          filter: {},
                          order:
                            Math.max(-1, ...e.widgets.map((w) => w.order)) + 1,
                        },
                      ],
                    }));
                  } else
                    notice(
                      kind,
                      "Original widget formula and visual form not inspected; unavailable in this demo.",
                    );
                }}
              >
                {kind}
              </button>
            ))}
          </div>
        </Dialog>
      )}
    </>
  );
}
