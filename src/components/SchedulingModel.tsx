import { useState } from "react";
import { Calendar } from "./ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { useNavigate } from "react-router";
import type { Mentor } from "@/types";
import { Building2, GraduationCap, ShieldCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  /** Pre-select a specific subject by id (from profile page "Book This Subject") */
  preselectedSubjectId?: number;
}

const TIME_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00",
];

export function SchedulingModal({
  isOpen,
  onClose,
  mentor,
  preselectedSubjectId,
}: SchedulingModalProps) {
  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | undefined>(
    preselectedSubjectId ?? mentor.subjects[0]?.id,
  );
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const selectedSubject = mentor.subjects.find((s) => s.id === selectedSubjectId);

  // Disable past dates in the calendar
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleDateSelect = (d: Date | undefined) => {
    setError(null);
    setDate(d);
  };

  const handleSchedule = () => {
    setError(null);

    if (!date || !selectedTime || !selectedSubject) {
      setError("Please select a date, time, and subject before continuing.");
      return;
    }

    const sessionDateTime = new Date(date);
    const [hours, minutes] = selectedTime.split(":");
    sessionDateTime.setHours(Number.parseInt(hours), Number.parseInt(minutes), 0, 0);

    // Client-side past-date guard (backend also validates)
    if (sessionDateTime <= new Date()) {
      setError("The selected date and time is in the past. Please choose a future slot.");
      return;
    }

    const sessionId = `${mentor.id}-${Date.now()}`;
    const searchParams = new URLSearchParams({
      date: sessionDateTime.toISOString(),
      courseTitle: selectedSubject.subjectName,
      mentorName,
      mentorId: mentor.mentorId,
      mentorImg: mentor.profileImageUrl ?? "",
      subjectId: String(selectedSubject.id),
    });
    navigate(`/payment/${sessionId}?${searchParams.toString()}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[680px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule a session</DialogTitle>
          <DialogDescription className="sr-only">
            Pick a subject, date, and time for your mentoring session with {mentorName}.
          </DialogDescription>
        </DialogHeader>

        {/* Mentor info strip */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border">
          {mentor.profileImageUrl ? (
            <img
              src={mentor.profileImageUrl}
              alt={mentorName}
              className="size-12 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="size-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold shrink-0">
              {mentor.firstName.charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <p className="font-semibold truncate">{mentorName}</p>
            <p className="text-sm text-muted-foreground truncate">
              {mentor.title} {mentor.company ? `· ${mentor.company}` : ""}
            </p>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <GraduationCap className="size-3" />
                {mentor.totalEnrollments} students
              </span>
              {mentor.isCertified && (
                <span className="flex items-center gap-1 text-xs text-emerald-600">
                  <ShieldCheck className="size-3" />
                  Certified
                </span>
              )}
              {mentor.company && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="size-3" />
                  {mentor.company}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subject selector */}
        {mentor.subjects.length > 1 && (
          <div>
            <h4 className="font-medium mb-2 text-sm">Select subject</h4>
            <div className="flex flex-wrap gap-2">
              {mentor.subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => { setSelectedSubjectId(subject.id); setError(null); }}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-sm border transition-all",
                    selectedSubjectId === subject.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background hover:bg-muted border-border",
                  )}
                >
                  {subject.subjectName}
                </button>
              ))}
            </div>
            {selectedSubject && (
              <p className="text-xs text-muted-foreground mt-1.5">
                {selectedSubject.description}
              </p>
            )}
          </div>
        )}

        {/* Date + time picker */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 text-sm">Choose a date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={{ before: new Date() }}
              className="rounded-md border"
            />
          </div>
          <div>
            <h4 className="font-medium mb-2 text-sm">Choose a time</h4>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => { setSelectedTime(time); setError(null); }}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSchedule}
            disabled={!date || !selectedTime || !selectedSubject}
          >
            Continue to payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}