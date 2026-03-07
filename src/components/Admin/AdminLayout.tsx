import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth, useUser } from "@clerk/clerk-react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarCheck,
  ChevronRight,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    label: "Overview",
    path: "/admin",
    icon: <LayoutDashboard className="size-4" />,
    description: "Platform statistics",
  },
  {
    label: "Mentors",
    path: "/admin/mentors",
    icon: <Users className="size-4" />,
    description: "Create & manage mentors",
  },
  {
    label: "Subjects",
    path: "/admin/subjects",
    icon: <BookOpen className="size-4" />,
    description: "Create & assign subjects",
  },
  {
    label: "Bookings",
    path: "/admin/bookings",
    icon: <CalendarCheck className="size-4" />,
    description: "Manage session bookings",
  },
];

function checkIsAdmin(user: ReturnType<typeof useUser>["user"]): boolean {
  if (!user) return false;

  const metadata = user.publicMetadata;
  if (!metadata) return false;

  // Check roles array: ["ADMIN"] or ["admin"]
  const rolesArray = metadata.roles as string[] | undefined;
  if (Array.isArray(rolesArray)) {
    const hasAdmin = rolesArray.some(
      (r) => r.toUpperCase() === "ADMIN"
    );
    if (hasAdmin) return true;
  }

  // Check single role string: "admin" or "ADMIN"
  const roleSingle = metadata.role as string | undefined;
  if (typeof roleSingle === "string") {
    if (roleSingle.toUpperCase() === "ADMIN") return true;
  }

  // Check superUser flag (fallback)
  if (metadata.superUser === true) return true;

  return false;
}

export default function AdminLayout() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Debug log — remove after fixing
  useEffect(() => {
    if (userLoaded && user) {
      console.log("[AdminLayout] publicMetadata:", user.publicMetadata);
      console.log("[AdminLayout] isAdmin:", checkIsAdmin(user));
    }
  }, [userLoaded, user]);

  useEffect(() => {
    if (!isLoaded || !userLoaded) return;

    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    if (!checkIsAdmin(user)) {
      console.warn("[AdminLayout] Not admin, redirecting to /dashboard");
      navigate("/dashboard");
    }
  }, [isLoaded, userLoaded, isSignedIn, user, navigate]);

  // Wait for BOTH auth and user to be fully loaded before deciding
  if (!isLoaded || !userLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-mono">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn || !checkIsAdmin(user)) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex font-sans">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-30 w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col transition-transform duration-300",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="p-5 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Shield className="size-4 text-zinc-900" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">SkillMentor</p>
              <p className="text-amber-400 text-xs font-mono uppercase tracking-wider">
                Admin Panel
              </p>
            </div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group",
                isActive(item.path)
                  ? "bg-amber-400/10 text-amber-400 border border-amber-400/20"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent",
              )}
            >
              <span
                className={cn(
                  "transition-colors",
                  isActive(item.path)
                    ? "text-amber-400"
                    : "group-hover:text-white",
                )}
              >
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.label}</p>
                <p
                  className={cn(
                    "text-xs truncate",
                    isActive(item.path)
                      ? "text-amber-400/60"
                      : "text-zinc-600 group-hover:text-zinc-400",
                  )}
                >
                  {item.description}
                </p>
              </div>
              {isActive(item.path) && (
                <ChevronRight className="size-3 text-amber-400 shrink-0" />
              )}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-800">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1">
            <div className="size-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
              {user?.firstName?.charAt(0) ?? "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-zinc-500 text-xs truncate">
                {user?.primaryEmailAddress?.emailAddress}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut(() => navigate("/"))}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-400/5 transition-colors text-sm"
          >
            <LogOut className="size-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="size-6 bg-amber-400 rounded flex items-center justify-center">
              <Shield className="size-3 text-zinc-900" />
            </div>
            <span className="text-white font-semibold text-sm">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            {sidebarOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}