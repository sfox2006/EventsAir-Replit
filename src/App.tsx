import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useParams,
} from "react-router-dom";
import { DemoProvider, useDemo } from "./state/DemoContext";
import { Header } from "./components/Header";
import { WorkspaceNav, workspacePages } from "./components/WorkspaceNav";
import { Dialog } from "./components/Dialog";
import { EventForm } from "./components/EventForm";
import { EventSelection } from "./pages/EventSelection";
import { EventDashboard } from "./pages/EventDashboard";
import * as Pages from "./pages/WorkspacePages";
function Footer() {
  const { blocked, reset } = useDemo();
  const [info, setInfo] = useState(false),
    [confirm, setConfirm] = useState(false);
  return (
    <>
      <footer>
        <button onClick={() => setInfo(true)}>Demo - local mock data ⓘ</button>
        {blocked && (
          <span role="status">
            Browser storage unavailable; changes won't persist.
          </span>
        )}
      </footer>
      {info && (
        <Dialog title="About this demo" close={() => setInfo(false)}>
          <p>
            Public reconstruction using fictional contacts and browser-local
            edits. No EventsAir connection, authentication, communications or
            financial processing.
          </p>
          <p>
            Reference clock:{" "}
            {import.meta.env.VITE_REFERENCE_DATE || "2026-10-09"}. “live” uses
            each event’s timezone after rebuilding.
          </p>
          <p>
            Contact history uses assistant-reported creation buckets; native
            chart formula and timestamp timezone basis remain unverified.
            Unknown workflows are unavailable.
          </p>
          <button onClick={() => setConfirm(true)}>Reset demo</button>
        </Dialog>
      )}
      {confirm && (
        <Dialog title="Reset demo?" close={() => setConfirm(false)}>
          <p>
            Restore fixtures and remove all saved local edits and filter
            presets?
          </p>
          <button
            className="primary"
            onClick={() => {
              reset();
              setConfirm(false);
              setInfo(false);
              window.location.assign("/event/selection");
            }}
          >
            Reset demo
          </button>
        </Dialog>
      )}
    </>
  );
}
function GlobalNotice() {
  const { message, closeNotice } = useDemo();
  return message ? (
    <Dialog title={message.title} close={closeNotice}>
      <p>{message.text}</p>
      <button onClick={closeNotice}>Close</button>
    </Dialog>
  ) : null;
}
function Home({ form = false }: { form?: boolean }) {
  const { tab } = useParams();
  if (
    form &&
    !["Details", "Modules", "ExternalConnections", "AccessRights"].includes(
      tab || "",
    )
  )
    return <NotFound />;
  return (
    <>
      <Header />
      <EventSelection />
      {form && <EventForm />}
      <Footer />
    </>
  );
}
function Workspace() {
  const { eventId, page = "dashboard", tab } = useParams();
  const { store } = useDemo();
  const event = store.events.find((e) => e.id === eventId);
  if (
    !event ||
    !workspacePages.some(([r]) => r === page) ||
    (tab &&
      !["Details", "Modules", "ExternalConnections", "AccessRights"].includes(
        tab,
      ))
  )
    return <NotFound />;
  if (event.kind === "Contact Store")
    return (
      <>
        <Header />
        <main>
          <h1>{event.name}</h1>
          <p>Contact Store workspace uninspected; unavailable in this demo.</p>
          <Link to="/event/selection">Home</Link>
        </main>
        <Footer />
      </>
    );
  const components: Record<string, React.ReactNode> = {
    dashboard: <EventDashboard event={event} />,
    agenda: <Pages.Agenda event={event} />,
    attendees: <Pages.Attendees event={event} />,
    reporting: <Pages.Reporting event={event} />,
    communications: <Pages.Communications event={event} />,
    alerts: <Pages.Alerts event={event} />,
    accounting: <Pages.Accounting event={event} />,
    project: <Pages.Project event={event} />,
    "run-sheet": <Pages.RunSheet event={event} />,
    online: <Pages.Online event={event} />,
    "express-actions": <Pages.ExpressActions />,
    setup: <Pages.Setup event={event} />,
  };
  return (
    <>
      <Header eventId={event.id} />
      <WorkspaceNav id={event.id} />
      <main className="workspace" key={`${event.id}-${page}`}>
        {page !== "dashboard" && (
          <h1>{workspacePages.find(([r]) => r === page)![1]}</h1>
        )}
        {components[page]}
      </main>
      {tab && <EventForm key={event.id} event={event} />}
      <Footer />
    </>
  );
}
function Preferences() {
  return <WorkspaceOverride />;
}
function WorkspaceOverride() {
  const { eventId, tab } = useParams();
  const { store } = useDemo();
  const event = store.events.find((e) => e.id === eventId);
  if (
    !event ||
    event.kind !== "Event" ||
    !["Details", "Modules", "ExternalConnections", "AccessRights"].includes(
      tab || "",
    )
  )
    return <NotFound />;
  return (
    <>
      <Header eventId={event.id} />
      <WorkspaceNav id={event.id} />
      <main className="workspace">
        <h1>Setup</h1>
        <Pages.Setup event={event} />
      </main>
      <EventForm key={event.id} event={event} />
      <Footer />
    </>
  );
}
function NotFound() {
  return (
    <>
      <Header />
      <main className="home">
        <h1>404 · Page not found</h1>
        <Link to="/event/selection">Home</Link>
      </main>
    </>
  );
}
export default function App() {
  return (
    <DemoProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={<Navigate to="/event/selection" replace />}
          />
          <Route path="/event/selection" element={<Home />} />
          <Route path="/event/selection/filters/details" element={<Home />} />
          <Route
            path="/event/selection/addevent/:tab/new"
            element={<Home form />}
          />
          <Route path="/event/:eventId/:page" element={<Workspace />} />
          <Route
            path="/event/:eventId/agenda/:yyyymmdd"
            element={<AgendaRoute />}
          />
          <Route
            path="/event/:eventId/setup/event/preferences/:tab"
            element={<Preferences />}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <GlobalNotice />
      </BrowserRouter>
    </DemoProvider>
  );
}
function AgendaRoute() {
  const { eventId } = useParams();
  const { store } = useDemo();
  const event = store.events.find((e) => e.id === eventId);
  return !event || event.kind !== "Event" ? (
    <NotFound />
  ) : (
    <>
      <Header eventId={event.id} />
      <WorkspaceNav id={event.id} />
      <main className="workspace">
        <h1>Agenda</h1>
        <Pages.Agenda event={event} />
      </main>
      <Footer />
    </>
  );
}
