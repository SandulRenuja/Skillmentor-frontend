import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import {
  Building2,
  Calendar,
  GraduationCap,
  ShieldCheck,
  Star,
  ThumbsUp,
  Users,
  BookOpen,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SchedulingModal } from "@/components/SchedulingModel";
import { SignupDialog } from "@/components/SignUpDialog";
import { useAuth } from "@clerk/clerk-react";
import type { MentorProfile, Mentor, SubjectStat } from "@/types";
import { cn } from "@/lib/utils";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-4",
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-muted-foreground",
          )}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-4 bg-card border rounded-xl text-center">
      <div className="text-primary mb-1">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();

  const [profile, setProfile] = useState<MentorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [schedulingOpen, setSchedulingOpen] = useState(false);
  const [preselectedSubjectId, setPreselectedSubjectId] = useState<number | undefined>();
  const [signupOpen, setSignupOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/api/v1/mentors/${id}/profile`)
      .then((res) => {
        if (!res.ok) throw new Error("Mentor not found");
        return res.json() as Promise<MentorProfile>;
      })
      .then(setProfile)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const handleBookSubject = (subjectId: number) => {
    if (!isSignedIn) {
      setSignupOpen(true);
      return;
    }
    setPreselectedSubjectId(subjectId);
    setSchedulingOpen(true);
  };

  const handleScheduleClick = () => {
    if (!isSignedIn) {
      setSignupOpen(true);
      return;
    }
    setPreselectedSubjectId(undefined);
    setSchedulingOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="container py-12">
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error ?? "Mentor not found"}</AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="size-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  const mentorName = `${profile.firstName} ${profile.lastName}`;

  // Build a Mentor-shaped object for the SchedulingModal (which expects Mentor type)
  const mentorForModal: Mentor = {
    id: profile.id,
    mentorId: profile.mentorId,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    title: profile.title,
    profession: profile.profession,
    company: profile.company,
    experienceYears: profile.experienceYears,
    bio: profile.bio,
    profileImageUrl: profile.profileImageUrl,
    positiveReviews: profile.positiveReviews,
    totalEnrollments: profile.totalEnrollments,
    isCertified: profile.isCertified,
    startYear: profile.startYear,
    subjects: profile.subjects.map((s) => ({
      id: s.id,
      subjectName: s.subjectName,
      description: s.description,
      courseImageUrl: s.courseImageUrl,
    })),
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* ── Back button ─────────────────────────────────────────────── */}
        <div className="container pt-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> Back to mentors
          </button>
        </div>

        {/* ── Hero / Header ────────────────────────────────────────────── */}
        <section className="container py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile image */}
            {profile.profileImageUrl ? (
              <img
                src={profile.profileImageUrl}
                alt={mentorName}
                className="size-32 md:size-40 rounded-2xl object-cover object-top shrink-0 shadow-md"
              />
            ) : (
              <div className="size-32 md:size-40 rounded-2xl bg-primary/20 flex items-center justify-center text-5xl font-bold shrink-0">
                {profile.firstName.charAt(0)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold">{mentorName}</h1>
                {profile.isCertified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                    <ShieldCheck className="size-3" /> Certified
                  </span>
                )}
              </div>

              {profile.title && (
                <p className="text-lg text-muted-foreground mb-1">{profile.title}</p>
              )}

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                {profile.company && (
                  <span className="flex items-center gap-1">
                    <Building2 className="size-4" /> {profile.company}
                  </span>
                )}
                {profile.startYear && (
                  <span className="flex items-center gap-1">
                    <Calendar className="size-4" /> Tutor since {profile.startYear}
                  </span>
                )}
                {profile.profession && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-4" /> {profile.profession}
                  </span>
                )}
              </div>

              {/* Rating + reviews */}
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={profile.averageRating ?? 0} />
                <span className="font-semibold">{(profile.averageRating ?? 0).toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({profile.reviewCount} review{profile.reviewCount !== 1 ? "s" : ""})
                </span>
                {profile.positiveReviews != null && (
                  <span className="flex items-center gap-1 text-sm text-muted-foreground ml-2">
                    <ThumbsUp className="size-3.5" /> {profile.positiveReviews}% positive
                  </span>
                )}
              </div>

              <Button
                onClick={handleScheduleClick}
                className="bg-black text-white hover:bg-black/80"
                disabled={profile.subjects.length === 0}
              >
                Schedule a session
              </Button>
            </div>
          </div>
        </section>

        {/* ── Stats row ────────────────────────────────────────────────── */}
        <section className="container pb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard
              label="Students taught"
              value={profile.totalEnrollments}
              icon={<Users className="size-5" />}
            />
            <StatCard
              label="Years experience"
              value={profile.experienceYears}
              icon={<Calendar className="size-5" />}
            />
            <StatCard
              label="Positive reviews"
              value={`${profile.positiveReviews ?? 0}%`}
              icon={<ThumbsUp className="size-5" />}
            />
            <StatCard
              label="Subjects taught"
              value={profile.subjects.length}
              icon={<BookOpen className="size-5" />}
            />
          </div>
        </section>

        <div className="container pb-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left column: About + Subjects ──────────────────────────── */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            {profile.bio && (
              <section>
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
                {profile.experienceYears > 0 && (
                  <div className="mt-4 p-3 bg-muted rounded-lg inline-flex items-center gap-2 text-sm">
                    <GraduationCap className="size-4 text-primary" />
                    {profile.experienceYears} year{profile.experienceYears !== 1 ? "s" : ""} of
                    professional experience
                  </div>
                )}
              </section>
            )}

            {/* Subjects taught */}
            {profile.subjects.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold mb-3">Subjects Taught</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {profile.subjects.map((subject: SubjectStat) => (
                    <Card key={subject.id} className="overflow-hidden">
                      {subject.courseImageUrl && (
                        <div className="h-32 overflow-hidden">
                          <img
                            src={subject.courseImageUrl}
                            alt={subject.subjectName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <CardContent className="p-4">
                        <h3 className="font-semibold mb-1">{subject.subjectName}</h3>
                        {subject.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {subject.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="size-3.5" />
                            {subject.enrollmentCount} student
                            {subject.enrollmentCount !== 1 ? "s" : ""} enrolled
                          </span>
                          <Button
                            size="sm"
                            onClick={() => handleBookSubject(subject.id)}
                          >
                            Book
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Right column: Reviews ──────────────────────────────────── */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">
              Reviews{" "}
              <span className="text-base font-normal text-muted-foreground">
                ({profile.reviewCount})
              </span>
            </h2>

            {profile.reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No reviews yet. Be the first to leave one after your session!
              </p>
            ) : (
              <div className="space-y-3">
                {profile.reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-card border rounded-xl space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{review.studentName}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {review.rating && (
                      <StarRating rating={review.rating} />
                    )}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.reviewText}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <SignupDialog
        isOpen={signupOpen}
        onClose={() => setSignupOpen(false)}
      />
      <SchedulingModal
        isOpen={schedulingOpen}
        onClose={() => setSchedulingOpen(false)}
        mentor={mentorForModal}
        preselectedSubjectId={preselectedSubjectId}
      />
    </>
  );
}