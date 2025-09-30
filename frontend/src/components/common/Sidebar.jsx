import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  PieChart,
  LineChart,
  Users,
  Building2,
  Globe,
  FileText,
  Award,
  PlusCircle,
  History,
  Lock,
  Settings,
  Trophy,
  ClipboardList,
  Zap,
} from "lucide-react";
import logo from "@/assets/zoopla.png";

// --- Menu Definitions ---
const studentMenu = [
  { type: "item", icon: Award, label: "Achievements", page: "Achievements" },
  { type: "item", icon: CalendarDays, label: "Events", page: "Events" },
  { type: "title", title: "Points" },
  { type: "item", icon: PieChart, label: "Breakdown", page: "Breakdown" },
  { type: "item", icon: LineChart, label: "Timeline", page: "Timeline" },
  { type: "title", title: "Leaderboards" },
  { type: "item", icon: Users, label: "Class", page: "Class" },
  { type: "item", icon: Building2, label: "Department", page: "Department" },
  { type: "item", icon: Globe, label: "College", page: "College" },
  { type: "title", title: "Documents" },
  { type: "item", icon: FileText, label: "Official Transcript", page: "OfficialTranscript" },
  { type: "item", icon: Award, label: "Certificates", page: "Certificates" },
];

const adminMenu = [
  { type: "title", title: "Content Management" },
  { type: "item", icon: CalendarDays, label: "Manage Events", page: "AdminEvents" },
  { type: "item", icon: Users, label: "Students & Users", page: "AdminUsers" },
  { type: "item", icon: Building2, label: "Departments", page: "AdminDepartments" },
  { type: "item", icon: Zap, label: "Badges Engine", page: "AdminBadges" },

  { type: "title", title: "Scoring & Awards" },
  { type: "item", icon: PlusCircle, label: "Award Points", page: "AwardPoints" },
  { type: "item", icon: History, label: "Audit Trail", page: "AuditTrail" },
  { type: "item", icon: ClipboardList, label: "Reports", page: "AdminReports" },

  { type: "title", title: "System Control" },
  { type: "item", icon: Lock, label: "Snapshot & Freeze", page: "SnapshotFreeze" },
  { type: "item", icon: Trophy, label: "Final Reveal", page: "FinalReveal" },
  { type: "item", icon: Settings, label: "System Settings", page: "SystemSettings" },
];

// --- Sidebar Component ---
export default function Sidebar({ activePage, role = "student" }) {
  const menuData = role === "admin" ? adminMenu : studentMenu;
  const initialDashboardLabel = role === "admin" ? "Admin Dashboard" : "Dashboard";

  return (
    <aside className="w-64 bg-white border-r border-gray-300 min-h-screen">
      <div className="p-4 flex items-center gap-2">
        <img src={logo} alt="Zoopla" className="h-8 w-8" />
        <span className="font-bold text-lg text-[#736CED]">ZOOPLA</span>
      </div>

      <nav className="mt-4 space-y-1">
        {/* Main Dashboard Link */}
        <MenuItem
          icon={<LayoutDashboard size={18} />}
          label={initialDashboardLabel}
          active={activePage === "Dashboard"}
          to="/dashboard"
        />

        {/* Dynamic Menu */}
        {menuData.map((item, index) => {
          if (item.type === "title") return <SectionTitle key={index} title={item.title} />;
          if (item.type === "item") {
            const Icon = item.icon;

            // Map page names to URLs
            const path =
  item.page === "AwardPoints"
    ? "/admin/award-points"
    : item.page === "Breakdown"
    ? "/student/point-breakdown"
    : item.page === "Timeline"
    ? "/student/point-timeline"
    : item.page === "AdminEvents"
    ? "/admin/manage-events"
    : `/${item.page.replace(/\s+/g, "-").toLowerCase()}`;



            return (
              <MenuItem
                key={index}
                icon={<Icon size={18} />}
                label={item.label}
                active={activePage === item.page}
                to={path}
              />
            );
          }
          return null;
        })}
      </nav>
    </aside>
  );
}

// --- MenuItem Component ---
function MenuItem({ icon, label, active, to }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-2 text-sm rounded-md ${
        active ? "bg-[#F5F5FF] text-[#736CED] font-medium" : "text-gray-700 hover:bg-gray-50"
      } transition-colors`}
    >
      {icon}
      {label}
    </Link>
  );
}

// --- SectionTitle Component ---
function SectionTitle({ title }) {
  return (
    <div className="px-4 pt-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
      {title}
    </div>
  );
}
