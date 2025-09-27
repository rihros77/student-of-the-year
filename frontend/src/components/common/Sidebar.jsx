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
} from "lucide-react";
import logo from "@/assets/zoopla.png";

export default function Sidebar({ activePage }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-300">

      <div className="p-4 flex items-center gap-2">
        <img src={logo} alt="Zoopla" className="h-8 w-8" />
        <span className="font-bold text-lg text-[#736CED]">ZOOPLA</span>
      </div>
      <nav className="mt-4 space-y-1">
        <MenuItem icon={<LayoutDashboard size={18} />} label="Dashboard" active={activePage === 'Dashboard'} />
        <MenuItem icon={<Award size={18} />} label="Achievements" active={activePage === 'Achievements'} />
        <MenuItem icon={<CalendarDays size={18} />} label="Events" active={activePage === 'Events'} />

        <SectionTitle title="Points" />
        <MenuItem icon={<PieChart size={18} />} label="Breakdown" active={activePage === 'Breakdown'} />
        <MenuItem icon={<LineChart size={18} />} label="Timeline" active={activePage === 'Timeline'} />

        <SectionTitle title="Leaderboards" />
        <MenuItem icon={<Users size={18} />} label="Class" active={activePage === 'Class'} />
        <MenuItem icon={<Building2 size={18} />} label="Department" active={activePage === 'Department'} />
        <MenuItem icon={<Globe size={18} />} label="College" active={activePage === 'College'} />

        <SectionTitle title="Documents" />
        <MenuItem icon={<FileText size={18} />} label="Official Transcript" active={activePage === 'Official Transcript'} />
        <MenuItem icon={<Award size={18} />} label="Certificates" active={activePage === 'Certificates'} />
      </nav>
    </aside>
  );
}

function MenuItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 text-sm cursor-pointer ${
        active ? "bg-[#F5F5FF] text-[#736CED] font-medium" : "text-gray-700 hover:bg-gray-50"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function SectionTitle({ title }) {
  return (
    <div className="px-4 pt-4 pb-1 text-xs uppercase text-gray-400 font-semibold">
      {title}
    </div>
  );
}
