import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Star,
  Users,
} from "lucide-react";

import { useApi } from "@/lib/api";
import type { Mentor, Subject } from "@/types";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@clerk/clerk-react";
import { SignupDialog } from "./SignUpDialog";
import { SchedulingModal } from "./SchedulingModel";

// ─── Small Components ─────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: React.ElementType;
  value: string | number;
  label: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function HighlightCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardContent className="flex items-start gap-4 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 break-words text-sm font-semibold text-foreground">
            {value}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function SubjectCard({
  subject,
  onBook,
}: {
  subject: Subject;
  onBook: (id: number) => void;
}) {
  const shortDescription =
    subject.description?.length > 110
      ? `${subject.description.slice(0, 110)}...`
      : subject.description || "No description available.";

  return (
    <Card className="group overflow-hidden rounded-2xl border-border/60 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="aspect-[16/9] w-full overflow-hidden bg-muted">
        {subject.courseImageUrl ? (
          <img
            src={subject.courseImageUrl}
            alt={subject.subjectName}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
            <BookOpen className="h-8 w-8" />
          </div>
        )}
      </div>
      <CardContent className="p-5">
        <div className="mb-4 space-y-2">
          <h3 className="line-clamp-1 text-lg font-semibold">
            {subject.subjectName}
          </h3>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
            {shortDescription}
          </p>
        </div>
        <Button
          className="w-full rounded-xl"
          onClick={() => onBook(subject.id)}
        >
          Book this subject
        </Button>
      </CardContent>
    </Card>
  );
}

function MentorProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80 text-white">
        <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <Skeleton className="h-28 w-28 rounded-full bg-white/20" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-36 bg-white/20" />
              <Skeleton className="h-10 w-64 bg-white/20" />
              <Skeleton className="h-5 w-80 bg-white/20" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-28 rounded-full bg-white/20" />
                <Skeleton className="h-8 w-24 rounded-full bg-white/20" />
              </div>
              <Skeleton className="h-10 w-44 rounded-xl bg-white/20" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-48 rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const api = useApi();

  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSchedulingModalOpen, setIsSchedulingModalOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const { isSignedIn } = useAuth();

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError("Mentor ID is missing.");
      return;
    }

    let cancelled = false;

    const fetchMentorProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.publicGet<Mentor>(
          `/api/v1/mentors/${id}/profile`,
        );
        if (!cancelled) setMentor(data);
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMentorProfile();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSchedule = () => {
    if (!isSignedIn) {
      setIsSignupDialogOpen(true);
      return;
    }
    setIsSchedulingModalOpen(true);
  };

  const fullName = useMemo(() => {
    if (!mentor) return "";
    return `${mentor.firstName ?? ""} ${mentor.lastName ?? ""}`.trim();
  }, [mentor]);

  const initials = useMemo(() => {
    if (!mentor) return "M";
    return `${mentor.firstName?.[0] ?? ""}${mentor.lastName?.[0] ?? ""}` || "M";
  }, [mentor]);

  const subjectCount = mentor?.subjects?.length ?? 0;

  if (loading) return <MentorProfileSkeleton />;

  if (error || !mentor) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">
            Unable to load mentor profile
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {error ?? "Mentor not found."}
          </p>
          <Button onClick={() => navigate(-1)} className="rounded-xl">
            Go back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="border-b bg-gradient-to-br from-slate-950 via-slate-900 to-primary/80 text-white">
        <div className="container mx-auto px-4 py-10 md:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="relative">
                <Avatar className="h-28 w-28 border-4 border-white/15 shadow-xl">
                  <AvatarImage src={mentor.profileImageUrl} alt={fullName} />
                  <AvatarFallback className="bg-white/10 text-2xl font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {mentor.isCertified && (
                  <div className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-950 bg-emerald-500 text-white shadow-md">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {mentor.startYear && (
                  <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-300">
                    Mentoring since {mentor.startYear}
                  </p>
                )}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
                    {fullName}
                  </h1>
                  <p className="mt-2 text-sm text-slate-300 md:text-base">
                    {[mentor.title, mentor.company, mentor.profession]
                      .filter(Boolean)
                      .join(" • ")}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentor.isCertified && (
                    <Badge className="rounded-full bg-emerald-500/15 px-3 py-1 text-emerald-300 hover:bg-emerald-500/15">
                      Certified Mentor
                    </Badge>
                  )}
                  {mentor.experienceYears > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10"
                    >
                      {mentor.experienceYears}+ years experience
                    </Badge>
                  )}
                  {subjectCount > 0 && (
                    <Badge
                      variant="secondary"
                      className="rounded-full bg-white/10 px-3 py-1 text-white hover:bg-white/10"
                    >
                      {subjectCount} subjects
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div>
              <Button size="lg" className="rounded-xl" onClick={handleSchedule}>
                <CalendarDays className="mr-2 h-4 w-4" />
                Schedule a session
              </Button>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto space-y-10 px-4 py-8 md:px-6 lg:px-8">
        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Users}
            value={mentor.totalEnrollments ?? 0}
            label="Students taught"
          />
          <StatCard
            icon={Clock3}
            value={`${mentor.experienceYears ?? 0}+ yrs`}
            label="Experience"
          />
          <StatCard
            icon={Star}
            value={`${mentor.positiveReviews ?? 0}%`}
            label="Positive reviews"
          />
          <StatCard
            icon={GraduationCap}
            value={subjectCount}
            label="Subjects taught"
          />
        </section>

        {/* About */}
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              About
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Mentor overview
            </h2>
          </div>
          <Card className="rounded-2xl border-border/60 shadow-sm">
            <CardContent className="p-6">
              <p className="text-sm leading-7 text-muted-foreground md:text-base">
                {mentor.bio?.trim()
                  ? mentor.bio
                  : "This mentor has not added a bio yet."}
              </p>
              <Separator className="my-6" />
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {mentor.company && (
                  <HighlightCard
                    icon={Briefcase}
                    label="Company"
                    value={mentor.company}
                  />
                )}
                {mentor.profession && (
                  <HighlightCard
                    icon={BookOpen}
                    label="Profession"
                    value={mentor.profession}
                  />
                )}
                {mentor.experienceYears > 0 && (
                  <HighlightCard
                    icon={Clock3}
                    label="Experience"
                    value={`${mentor.experienceYears}+ years`}
                  />
                )}
                {mentor.startYear && (
                  <HighlightCard
                    icon={CalendarDays}
                    label="Mentoring since"
                    value={mentor.startYear}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Subjects */}
        <section className="space-y-6">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              Subjects
            </p>
            <h2 className="text-2xl font-bold tracking-tight">
              Subjects taught
            </h2>
          </div>
          {subjectCount === 0 ? (
            <Card className="rounded-2xl border-dashed shadow-sm">
              <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                <BookOpen className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">No subjects assigned yet</p>
                  <p className="text-sm text-muted-foreground">
                    This mentor does not have any visible subjects right now.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {mentor.subjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onBook={handleSchedule}
                />
              ))}
            </div>
          )}
        </section>

        <SignupDialog
          isOpen={isSignupDialogOpen}
          onClose={() => setIsSignupDialogOpen(false)}
        />

        <SchedulingModal
          isOpen={isSchedulingModalOpen}
          onClose={() => setIsSchedulingModalOpen(false)}
          mentor={mentor}
        />
      </main>
    </div>
  );
}
