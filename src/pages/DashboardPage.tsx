import { useEffect, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import type { Enrollment } from "@/types";
import { StatusPill } from "@/components/StatusPill";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  Star,
} from "lucide-react";
import { Link } from "react-router";
import { WriteReviewDialog } from "./Admin/WriteReviewDialog";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

export default function DashboardPage() {
  const { getToken } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Review dialog state
  const [reviewSession, setReviewSession] = useState<Enrollment | null>(null);

  const fetchEnrollments = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/sessions/my-sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load sessions");
      const data: Enrollment[] = await res.json();
      setEnrollments(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">My Sessions</h1>
      <p className="text-muted-foreground mb-8">
        Track your upcoming and past mentoring sessions.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {enrollments.length === 0 && !error && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="mb-4">You haven&apos;t booked any sessions yet.</p>
          <Button asChild>
            <Link to="/">Browse mentors</Link>
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {enrollments.map((enrollment) => {
          const isCompleted = enrollment.sessionStatus === "completed";
          const hasReview = !!enrollment.studentReview;

          return (
            <Card key={enrollment.id} className="flex flex-col">
              <CardContent className="p-5 flex flex-col gap-3 flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{enrollment.subjectName}</h3>
                    <p className="text-sm text-muted-foreground">{enrollment.mentorName}</p>
                  </div>
                  {enrollment.mentorProfileImageUrl ? (
                    <img
                      src={enrollment.mentorProfileImageUrl}
                      alt={enrollment.mentorName}
                      className="size-10 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="size-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold shrink-0">
                      {enrollment.mentorName.charAt(0)}
                    </div>
                  )}
                </div>

                {/* Session details */}
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {new Date(enrollment.sessionAt).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {new Date(enrollment.sessionAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {enrollment.durationMinutes
                      ? ` · ${enrollment.durationMinutes} min`
                      : ""}
                  </span>
                </div>

                {/* Status badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusPill
                    status={enrollment.sessionStatus as "pending" | "accepted" | "completed" | "cancelled"}
                  />
                  <StatusPill
                    status={enrollment.paymentStatus}
                  />
                </div>

                {/* Meeting link */}
                {enrollment.meetingLink && (
                  <a
                    href={enrollment.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Join meeting
                  </a>
                )}

                {/* Existing review */}
                {hasReview && (
                  <div className="p-2 bg-muted rounded-lg">
                    <div className="flex items-center gap-1 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-3 ${
                            i < (enrollment.studentRating ?? 0)
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {enrollment.studentReview}
                    </p>
                  </div>
                )}

                {/* Write Review button — only for completed sessions without a review */}
                {isCompleted && !hasReview && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-auto"
                    onClick={() => setReviewSession(enrollment)}
                  >
                    <Star className="size-3.5" />
                    Write a review
                  </Button>
                )}

                {/* View mentor profile link */}
                {enrollment.mentorId && (
                  <Link
                    to={`/mentors/${enrollment.mentorId}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    View mentor profile →
                  </Link>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Write Review Dialog */}
      {reviewSession && (
        <WriteReviewDialog
          isOpen={!!reviewSession}
          onClose={() => setReviewSession(null)}
          sessionId={reviewSession.id}
          mentorName={reviewSession.mentorName}
          subjectName={reviewSession.subjectName}
          onSuccess={fetchEnrollments}
        />
      )}
    </div>
  );
}