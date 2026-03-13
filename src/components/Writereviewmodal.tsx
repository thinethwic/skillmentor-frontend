import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import type { Enrollment } from "@/types";

interface WriteReviewModalProps {
  enrollment: Enrollment;
  onClose: () => void;
  onSubmitted: () => void;
}

export function WriteReviewModal({
  enrollment,
  onClose,
  onSubmitted,
}: WriteReviewModalProps) {
  const { post } = useApi();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    try {
      setSubmitting(true);
      await post("/api/v1/reviews", {
        sessionId: enrollment.id,
        rating,
        comment: comment.trim() || undefined,
      });
      toast.success("Review submitted", {
        description: "Thank you for your feedback!",
      });
      onSubmitted();
    } catch (err) {
      toast.error("Failed to submit review", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Write a review</DialogTitle>
          <DialogDescription>
            Rate your session on{" "}
            <span className="font-medium text-foreground">
              {enrollment.subjectName}
            </span>{" "}
            with{" "}
            <span className="font-medium text-foreground">
              {enrollment.mentorName}
            </span>
            .
          </DialogDescription>
        </DialogHeader>

        {/* Star picker */}
        <div className="flex items-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setRating(star)}
              className="p-0.5 transition-transform hover:scale-110"
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className="w-8 h-8 transition-colors"
                fill={star <= (hovered || rating) ? "#fbbf24" : "none"}
                stroke={
                  star <= (hovered || rating) ? "#fbbf24" : "currentColor"
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-muted-foreground">
              {["", "Poor", "Fair", "Good", "Great", "Excellent"][rating]}
            </span>
          )}
        </div>

        {/* Comment */}
        <Textarea
          placeholder="Share what you learned or how the mentor helped you… (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          className="resize-none"
        />

        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0 || submitting}>
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit review"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
