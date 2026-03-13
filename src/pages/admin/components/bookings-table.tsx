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

interface SelectedSession {
  id: number;
  paymentStatus: string;
  sessionStatus: string;
}

export function BookingsTable({ bookings, onRefresh }: Props) {
  const { patch } = useApi();
  const [selected, setSelected] = useState<SelectedSession | null>(null);

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
                      onClick={() =>
                        setSelected({
                          id: booking.id,
                          paymentStatus: booking.paymentStatus,
                          sessionStatus: booking.sessionStatus,
                        })
                      }
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
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        sessionId={selected?.id ?? null}
        paymentStatus={selected?.paymentStatus ?? null}
        sessionStatus={selected?.sessionStatus ?? null}
        onSuccess={onRefresh}
      />
    </>
  );
}
