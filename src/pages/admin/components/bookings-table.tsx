import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import type { AdminSession } from "@/lib/api";
import { useApi } from "@/lib/api";
import { StatusBadge } from "../components/shared/status-badge";
import { BookingActionsDialog } from "../components/booking-actions-dialog";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  bookings: AdminSession[];
  onRefresh: () => void;
}

export function BookingsTable({ bookings, onRefresh }: Props) {
  const { patch } = useApi();
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null,
  );

  const confirmPayment = async (id: number) => {
    try {
      await patch<void>(`/api/v1/sessions/${id}/payment`);
      toast.success("Payment confirmed");
      onRefresh();
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
      onRefresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update session",
      );
    }
  };

  return (
    <>
      <div className="rounded-2xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Session ID</TableHead>
              <TableHead>Mentor</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.id}</TableCell>
                <TableCell>{booking.mentorName}</TableCell>
                <TableCell>{booking.subjectName}</TableCell>
                <TableCell>
                  {format(new Date(booking.sessionAt), "PPP p")}
                </TableCell>
                <TableCell>
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
                  <div className="flex flex-wrap justify-end gap-2">
                    {booking.paymentStatus === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => confirmPayment(booking.id)}
                      >
                        Confirm Payment
                      </Button>
                    )}

                    {booking.sessionStatus === "CONFIRMED" && (
                      <Button
                        size="sm"
                        onClick={() => markComplete(booking.id)}
                      >
                        Mark Complete
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setSelectedSessionId(booking.id)}
                    >
                      Add Meeting Link
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {bookings.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-muted-foreground"
                >
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BookingActionsDialog
        open={selectedSessionId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedSessionId(null);
        }}
        sessionId={selectedSessionId}
        onSuccess={onRefresh}
      />
    </>
  );
}
