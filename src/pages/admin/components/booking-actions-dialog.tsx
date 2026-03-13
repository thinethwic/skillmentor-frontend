import { useState } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import { CreditCard, CheckCircle, Link2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: number | null;
  paymentStatus: string | null;
  sessionStatus: string | null;
  onSuccess: () => void;
}

export function BookingActionsDialog({
  open,
  onOpenChange,
  sessionId,
  paymentStatus,
  sessionStatus,
  onSuccess,
}: Props) {
  const { patch } = useApi();
  const [meetingLink, setMeetingLink] = useState("");
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setMeetingLink("");
    onOpenChange(false);
  };

  const confirmPayment = async () => {
    if (!sessionId) return;
    try {
      setSaving(true);
      await patch<void>(`/api/v1/sessions/${sessionId}/payment`);
      toast.success("Payment confirmed successfully");
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to confirm payment",
      );
    } finally {
      setSaving(false);
    }
  };

  const markComplete = async () => {
    if (!sessionId) return;
    try {
      setSaving(true);
      await patch<void>(`/api/v1/sessions/${sessionId}/status`);
      toast.success("Session marked as completed");
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update session",
      );
    } finally {
      setSaving(false);
    }
  };

  const saveMeetingLink = async () => {
    if (!sessionId || !meetingLink.trim()) return;
    try {
      setSaving(true);
      await patch<void>(`/api/v1/sessions/${sessionId}/meeting-link`, {
        meetingLink: meetingLink.trim(),
      });
      toast.success("Meeting link saved successfully");
      onSuccess();
      handleClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to save meeting link",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) handleClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Session Actions</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Confirm Payment */}
          {paymentStatus === "PENDING" && (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Confirm Payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mark this session's payment as confirmed.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={confirmPayment}
                disabled={saving}
              >
                Confirm
              </Button>
            </div>
          )}

          {/* Mark Complete */}
          {sessionStatus === "CONFIRMED" && (
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <CheckCircle className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">Mark Complete</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Mark this session as completed.
                </p>
              </div>
              <Button size="sm" onClick={markComplete} disabled={saving}>
                Complete
              </Button>
            </div>
          )}

          {/* Meeting Link */}
          <div className="flex items-start gap-3 rounded-lg border p-4">
            <Link2 className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
            <div className="flex-1 space-y-2">
              <div>
                <p className="text-sm font-medium">Meeting Link</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Add or update the meeting link for this session.
                </p>
              </div>
              <Input
                placeholder="https://meet.google.com/..."
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
              />
              <Button
                size="sm"
                className="w-full"
                onClick={saveMeetingLink}
                disabled={saving || !meetingLink.trim()}
              >
                {saving ? "Saving..." : "Save Link"}
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
