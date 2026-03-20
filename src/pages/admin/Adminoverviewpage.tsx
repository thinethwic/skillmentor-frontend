import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Users,
  BookOpen,
  CalendarDays,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  CreditCard,
} from "lucide-react";

import { useApi } from "@/lib/api";
import type {
  AdminSession,
  AdminSubject,
  AdminMentor,
  PageResponse,
} from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionsResponse = AdminSession[] | { content: AdminSession[] };

interface Stats {
  totalMentors: number;
  totalSubjects: number;
  totalSessions: number;
  pendingPayments: number;
  completedSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const STATUS_VARIANTS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  CONFIRMED: "bg-blue-100   text-blue-800   border-blue-200",
  SCHEDULED: "bg-blue-100   text-blue-800   border-blue-200",
  COMPLETED: "bg-green-100  text-green-800  border-green-200",
  CANCELLED: "bg-red-100    text-red-800    border-red-200",
};

function StatusBadge({ value }: { value?: string | null }) {
  const label = value ?? "—";
  const cls =
    STATUS_VARIANTS[(value ?? "").toUpperCase()] ??
    "bg-muted text-muted-foreground border-border";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cls}`}
    >
      {label}
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  loading,
  accent,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
  loading: boolean;
  accent?: string;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            {loading ? (
              <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
            ) : (
              <p className="text-3xl font-bold tracking-tight">{value}</p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className={`rounded-xl p-2.5 ${accent ?? "bg-primary/10"}`}>
            <Icon
              className={`h-5 w-5 ${accent ? "text-white" : "text-primary"}`}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { publicGet, get } = useApi();

  const [stats, setStats] = useState<Stats | null>(null);
  const [recentSessions, setRecentSessions] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Fetch all data ─────────────────────────────────────────────────────────

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);

      const [mentorsRes, subjectsRes, sessionsRes] = await Promise.all([
        publicGet<PageResponse<AdminMentor>>("/api/v1/mentors?page=0&size=1"),
        publicGet<PageResponse<AdminSubject>>("/api/v1/subjects?page=0&size=1"),
        get<SessionsResponse>("/api/v1/sessions"),
      ]);

      const totalMentors = mentorsRes.totalElements ?? 0;
      const totalSubjects = subjectsRes.totalElements ?? 0;

      const sessions: AdminSession[] = Array.isArray(sessionsRes)
        ? sessionsRes
        : (sessionsRes.content ?? []);

      const now = new Date();

      const pendingPayments = sessions.filter(
        (s) => (s.paymentStatus ?? "").toUpperCase() === "PENDING",
      ).length;
      const completedSessions = sessions.filter(
        (s) => (s.sessionStatus ?? "").toUpperCase() === "COMPLETED",
      ).length;
      const cancelledSessions = sessions.filter(
        (s) => (s.sessionStatus ?? "").toUpperCase() === "CANCELLED",
      ).length;
      const upcomingSessions = sessions.filter((s) => {
        const status = (s.sessionStatus ?? "").toUpperCase();
        return (
          (status === "CONFIRMED" || status === "SCHEDULED") &&
          new Date(s.sessionAt) >= now
        );
      }).length;

      setStats({
        totalMentors,
        totalSubjects,
        totalSessions: sessions.length,
        pendingPayments,
        completedSessions,
        cancelledSessions,
        upcomingSessions,
      });

      // Most recent 5 sessions sorted by date desc
      const sorted = [...sessions].sort(
        (a, b) =>
          new Date(b.sessionAt).getTime() - new Date(a.sessionAt).getTime(),
      );
      setRecentSessions(sorted.slice(0, 5));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load overview",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground">
            Platform summary at a glance.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAll}
          disabled={loading}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Mentors"
          value={stats?.totalMentors ?? 0}
          icon={Users}
          description="Registered mentors"
          loading={loading}
          accent="bg-blue-500"
        />
        <StatCard
          title="Total Subjects"
          value={stats?.totalSubjects ?? 0}
          icon={BookOpen}
          description="Available courses"
          loading={loading}
          accent="bg-violet-500"
        />
        <StatCard
          title="Total Sessions"
          value={stats?.totalSessions ?? 0}
          icon={CalendarDays}
          description="All time bookings"
          loading={loading}
          accent="bg-emerald-500"
        />
        <StatCard
          title="Upcoming Sessions"
          value={stats?.upcomingSessions ?? 0}
          icon={TrendingUp}
          description="Confirmed & scheduled"
          loading={loading}
          accent="bg-orange-500"
        />
      </div>

      {/* ── Secondary stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-green-100 p-2.5">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                {loading ? (
                  <div className="h-6 w-10 rounded-md bg-muted animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold">
                    {stats?.completedSessions ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-100 p-2.5">
                <CreditCard className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  Pending Payments
                </p>
                {loading ? (
                  <div className="h-6 w-10 rounded-md bg-muted animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold">
                    {stats?.pendingPayments ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-100 p-2.5">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cancelled</p>
                {loading ? (
                  <div className="h-6 w-10 rounded-md bg-muted animate-pulse mt-1" />
                ) : (
                  <p className="text-2xl font-bold">
                    {stats?.cancelledSessions ?? 0}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Recent sessions ── */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>
            The 5 most recently booked sessions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <Clock className="h-8 w-8 opacity-30" />
              <span className="text-sm">No sessions yet.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-xl border bg-card px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.mentorProfileImageUrl ?? undefined}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {(session.mentorName ?? "M").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">
                        {session.mentorName ?? "—"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {session.subjectName ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-xs font-medium">
                        {session.sessionAt
                          ? format(new Date(session.sessionAt), "dd MMM yyyy")
                          : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {session.sessionAt
                          ? format(new Date(session.sessionAt), "p")
                          : ""}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <StatusBadge value={session.sessionStatus} />
                      <StatusBadge value={session.paymentStatus} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
