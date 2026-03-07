import { useEffect, useState, useMemo } from "react";
import { useAuth } from "@clerk/clerk-react";
import { adminGetAllSessions, adminUpdateSession } from "@/lib/api-admin";
import type { AdminSession } from "@/lib/api-admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Search,
  RefreshCw,
  CheckCircle,
  Link2,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  AlertCircle,
  Calendar,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SortKey = keyof AdminSession;
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function PaymentBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    confirmed: "bg-green-400/10 text-green-400 border-green-400/20",
    completed: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SessionBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    scheduled: "bg-purple-400/10 text-purple-400 border-purple-400/20",
    completed: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    cancelled: "bg-red-400/10 text-red-400 border-red-400/20",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border",
        styles[status] ?? "bg-zinc-800 text-zinc-400 border-zinc-700",
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

const PAGE_SIZE = 10;

export default function ManageBookingsPage() {
  const { getToken } = useAuth();
  const [sessions, setSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>("sessionAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [page, setPage] = useState(0);

  // Meeting link dialog
  const [linkDialog, setLinkDialog] = useState<{ open: boolean; sessionId: number | null }>({
    open: false,
    sessionId: null,
  });
  const [meetingLinkInput, setMeetingLinkInput] = useState("");

  const showToast = (type: "success" | "error", msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const loadSessions = async () => {
    setLoading(true);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      const data = await adminGetAllSessions(token);
      setSessions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [getToken]);

  // Filter + Search + Sort
  const filtered = useMemo(() => {
    let list = [...sessions];

    if (statusFilter !== "all") {
      list = list.filter(
        (s) => s.paymentStatus === statusFilter || s.sessionStatus === statusFilter,
      );
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.studentName?.toLowerCase().includes(q) ||
          s.mentorName?.toLowerCase().includes(q) ||
          s.subjectName?.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [sessions, statusFilter, search, sortKey, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronsUpDown className="size-3 text-zinc-600" />;
    return sortDir === "asc" ? (
      <ChevronUp className="size-3 text-amber-400" />
    ) : (
      <ChevronDown className="size-3 text-amber-400" />
    );
  };

  const handleConfirmPayment = async (id: number) => {
    setActionLoading(id);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      await adminUpdateSession(token, id, { paymentStatus: "confirmed" });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, paymentStatus: "confirmed" } : s)),
      );
      showToast("success", "Payment confirmed successfully");
    } catch {
      showToast("error", "Failed to confirm payment");
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkComplete = async (id: number) => {
    setActionLoading(id);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      await adminUpdateSession(token, id, { sessionStatus: "completed" });
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, sessionStatus: "completed" } : s)),
      );
      showToast("success", "Session marked as completed");
    } catch {
      showToast("error", "Failed to mark session as completed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddMeetingLink = async () => {
    if (!linkDialog.sessionId || !meetingLinkInput.trim()) return;
    setActionLoading(linkDialog.sessionId);
    try {
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      await adminUpdateSession(token, linkDialog.sessionId, {
        meetingLink: meetingLinkInput.trim(),
      });
      setSessions((prev) =>
        prev.map((s) =>
          s.id === linkDialog.sessionId
            ? { ...s, meetingLink: meetingLinkInput.trim() }
            : s,
        ),
      );
      setLinkDialog({ open: false, sessionId: null });
      setMeetingLinkInput("");
      showToast("success", "Meeting link added");
    } catch {
      showToast("error", "Failed to add meeting link");
    } finally {
      setActionLoading(null);
    }
  };

  const cols: { key: SortKey; label: string; sortable?: boolean }[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "studentName", label: "Student", sortable: true },
    { key: "mentorName", label: "Mentor", sortable: true },
    { key: "subjectName", label: "Subject", sortable: true },
    { key: "sessionAt", label: "Date", sortable: true },
    { key: "durationMinutes", label: "Duration", sortable: false },
    { key: "paymentStatus", label: "Payment", sortable: true },
    { key: "sessionStatus", label: "Session", sortable: true },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Bookings</h1>
          <p className="text-zinc-400 text-sm mt-1">
            {filtered.length} session{filtered.length !== 1 ? "s" : ""}
            {search || statusFilter !== "all" ? " (filtered)" : " total"}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={loadSessions}
          disabled={loading}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className={cn("size-4 mr-2", loading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <Alert
          className={cn(
            "border",
            toast.type === "success"
              ? "border-green-500/30 bg-green-500/10"
              : "border-red-500/30 bg-red-500/10",
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle className="size-4 text-green-400" />
          ) : (
            <AlertCircle className="size-4 text-red-400" />
          )}
          <AlertDescription
            className={toast.type === "success" ? "text-green-300" : "text-red-300"}
          >
            {toast.msg}
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            placeholder="Search student, mentor, subject..."
            className="pl-9 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30"
          />
        </div>
        <div className="flex gap-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setStatusFilter(opt.value);
                setPage(0);
              }}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                statusFilter === opt.value
                  ? "bg-amber-400 text-zinc-900"
                  : "bg-zinc-900 border border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable && toggleSort(col.key)}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider whitespace-nowrap",
                      col.sortable && "cursor-pointer hover:text-white select-none",
                    )}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon col={col.key} />}
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 bg-zinc-800 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                    No sessions found
                    {(search || statusFilter !== "all") && " matching your filters"}.
                  </td>
                </tr>
              ) : (
                paginated.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-zinc-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                      #{session.id}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-medium">{session.studentName}</p>
                        <p className="text-zinc-500 text-xs">{session.studentEmail}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{session.mentorName}</td>
                    <td className="px-4 py-3 text-zinc-300 max-w-[160px] truncate">
                      {session.subjectName}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="size-3 text-zinc-500 shrink-0" />
                        <span className="text-zinc-300 text-xs whitespace-nowrap">
                          {new Date(session.sessionAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Clock className="size-3 text-zinc-500 shrink-0" />
                        <span className="text-zinc-500 text-xs">
                          {new Date(session.sessionAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-400 text-xs">
                      {session.durationMinutes}m
                    </td>
                    <td className="px-4 py-3">
                      <PaymentBadge status={session.paymentStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <SessionBadge status={session.sessionStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {session.paymentStatus === "pending" && (
                          <Button
                            size="sm"
                            onClick={() => handleConfirmPayment(session.id)}
                            disabled={actionLoading === session.id}
                            className="h-7 px-2 text-xs bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20"
                            variant="outline"
                          >
                            <CheckCircle className="size-3 mr-1" />
                            Confirm
                          </Button>
                        )}
                        {session.paymentStatus === "confirmed" &&
                          session.sessionStatus !== "completed" && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkComplete(session.id)}
                              disabled={actionLoading === session.id}
                              className="h-7 px-2 text-xs bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border border-blue-500/20"
                              variant="outline"
                            >
                              ✓ Complete
                            </Button>
                          )}
                        <Button
                          size="sm"
                          onClick={() => {
                            setLinkDialog({ open: true, sessionId: session.id });
                            setMeetingLinkInput(session.meetingLink ?? "");
                          }}
                          className="h-7 px-2 text-xs bg-zinc-800 text-zinc-400 hover:bg-zinc-700 border border-zinc-700"
                          variant="outline"
                        >
                          <Link2 className="size-3 mr-1" />
                          Link
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-zinc-800 flex items-center justify-between">
            <p className="text-zinc-500 text-xs">
              Page {page + 1} of {totalPages} · {filtered.length} total
            </p>
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-7 px-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              >
                Previous
              </Button>
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                const pg = Math.max(0, Math.min(page - 2, totalPages - 5)) + i;
                return (
                  <Button
                    key={pg}
                    size="sm"
                    variant="outline"
                    onClick={() => setPage(pg)}
                    className={cn(
                      "h-7 w-7 p-0 border-zinc-700 text-xs",
                      pg === page
                        ? "bg-amber-400 text-zinc-900 border-amber-400"
                        : "text-zinc-400 hover:bg-zinc-800",
                    )}
                  >
                    {pg + 1}
                  </Button>
                );
              })}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="h-7 px-2 border-zinc-700 text-zinc-400 hover:bg-zinc-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Link Dialog */}
      <Dialog
        open={linkDialog.open}
        onOpenChange={(open) => {
          if (!open) {
            setLinkDialog({ open: false, sessionId: null });
            setMeetingLinkInput("");
          }
        }}
      >
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add Meeting Link</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter the meeting URL for session #{linkDialog.sessionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-zinc-300 text-sm">Meeting URL</Label>
              <Input
                value={meetingLinkInput}
                onChange={(e) => setMeetingLinkInput(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-amber-400/30"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setLinkDialog({ open: false, sessionId: null })}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddMeetingLink}
                disabled={!meetingLinkInput.trim() || !!actionLoading}
                className="bg-amber-400 text-zinc-900 hover:bg-amber-300 font-semibold"
              >
                Save Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}