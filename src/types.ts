// Modified to match with backend SubjectResponseDTO
export interface Subject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
}

// Modified to match with backend MentorResponseDTO (from GET /api/v1/mentors)
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

// SubjectStat — subject with enrollment count (used in MentorProfile)
export interface SubjectStat {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
  enrollmentCount: number;
}

// Review from a completed session
export interface Review {
  id: number;
  studentName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

// Rich mentor profile — from GET /api/v1/mentors/{id}/profile
export interface MentorProfile {
  id: number;
  mentorId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  title: string;
  profession: string;
  company: string;
  experienceYears: number;
  bio: string;
  profileImageUrl: string;
  isCertified: boolean;
  startYear: string;
  positiveReviews: number;
  totalEnrollments: number;
  averageRating: number;
  reviewCount: number;
  subjects: SubjectStat[];
  reviews: Review[];
}

// Modified to match with SessionResponseDTO (from GET /api/v1/sessions/my-sessions)
export interface Enrollment {
  id: number;
  mentorId: number;
  mentorName: string;
  mentorProfileImageUrl: string;
  subjectId: number;
  subjectName: string;
  sessionAt: string;
  durationMinutes: number;
  sessionStatus: string;
  paymentStatus: "pending" | "accepted" | "completed" | "cancelled";
  meetingLink: string | null;
  studentRating: number | null;
  studentReview: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
}