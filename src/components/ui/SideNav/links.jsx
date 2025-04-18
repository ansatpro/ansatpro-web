/**
 * Navigation links configuration for the SideNav component
 * Each link includes a path, label and icon
 */
import {
  Home,
  MessageSquareText,
  Settings,
  Users,
  Download,
} from "lucide-react";

/**
 * Array of navigation link objects
 *
 * @type {Array<{
 *   href: string,
 *   label: string,
 *   icon: React.ReactElement
 * }>}
 */
export const links = [
  { href: "/facilitator/home", label: "Home", icon: <Home /> },
  { href: "/facilitator/student", label: "Students", icon: <Users /> },
  { href: "/facilitator/feedback", label: "Feedback", icon: <MessageSquareText /> },
  { href: "/facilitator/report", label: "Report", icon: <Download /> },
  { href: "/facilitator/settings", label: "Settings", icon: <Settings /> },
];
