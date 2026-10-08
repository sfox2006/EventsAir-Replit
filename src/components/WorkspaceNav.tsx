import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ChartNoAxesCombined,
  Mail,
  Bell,
  Wallet,
  Folder,
  ClipboardList,
  Globe,
  Zap,
  Settings,
} from "lucide-react";
export const workspacePages = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["agenda", "Agenda", CalendarDays],
  ["attendees", "Attendees", Users],
  ["reporting", "Reporting", ChartNoAxesCombined],
  ["communications", "Comms", Mail],
  ["alerts", "Alerts", Bell],
  ["accounting", "Accounting", Wallet],
  ["project", "Project", Folder],
  ["run-sheet", "Run Sheet", ClipboardList],
  ["online", "Online", Globe],
  ["express-actions", "Express Actions", Zap],
  ["setup", "Setup", Settings],
] as const;
export function WorkspaceNav({ id }: { id: string }) {
  return (
    <aside className="rail">
      {workspacePages.map(([route, label, Icon]) => (
        <NavLink
          key={route}
          to={`/event/${id}/${route}`}
          className={({ isActive }) => (isActive ? "selected" : "")}
        >
          <Icon size={22} />
          <span>{label}</span>
        </NavLink>
      ))}
    </aside>
  );
}
