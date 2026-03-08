import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Star, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/clerk-react";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface WriteReviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: number;
  mentorName: string;
  subjectName: string;
  /** Called with the updated enrollment after a successful submission */
  onSuccess: () => void;
}

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8081";

export function WriteReviewDialog({
  isOpen,
  onClose,
  sessionId,
  mentorName,
  subjectName,
  onSuccess,
}: WriteReviewDialogProps) {
  const { getToken } = useAuth();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }
    if (reviewText.trim().length < 10) {
      setError("Review must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/sessions/${sessionId}/review`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, reviewText: reviewText.trim() }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Failed to submit review");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHovered(0);
    setReviewText("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Share your experience with <span className="font-medium">{mentorName}</span> for{" "}
            <span className="font-medium">{subjectName}</span>.
          </DialogDescription>
        </DialogHeader>

        {/* Star rating */}
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-sm text-muted-foreground">Your overall rating</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={cn(
                    "size-8 transition-colors",
                    star <= (hovered || rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-sm font-medium text-amber-600">
              {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
            </p>
          )}
        </div>

        {/* Review text */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">
            Your review
          </label>
          <textarea
            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Tell others what you thought about this session…"
            value={reviewText}
            onChange={(e) => { setReviewText(e.target.value); setError(null); }}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground text-right mt-1">
            {reviewText.length}/1000
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="size-4 animate-spin" />}
            Submit review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}