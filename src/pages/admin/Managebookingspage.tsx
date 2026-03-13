import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  RefreshCw,
  Link2,
  CheckCircle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useApi } from "@/lib/api";
import { BookingActionsDialog } from "../admin/components/booking-actions-dialog";
import type { AdminSession } from "@/lib/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// ─── Types ────────────────────────────────────────────────────────────────────

type SessionsResponse = AdminSession[] | { content: AdminSession[] };
type SortKey = keyof Pick<
  AdminSession,
  | "id"
  | "mentorName"
  | "subjectName"
  | "sessionAt"
  | "durationMinutes"
  | "paymentStatus"
  | "sessionStatus"
>;
type SortDir = "asc" | "desc";

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ value }: { value: string }) {
  const variants: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
    CONFIRMED: "bg-blue-100 text-blue-800 border-blue-200",
    SCHEDULED: "bg-blue-100 text-blue-800 border-blue-200",
    COMPLETED: "bg-green-100 text-green-800 border-green-200",
    CANCELLED: "bg-red-100 text-red-800 border-red-200",
    REFUNDED: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${
        variants[value] ?? "bg-muted text-muted-foreground border-border"
      }`}
    >
      {value}
    </span>
  );
}

// ─── Sortable header ──────────────────────────────────────────────────────────

function SortableHead({
  label,
  sortKey,
  current,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey | null;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = current === sortKey;
  return (
    <TableHead
      className="cursor-pointer select-none whitespace-nowrap"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          dir === "asc" ? (
            <ArrowUp className="h-3 w-3" />
          ) : (
            <ArrowDown className="h-3 w-3" />
          )
        ) : (
          <ArrowUpDown className="h-3 w-3 opacity-40" />
        )}
      </div>
    </TableHead>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export default function ManageBookingsPage() {
  const { get, patch } = useApi();

  const [allBookings, setAllBookings] = useState<AdminSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Sort
  const [sortKey, setSortKey] = useState<SortKey | null>("sessionAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  // Pagination
  const [page, setPage] = useState(1);

  // Actions dialog
  const [selectedBooking, setSelectedBooking] = useState<AdminSession | null>(
    null,
  );

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await get<SessionsResponse>("/api/v1/sessions");
      setAllBookings(Array.isArray(data) ? data : (data.content ?? []));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load bookings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Actions ────────────────────────────────────────────────────────────────

  const confirmPayment = async (id: number) => {
    try {
      await patch<void>(`/api/v1/sessions/${id}/payment`);
      toast.success("Payment confirmed");
      fetchBookings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm payment",
      );
    }
  };

  const markComplete = async (id: number) => {
    try {
      await patch<void>(`/api/v1/sessions/${id}/status`);
      toast.success("Session marked as completed");
      fetchBookings();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update session",
      );
    }
  };

  // ── Sort handler ───────────────────────────────────────────────────────────

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  // ── Filter + sort + paginate ───────────────────────────────────────────────

  const processed = (() => {
    let list = [...allBookings];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (b) =>
          (b.mentorName ?? "").toLowerCase().includes(q) ||
          (b.subjectName ?? "").toLowerCase().includes(q),
      );
    }

    // Status
    if (status !== "ALL") {
      list = list.filter(
        (b) =>
          b.sessionStatus?.toUpperCase() === status ||
          b.sessionStatus === status,
      );
    }

    // Date range
    if (dateFrom) {
      list = list.filter(
        (b) => b.sessionAt && new Date(b.sessionAt) >= new Date(dateFrom),
      );
    }
    if (dateTo) {
      list = list.filter(
        (b) =>
          b.sessionAt &&
          new Date(b.sessionAt) <= new Date(dateTo + "T23:59:59"),
      );
    }

    // Sort
    if (sortKey) {
      list.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = String(av).localeCompare(String(bv), undefined, {
          numeric: true,
        });
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return list;
  })();

  const totalPages = Math.max(1, Math.ceil(processed.length / PAGE_SIZE));
  const paginated = processed.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [search, status, dateFrom, dateTo]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Manage Bookings</CardTitle>
              <CardDescription>
                Review and manage all scheduled mentoring sessions.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBookings}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* ── Filters ── */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentor or subject..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-[160px]"
              />
              <span className="text-muted-foreground text-sm">—</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-[160px]"
              />
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>

          {/* ── Results count ── */}
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading..."
              : `${processed.length} session${processed.length !== 1 ? "s" : ""} found`}
          </p>

          {/* ── Table ── */}
          <div className="rounded-xl border bg-card overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead
                    label="ID"
                    sortKey="id"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <TableHead>Student</TableHead>
                  <SortableHead
                    label="Mentor"
                    sortKey="mentorName"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Subject"
                    sortKey="subjectName"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Date/Time"
                    sortKey="sessionAt"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Duration"
                    sortKey="durationMinutes"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Payment"
                    sortKey="paymentStatus"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <SortableHead
                    label="Status"
                    sortKey="sessionStatus"
                    current={sortKey}
                    dir={sortDir}
                    onSort={handleSort}
                  />
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-16 text-center text-muted-foreground text-sm"
                    >
                      Loading bookings...
                    </TableCell>
                  </TableRow>
                ) : paginated.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-16 text-center text-muted-foreground text-sm"
                    >
                      No bookings found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        #{booking.id}
                      </TableCell>
                      <TableCell className="text-sm">
                        {(booking as any).studentName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm font-medium">
                        {booking.mentorName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.subjectName ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {booking.sessionAt
                          ? format(
                              new Date(booking.sessionAt),
                              "dd MMM yyyy, p",
                            )
                          : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {booking.durationMinutes
                          ? `${booking.durationMinutes} min`
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={booking.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge value={booking.sessionStatus} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {(booking.paymentStatus === "PENDING" ||
                            booking.paymentStatus === "pending") && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => confirmPayment(booking.id)}
                            >
                              <CreditCard className="h-3 w-3 mr-1" />
                              Confirm Payment
                            </Button>
                          )}
                          {(booking.sessionStatus === "CONFIRMED" ||
                            booking.sessionStatus === "SCHEDULED") && (
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => markComplete(booking.id)}
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Mark Complete
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 text-xs"
                            onClick={() => setSelectedBooking(booking)}
                          >
                            <Link2 className="h-3 w-3 mr-1" />
                            Meeting Link
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-muted-foreground">
                Page {page} of {totalPages}
              </p>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      p === 1 || p === totalPages || Math.abs(p - page) <= 1,
                  )
                  .reduce<(number | "...")[]>((acc, p, i, arr) => {
                    if (i > 0 && p - (arr[i - 1] as number) > 1)
                      acc.push("...");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    p === "..." ? (
                      <span
                        key={`ellipsis-${i}`}
                        className="px-1 text-muted-foreground text-sm"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={p}
                        variant={page === p ? "default" : "outline"}
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setPage(p as number)}
                      >
                        {p}
                      </Button>
                    ),
                  )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Actions dialog (meeting link) ── */}
      <BookingActionsDialog
        open={selectedBooking !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedBooking(null);
        }}
        sessionId={selectedBooking?.id ?? null}
        paymentStatus={selectedBooking?.paymentStatus ?? null}
        sessionStatus={selectedBooking?.sessionStatus ?? null}
        onSuccess={fetchBookings}
      />
    </>
  );
}
