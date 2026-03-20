// Modified to match with backend SubjectResponseDTO
export interface Subject {
    id: number;
    subjectName: string;
    description: string;
    courseImageUrl: string;
}

export interface Mentor {
    id: number;
    mentorId: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    profession: string;
    company: string;
    experienceYears: number;
    bio: string;
    profileImageUrl: string;
    positiveReviews: number;
    totalEnrollments: number;
    isCertified: boolean;
    startYear: string;
    subjects: Subject[];
}

// Modified to match with SessionResponseDTO (from GET /api/v1/sessions/my-sessions)
export interface Enrollment {
    id: number;
    mentorName: string;
    mentorProfileImageUrl: string;
    subjectName: string;
    sessionAt: string;
    durationMinutes: number;
    sessionStatus: string;
    paymentStatus: "pending" | "accepted" | "completed" | "cancelled";
    meetingLink: string | null;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Booking {
    sessionId: string;
    studentName: string;
    mentorName: string;
    subjectName: string;
    sessionDateTime: string;
    duration: number;
    paymentStatus: "pending" | "confirmed";
    sessionStatus: "pending" | "confirmed" | "completed";
    meetingLink?: string;
}
