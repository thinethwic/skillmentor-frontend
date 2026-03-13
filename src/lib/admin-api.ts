import { useApi } from "@/lib/api";
import type {
    AdminMentor,
    AdminSession,
    AdminSubject,
    CreateMentorPayload,
    CreateSubjectPayload,
    PageResponse,
} from "@/lib/api";

export function useAdminApi() {
    const api = useApi();

    async function getMentors(): Promise<AdminMentor[]> {
        const data = await api.publicGet<PageResponse<AdminMentor> | AdminMentor[]>(
            "/api/v1/mentors?page=0&size=100"
        );
        return Array.isArray(data) ? data : (data.content ?? []);
    }

    async function createMentor(
        payload: CreateMentorPayload
    ): Promise<AdminMentor> {
        return api.post<AdminMentor>("/api/v1/mentors", payload);
    }

    async function grantMentorRole(clerkUserId: string): Promise<void> {
        await api.post<void>("/api/v1/admin/grant-mentor-role", { clerkUserId });
    }

    async function getSubjects(
        page = 0,
        size = 20
    ): Promise<PageResponse<AdminSubject>> {
        return api.publicGet<PageResponse<AdminSubject>>(
            `/api/v1/subjects?page=${page}&size=${size}`
        );
    }

    async function createSubject(
        payload: CreateSubjectPayload
    ): Promise<AdminSubject> {
        return api.post<AdminSubject>("/api/v1/subjects", payload);
    }

    async function getBookings(): Promise<AdminSession[]> {
        const data = await api.get<PageResponse<AdminSession> | AdminSession[]>(
            "/api/v1/sessions"
        );
        return Array.isArray(data) ? data : (data.content ?? []);
    }

    async function confirmPayment(sessionId: number): Promise<void> {
        await api.patch<void>(`/api/v1/sessions/${sessionId}/payment`);
    }

    async function markComplete(sessionId: number): Promise<void> {
        await api.patch<void>(`/api/v1/sessions/${sessionId}/status`);
    }

    async function setMeetingLink(
        sessionId: number,
        meetingLink: string
    ): Promise<void> {
        await api.patch<void>(`/api/v1/sessions/${sessionId}/meeting-link`, {
            meetingLink,
        });
    }

    return {
        getMentors,
        createMentor,
        grantMentorRole,
        getSubjects,
        createSubject,
        getBookings,
        confirmPayment,
        markComplete,
        setMeetingLink,
    };
}