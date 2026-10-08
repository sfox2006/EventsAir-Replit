import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, BookOpen, HelpCircle, Menu, ChevronDown } from "lucide-react";
import { useDemo } from "../state/DemoContext";
import { Dialog } from "./Dialog";
export function Header({ eventId }: { eventId?: string }) {
  const { store, notice, update } = useDemo();
  const navigate = useNavigate();
  const [help, setHelp] = useState(false),
    [tab, setTab] = useState("Home"),
    [query, setQuery] = useState("");
  const event = store.events.find((e) => e.id === eventId);
  const articles = [
    "Version 16.1.6 - May 26, 2025",
    "Attendee App",
    "Version 16.1.7 - June 9, 2025",
    "Version 16.1.5 - April 29, 2025",
  ];
  return (
    <>
      <header>
        <Link className="brand" to="/event/selection">
          <span className="brandmark">◈</span>EventsAir
        </Link>
        <details className="switcher">
          <summary>
            {event?.name || "Home"} <ChevronDown size={14} />
          </summary>
          <div className="dropdown">
            <Link to="/event/selection">Home</Link>
            {store.recents
              .map((id) => store.events.find((e) => e.id === id))
              .filter((e) => e && e.kind === "Event")
              .map((e) => (
                <button
                  key={e!.id}
                  onClick={(ev) => {
                    (
                      ev.currentTarget.closest("details") as HTMLDetailsElement
                    ).open = false;
                    update((s) => ({
                      ...s,
                      recents: [
                        e!.id,
                        ...s.recents.filter((id) => id !== e!.id),
                      ].slice(0, 6),
                    }));
                    navigate(`/event/${e!.id}/dashboard`);
                  }}
                >
                  {e!.name}
                </button>
              ))}
          </div>
        </details>
        <nav className="header-tools">
          <button
            aria-label="Assistant"
            title="Planner Assistant"
            onClick={() =>
              notice(
                "Planner Assistant",
                "The observed control opens a separate event-scoped assistant with conversations and AI dashboards. That external service is not connected to this demo.",
              )
            }
          >
            <Bot size={18} />
            <span>Assistant</span>
            <small>Beta</small>
          </button>
          <button
            aria-label="Learn"
            title="Structured video lessons, exercises and optional certification"
            onClick={() => notice("Learn")}
          >
            <BookOpen size={18} />
            <span>Learn</span>
          </button>
          <button aria-label="Help" onClick={() => setHelp(true)}>
            <HelpCircle size={18} />
            <span>Help</span>
          </button>
          <details>
            <summary className="dark-button">
              <Menu size={16} /> Menu
            </summary>
            <div className="dropdown right">
              {Object.entries({
                Tools: [
                  "Projects overview",
                  "Contact locator",
                  "AirDrive",
                  "Reporting",
                ],
                Settings: ["Application setup", "Your account"],
                Actions: ["Switch modes", "Log out"],
              }).map(([group, items]) => (
                <section key={group}>
                  <h4>{group}</h4>
                  {items.map((x) => (
                    <button key={x} onClick={() => notice(x)}>
                      {x}
                    </button>
                  ))}
                </section>
              ))}
            </div>
          </details>
        </nav>
      </header>
      {help && (
        <Dialog title="Help" drawer close={() => setHelp(false)}>
          <div className="tabs">
            {["Home", "Messages", "Help", "News"].map((t) => (
              <button
                key={t}
                className={t === tab ? "selected" : ""}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <h2>Hi Sam 👋</h2>
          <h2>How can we help?</h2>
          {["Home", "Help"].includes(tab) ? (
            <>
              <button
                className="primary"
                onClick={() => notice("Send us a message")}
              >
                Send us a message
              </button>
              <FieldSearch value={query} change={setQuery} />
              {articles
                .filter((x) => x.toLowerCase().includes(query.toLowerCase()))
                .map((a) => (
                  <button className="article" key={a} onClick={() => notice(a)}>
                    {a} →
                  </button>
                ))}
            </>
          ) : (
            <p>
              Original {tab.toLowerCase()} details not inspected; unavailable in
              this demo.
            </p>
          )}
        </Dialog>
      )}
    </>
  );
}
function FieldSearch({
  value,
  change,
}: {
  value: string;
  change: (s: string) => void;
}) {
  return (
    <label className="field">
      <span>Search for help</span>
      <input value={value} onChange={(e) => change(e.target.value)} />
    </label>
  );
}
