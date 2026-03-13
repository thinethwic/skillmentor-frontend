import { useEffect, useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { CalendarDays, Star } from "lucide-react";
import { StatusPill } from "@/components/StatusPill";
import { getMyEnrollments } from "@/lib/api";
import type { Enrollment } from "@/types";
import { useNavigate } from "react-router";
import { WriteReviewModal } from "@/components/Writereviewmodal";

export default function DashboardPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [reviewTarget, setReviewTarget] = useState<Enrollment | null>(null);
  const router = useNavigate();

  useEffect(() => {
    async function fetchEnrollments() {
      if (!user) return;
      const token = await getToken({ template: "skillmentor-auth" });
      if (!token) return;
      try {
        const data = await getMyEnrollments(token);
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      }
    }

    if (isLoaded && isSignedIn) {
      fetchEnrollments();
    }
  }, [isLoaded, isSignedIn, getToken, user]);

  if (!isLoaded) {
    return (
      <div className="container py-10">
        <div className="flex items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    router("/login");
    return null;
  }

  if (!enrollments.length) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>
        <p className="text-muted-foreground">No courses enrolled yet.</p>
      </div>
    );
  }

  const isCompleted = (e: Enrollment) =>
    e.sessionStatus?.toUpperCase() === "COMPLETED";

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight mb-6">My Courses</h1>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {enrollments.map((enrollment) => (
          <div
            key={enrollment.id}
            className="rounded-2xl p-6 relative overflow-hidden bg-linear-to-br from-blue-500 to-blue-600 flex flex-col"
          >
            {/* Status Pill */}
            <div className="absolute top-4 right-4">
              <StatusPill status={enrollment.paymentStatus} />
            </div>

            {/* Profile Image */}
            <div className="size-24 rounded-full bg-white/10 mb-4">
              {enrollment.mentorProfileImageUrl ? (
                <img
                  src={enrollment.mentorProfileImageUrl}
                  alt={enrollment.mentorName}
                  className="w-full h-full rounded-full object-cover object-top"
                />
              ) : (
                <div className="w-full h-full rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {enrollment.mentorName.charAt(0)}
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-1 flex-1">
              <h2 className="text-xl font-semibold text-white">
                {enrollment.subjectName}
              </h2>
              <p className="text-blue-100/80">
                Mentor: {enrollment.mentorName}
              </p>
              <div className="flex items-center text-blue-100/80 text-sm mt-2">
                <CalendarDays className="mr-2 h-4 w-4" />
                Next Session:{" "}
                {new Date(enrollment.sessionAt).toLocaleDateString()}
              </div>
            </div>

            {/* Write Review — only on completed sessions */}
            {isCompleted(enrollment) && (
              <button
                onClick={() => setReviewTarget(enrollment)}
                className="mt-4 flex items-center justify-center gap-2 w-full py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-sm font-medium transition-colors border border-white/20"
              >
                <Star className="w-4 h-4" />
                Write a review
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Write Review Modal */}
      {reviewTarget && (
        <WriteReviewModal
          enrollment={reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmitted={() => setReviewTarget(null)}
        />
      )}
    </div>
  );
}
