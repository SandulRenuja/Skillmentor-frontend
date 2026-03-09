import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Users, BookOpen, CalendarCheck, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "react-router";
import { adminGetAllSessions } from "@/lib/api-admin";
import { getPublicMentors } from "@/lib/api";

interface Stat {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  link: string;
  linkLabel: string;
}

export default function AdminOverviewPage() {
  const { getToken } = useAuth();
  const [totalMentors, setTotalMentors] = useState(0);
  const [sessions, setSessions] = useState<{ paymentStatus: string; sessionStatus: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: "skillmentor-auth" });
        const [mentorData, sessionData] = await Promise.all([
          getPublicMentors(0, 100),
          token ? adminGetAllSessions(token) : Promise.resolve([]),
        ]);
        setTotalMentors(mentorData.totalElements);
        setSessions(sessionData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [getToken]);

  const pending = sessions.filter((s) => s.paymentStatus === "pending").length;
  const completed = sessions.filter((s) => s.sessionStatus === "completed").length;

  const stats: Stat[] = [
    {
      label: "Total Mentors",
      value: loading ? "—" : totalMentors,
      icon: <Users className="size-5" />,
      color: "from-blue-500/20 to-blue-600/10 border-blue-500/20",
      link: "/admin/mentors",
      linkLabel: "Manage mentors",
    },
    {
      label: "Total Bookings",
      value: loading ? "—" : sessions.length,
      icon: <CalendarCheck className="size-5" />,
      color: "from-amber-500/20 to-amber-600/10 border-amber-500/20",
      link: "/admin/bookings",
      linkLabel: "View bookings",
    },
    {
      label: "Pending Payments",
      value: loading ? "—" : pending,
      icon: <TrendingUp className="size-5" />,
      color: "from-orange-500/20 to-orange-600/10 border-orange-500/20",
      link: "/admin/bookings",
      linkLabel: "Review payments",
    },
    {
      label: "Completed Sessions",
      value: loading ? "—" : completed,
      icon: <BookOpen className="size-5" />,
      color: "from-green-500/20 to-green-600/10 border-green-500/20",
      link: "/admin/bookings",
      linkLabel: "View completed",
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
        <p className="text-zinc-400 text-sm mt-1">
           SkillMentor activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gradient-to-br ${stat.color} border rounded-xl p-5 flex flex-col gap-4`}
          >
            <div className="flex items-center justify-between">
              <p className="text-zinc-400 text-sm">{stat.label}</p>
              <span className="text-zinc-300">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-white tabular-nums">
              {stat.value}
            </p>
            <Link
              to={stat.link}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors group"
            >
              {stat.linkLabel}
              <ArrowRight className="size-3 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              label: "Create New Mentor",
              desc: "Add a mentor profile to the platform",
              link: "/admin/mentors",
              color: "hover:border-blue-500/50 hover:bg-blue-500/5",
            },
            {
              label: "Create New Subject",
              desc: "Assign a subject to an existing mentor",
              link: "/admin/subjects",
              color: "hover:border-amber-500/50 hover:bg-amber-500/5",
            },
            {
              label: "Review Pending Payments",
              desc: `${pending} booking${pending !== 1 ? "s" : ""} waiting for review`,
              link: "/admin/bookings",
              color: "hover:border-orange-500/50 hover:bg-orange-500/5",
            },
          ].map((action) => (
            <Link
              key={action.label}
              to={action.link}
              className={`p-4 rounded-xl border border-zinc-800 bg-zinc-900 transition-all ${action.color} group`}
            >
              <p className="text-white font-medium text-sm mb-1">{action.label}</p>
              <p className="text-zinc-500 text-xs">{action.desc}</p>
              <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500 group-hover:text-white transition-colors">
                Go <ArrowRight className="size-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}