import type { Enrollment, Mentor } from "@/types";
import { useAuth } from "@clerk/clerk-react";

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

const CLERK_JWT_TEMPLATE = "skillmentor-auth";

export interface PageResponse<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size?: number;
    number?: number;
}

export interface AdminMentor {
    id: number;
    mentorId: string;
    title: string;
    profession: string | null;
    company: string | null;
    experienceYears: number | null;
    bio: string | null;
    profileImageUrl: string | null;
    isCertified: boolean;
    startYear: number | null;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
        phoneNumber: string | null;
    };
}

export interface AdminSession {
    id: number;
    mentorName: string;
    mentorProfileImageUrl: string | null;
    subjectName: string;
    sessionAt: string;
    durationMinutes: number | null;
    paymentStatus: "PENDING" | "pending" | "CONFIRMED" | "REFUNDED";
    sessionStatus: "PENDING" | "CONFIRMED" | "SCHEDULED" | "COMPLETED" | "CANCELLED";
    meetingLink: string | null;
}

export interface AdminSubject {
    id: number;
    subjectName: string;
    description: string;
    courseImageUrl: string | null;
    mentorId: number;
    mentorName: string;
    mentorProfileImageUrl: string | null;
}

export interface CreateSubjectPayload {
    name: string;
    description: string;
    imageUrl?: string;
    mentorId: number;
}

export interface CreateMentorPayload {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber?: string;
    title: string;
    profession?: string;
    company?: string;
    experienceYears?: number;
    bio?: string;
    profileImageUrl?: string;
    isCertified: boolean;
    startYear?: number;
}

async function fetchWithAuth(
    endpoint: string,
    token: string,
    options: RequestInit = {},
): Promise<Response> {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Request failed" }));
        throw new Error(error.message || `HTTP ${res.status}`);
    }

    return res;
}

async function parseError(res: Response): Promise<never> {
    const body = await res.json().catch(() => null);

    const message = body?.message || body?.error || `Request failed with status ${res.status}`;

    // Attach status code to message so callers can detect specific errors (e.g. 409 Conflict)
    const error = new Error(message) as Error & { status: number };
    error.status = res.status;
    throw error;
}

// ── Unauthenticated request (public routes) ───────────────────────────────────
async function request<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        return parseError(res);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

// ── Authenticated request (protected routes) ──────────────────────────────────
async function requestWithToken<T>(
    path: string,
    token: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await fetch(`${API_BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(options.headers ?? {}),
        },
    });

    if (!res.ok) {
        return parseError(res);
    }

    if (res.status === 204) {
        return undefined as T;
    }

    return res.json() as Promise<T>;
}

export function useApi() {
    const { getToken } = useAuth();

    async function getAuthToken(): Promise<string> {
        const token = await getToken({ template: CLERK_JWT_TEMPLATE });

        if (!token) {
            throw new Error("Unable to get authentication token");
        }

        return token;
    }

    // Authenticated methods
    async function get<T>(path: string): Promise<T> {
        const token = await getAuthToken();
        return requestWithToken<T>(path, token);
    }

    async function post<T>(path: string, body: unknown): Promise<T> {
        const token = await getAuthToken();
        return requestWithToken<T>(path, token, {
            method: "POST",
            body: JSON.stringify(body),
        });
    }

    async function put<T>(path: string, body?: unknown): Promise<T> {
        const token = await getAuthToken();
        return requestWithToken<T>(path, token, {
            method: "PUT",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async function patch<T>(path: string, body?: unknown): Promise<T> {
        const token = await getAuthToken();
        return requestWithToken<T>(path, token, {
            method: "PATCH",
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });
    }

    async function remove<T>(path: string): Promise<T> {
        const token = await getAuthToken();
        return requestWithToken<T>(path, token, {
            method: "DELETE",
        });
    }

    // ── Public (no token) ─────────────────────────────────────────────────────
    async function publicGet<T>(path: string): Promise<T> {
        return request<T>(path);
    }

    return {
        get,
        post,
        put,
        patch,
        remove,
        publicGet,
        getAuthToken,
    };
}

// Public APIs
export async function getPublicMentors(
    page = 0,
    size = 10
): Promise<PageResponse<Mentor>> {
    return request<PageResponse<Mentor>>(
        `/api/v1/mentors?page=${page}&size=${size}`
    );
}

// Student APIs
export async function enrollInSession(
    token: string,
    data: {
        mentorId: number;
        subjectId: number;
        sessionAt: string;
        durationMinutes?: number;
    },
): Promise<Enrollment> {
    const res = await fetchWithAuth("/api/v1/sessions/enroll", token, {
        method: "POST",
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function getMyEnrollments(token: string): Promise<Enrollment[]> {
    const res = await fetchWithAuth("/api/v1/sessions/my-sessions", token);
    return res.json();
}
