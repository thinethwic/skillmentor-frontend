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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Building2, ShieldCheck, Clock } from "lucide-react";
import { useNavigate } from "react-router";
import type { Mentor, Subject } from "@/types";

interface SchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  mentor: Mentor;
  preselectedSubjectId?: number; // optional — used when opened from subject card
}

const TIME_SLOTS = [
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

export function SchedulingModal({
  isOpen,
  onClose,
  mentor,
  preselectedSubjectId,
}: SchedulingModalProps) {
  const navigate = useNavigate();

  const defaultSubject =
    preselectedSubjectId != null
      ? mentor.subjects.find((s) => s.id === preselectedSubjectId)
      : mentor.subjects[0];

  const [date, setDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();
  const [selectedSubject, setSelectedSubject] = useState<Subject | undefined>(
    defaultSubject,
  );
  const [bookingError, setBookingError] = useState<string | null>(null);

  const mentorName = `${mentor.firstName} ${mentor.lastName}`;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSubjectChange = (subjectId: string) => {
    const found = mentor.subjects.find((s) => String(s.id) === subjectId);
    setSelectedSubject(found);
    setBookingError(null);
  };

  const handleDateSelect = (d: Date | undefined) => {
    setDate(d);
    setBookingError(null);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingError(null);
  };

  const isDateDisabled = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy < today;
  };

  const handleSchedule = () => {
    setBookingError(null);

    if (!date || !selectedTime || !selectedSubject) return;

    // Client-side: reject past date/time
    const sessionDateTime = new Date(date);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    sessionDateTime.setHours(hours, minutes, 0, 0);

    if (sessionDateTime <= new Date()) {
      setBookingError("Please select a future date and time for your session.");
      return;
    }

    const sessionId = `${mentor.id}-${Date.now()}`;
    const searchParams = new URLSearchParams({
      date: sessionDateTime.toISOString(),
      courseTitle: selectedSubject.subjectName,
      mentorName: mentorName,
      mentorId: String(mentor.id),
      mentorImg: mentor.profileImageUrl ?? "",
      subjectId: String(selectedSubject.id),
    });

    navigate(`/payment/${sessionId}?${searchParams.toString()}`);
  };

  const canSchedule = !!date && !!selectedTime && !!selectedSubject;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Schedule a session
          </DialogTitle>
          <DialogDescription className="sr-only">
            Pick a subject, date and time for your session with {mentorName}.
          </DialogDescription>
        </DialogHeader>

        {/* ── Mentor info strip ── */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border">
          {mentor.profileImageUrl ? (
            <img
              src={mentor.profileImageUrl}
              alt={mentorName}
              className="size-12 rounded-full object-cover object-top flex-shrink-0"
            />
          ) : (
            <div className="size-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg flex-shrink-0">
              {mentor.firstName.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{mentorName}</p>
            {mentor.title && (
              <p className="text-xs text-muted-foreground truncate">
                {mentor.title}
              </p>
            )}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              {mentor.company && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Building2 className="w-3 h-3" />
                  {mentor.company}
                </span>
              )}
              {mentor.isCertified && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Certified
                </span>
              )}
              {mentor.experienceYears > 0 && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {mentor.experienceYears}+ yrs exp.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Subject selector ── */}
        {mentor.subjects.length > 1 ? (
          <div>
            <h4 className="font-medium text-sm mb-2">Subject</h4>
            <Select
              value={selectedSubject ? String(selectedSubject.id) : ""}
              onValueChange={handleSubjectChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {mentor.subjects.map((s) => (
                  <SelectItem key={s.id} value={String(s.id)}>
                    {s.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : selectedSubject ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
            {selectedSubject.courseImageUrl ? (
              <img
                src={selectedSubject.courseImageUrl}
                alt={selectedSubject.subjectName}
                className="size-10 rounded-md object-cover flex-shrink-0"
              />
            ) : (
              <div className="size-10 rounded-md bg-blue-200 flex items-center justify-center text-blue-700 font-bold flex-shrink-0">
                {selectedSubject.subjectName.charAt(0)}
              </div>
            )}
            <div>
              <p className="text-sm font-semibold">
                {selectedSubject.subjectName}
              </p>
              {selectedSubject.description && (
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {selectedSubject.description}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* ── Date + Time picker ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-sm mb-2">Choose a date</h4>
            <Calendar
              mode="single"
              selected={date}
              onSelect={handleDateSelect}
              disabled={isDateDisabled}
              className="rounded-md border"
            />
          </div>
          <div>
            <h4 className="font-medium text-sm mb-2">Choose a time</h4>
            <div className="grid grid-cols-2 gap-2">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  className="w-full"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Conflict / validation error ── */}
        {bookingError && (
          <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{bookingError}</p>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSchedule} disabled={!canSchedule}>
            Continue to payment
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
