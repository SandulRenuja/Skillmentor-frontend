import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  BookOpen, 
  UserPlus, 
  LogOut, 
  ChevronRight 
} from "lucide-react";
import { cn } from "@/lib/utils";
import SkillMentorLogo from "@/assets/logo.webp";

const menuItems = [
  { icon: LayoutDashboard, label: "Manage Bookings", path: "/admin/bookings" },
  { icon: BookOpen, label: "Create Subject", path: "/admin/subjects/create" },
  { icon: UserPlus, label: "Add New Mentor", path: "/admin/mentors/create" },
];

export function AdminSidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 bg-black text-white flex flex-col border-r border-white/10">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <img src={SkillMentorLogo} alt="Logo" className="size-10 rounded-full" />
        <span className="font-bold text-xl tracking-tight">Admin Panel</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg transition-all group",
                isActive ? "bg-primary text-black" : "hover:bg-white/10 text-gray-400 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon className="size-5" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight className={cn("size-4 opacity-0 group-hover:opacity-100 transition-opacity", isActive && "opacity-100")} />
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <Link to="/" className="flex items-center gap-3 p-3 text-gray-400 hover:text-white transition-colors">
          <LogOut className="size-5" />
          <span className="font-medium">Exit to Site</span>
        </Link>
      </div>
    </aside>
  );
}