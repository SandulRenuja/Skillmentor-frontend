// ─── Admin API Functions ────────────────────────────────────────────────────
// Add these to your existing api.ts or import from here

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

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

// ─── Mentor Admin ────────────────────────────────────────────────────────────

export interface CreateMentorPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title?: string;
  profession?: string;
  company?: string;
  experienceYears: number;
  bio?: string;
  profileImageUrl?: string;
  isCertified: boolean;
  startYear?: string;
  positiveReviews?: number;
  totalEnrollments?: number;
}

export async function adminCreateMentor(
  token: string,
  data: CreateMentorPayload,
) {
  const res = await fetchWithAuth("/api/v1/mentors", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Subject Admin ───────────────────────────────────────────────────────────

export interface CreateSubjectPayload {
  subjectName: string;
  description: string;
  courseImageUrl?: string;
  mentorId: number;
}

export async function adminCreateSubject(
  token: string,
  data: CreateSubjectPayload,
) {
  const res = await fetchWithAuth("/api/v1/subjects", token, {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.json();
}

// ─── Bookings Admin ──────────────────────────────────────────────────────────

export interface AdminSession {
  id: number;
  studentName: string;
  studentEmail: string;
  mentorName: string;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  paymentStatus: string;
  meetingLink: string | null;
}

export async function adminGetAllSessions(
  token: string,
): Promise<AdminSession[]> {
  const res = await fetchWithAuth("/api/v1/sessions", token);
  return res.json();
}

export async function adminUpdateSession(
  token: string,
  id: number,
  data: Partial<{
    sessionStatus: string;
    paymentStatus: string;
    meetingLink: string;
  }>,
) {
  const res = await fetchWithAuth(`/api/v1/sessions/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(data),
  });
  return res.json();
}