import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MentorSubject {
  id: number;
  subjectName: string;
  description: string;
  courseImageUrl: string;
  totalEnrollments: number;
}

interface MentorProfile {
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
  subjects: MentorSubject[];
}

interface Review {
  id: number;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  suffix = "",
}: {
  value: string | number;
  label: string;
  suffix?: string;
}) {
  return (
    <div className="stat-card">
      <span className="stat-value">
        {value}
        {suffix}
      </span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function StarRow({
  rating,
  max = 5,
  size = 16,
}: {
  rating: number;
  max?: number;
  size?: number;
}) {
  return (
    <span className="star-row">
      {Array.from({ length: max }, (_, i) => {
        const filled = i + 1 <= Math.round(rating);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill={filled ? "#fbbf24" : "none"}
            stroke={filled ? "#fbbf24" : "#d1d5db"}
            strokeWidth="2"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        );
      })}
    </span>
  );
}

function SubjectCard({
  subject,
  onBook,
}: {
  subject: MentorSubject;
  onBook: (id: number) => void;
}) {
  return (
    <div className="subject-card">
      <div className="subject-thumb">
        {subject.courseImageUrl ? (
          <img src={subject.courseImageUrl} alt={subject.subjectName} />
        ) : (
          <div className="subject-thumb-placeholder">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
      </div>
      <div className="subject-body">
        <h3 className="subject-name">{subject.subjectName}</h3>
        <p className="subject-desc">
          {subject.description?.length > 100
            ? subject.description.slice(0, 100) + "…"
            : subject.description || "No description available."}
        </p>
        <div className="subject-footer">
          <span className="enrolment-badge">
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            {subject.totalEnrollments ?? 0} students enrolled
          </span>
          <button className="book-btn" onClick={() => onBook(subject.id)}>
            Book this subject
          </button>
        </div>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.studentName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="review-card">
      <div className="review-header">
        <div className="review-avatar">{initials}</div>
        <div>
          <p className="review-name">{review.studentName}</p>
          <StarRow rating={review.rating} size={13} />
        </div>
        <span className="review-date">
          {new Date(review.createdAt).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
      {review.comment && <p className="review-comment">{review.comment}</p>}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { publicGet } = useApi();

  const [mentor, setMentor] = useState<MentorProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      publicGet<MentorProfile>(`/api/v1/mentors/${id}/profile`),
      publicGet<Review[]>(`/api/v1/reviews/mentor/${id}`),
      publicGet<number>(`/api/v1/reviews/mentor/${id}/average`),
    ])
      .then(([mentorData, reviewData, avg]) => {
        setMentor(mentorData);
        setReviews(reviewData);
        setAvgRating(avg ?? 0);
      })
      .catch((e) =>
        setError(e instanceof Error ? e.message : "Failed to load profile"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="mp-loading">
        <div className="mp-spinner" />
        <p>Loading profile…</p>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="mp-error">
        <p>{error ?? "Mentor not found."}</p>
        <button onClick={() => navigate(-1)}>Go back</button>
      </div>
    );
  }

  const fullName = `${mentor.firstName} ${mentor.lastName}`;
  const subjectCount = mentor.subjects?.length ?? 0;
  const reviewPct = mentor.positiveReviews ?? 0;

  return (
    <>
      <style>{`
        .mp-root {
          --mp-accent: #1a56db; --mp-ink: #0f172a; --mp-muted: #64748b;
          --mp-border: #e2e8f0; --mp-surface: #f8fafc; --mp-card: #ffffff; --mp-radius: 14px;
          font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
          color: var(--mp-ink); background: var(--mp-surface); min-height: 100vh; padding-bottom: 80px;
        }
        .mp-loading, .mp-error { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; color: #64748b; font-size: 15px; }
        .mp-spinner { width: 36px; height: 36px; border: 3px solid #e2e8f0; border-top-color: #1a56db; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .mp-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 60%, #1a56db22 100%); padding: 60px 24px 48px; position: relative; overflow: hidden; }
        .mp-hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 50%, #1a56db18 0%, transparent 60%); pointer-events: none; }
        .mp-hero-inner { max-width: 960px; margin: 0 auto; display: flex; gap: 40px; align-items: flex-start; position: relative; z-index: 1; }
        .mp-avatar-wrap { position: relative; flex-shrink: 0; }
        .mp-avatar { width: 128px; height: 128px; border-radius: 50%; object-fit: cover; border: 3px solid rgba(255,255,255,0.15); background: #1e3a5f; display: block; }
        .mp-avatar-placeholder { width: 128px; height: 128px; border-radius: 50%; background: linear-gradient(135deg, #1a56db33, #6366f133); border: 3px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 600; color: rgba(255,255,255,0.7); }
        .mp-cert-badge { position: absolute; bottom: 4px; right: 4px; background: #16a34a; border: 2px solid #0f172a; border-radius: 50%; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
        .mp-hero-info { flex: 1; }
        .mp-since { font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin: 0 0 8px; }
        .mp-name { font-size: clamp(26px, 4vw, 38px); font-weight: 700; color: #fff; margin: 0 0 4px; line-height: 1.15; letter-spacing: -0.5px; }
        .mp-title-line { font-size: 15px; color: #94a3b8; margin: 0 0 16px; }
        .mp-title-line strong { color: #cbd5e1; font-weight: 500; }
        .mp-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
        .mp-tag { padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 500; background: rgba(255,255,255,0.08); color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); }
        .mp-tag.cert { background: #16a34a22; color: #86efac; border-color: #16a34a44; }
        .mp-rating-row { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
        .star-row { display: flex; gap: 2px; }
        .mp-rating-num { font-size: 18px; font-weight: 700; color: #fff; }
        .mp-review-count { font-size: 13px; color: #94a3b8; }
        .mp-cta { display: inline-flex; align-items: center; gap: 8px; background: var(--mp-accent); color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; transition: background 0.15s, transform 0.1s; }
        .mp-cta:hover { background: #1648c0; transform: translateY(-1px); }
        .mp-stats-bar { background: #fff; border-bottom: 1px solid var(--mp-border); padding: 0 24px; }
        .mp-stats-inner { max-width: 960px; margin: 0 auto; display: grid; grid-template-columns: repeat(4, 1fr); }
        .stat-card { padding: 24px 16px; display: flex; flex-direction: column; align-items: center; border-right: 1px solid var(--mp-border); text-align: center; }
        .stat-card:last-child { border-right: none; }
        .stat-value { font-size: 28px; font-weight: 700; color: var(--mp-ink); line-height: 1; margin-bottom: 4px; letter-spacing: -0.5px; }
        .stat-label { font-size: 12px; color: var(--mp-muted); text-transform: uppercase; letter-spacing: 0.06em; }
        .mp-content { max-width: 960px; margin: 0 auto; padding: 48px 24px 0; display: grid; gap: 48px; }
        .mp-section-title { font-size: 13px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--mp-accent); margin: 0 0 20px; }
        .mp-bio { font-size: 16px; line-height: 1.8; color: #334155; margin: 0 0 24px; }
        .mp-highlights { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
        .mp-highlight { background: var(--mp-surface); border: 1px solid var(--mp-border); border-radius: 10px; padding: 14px 16px; display: flex; align-items: center; gap: 10px; }
        .mp-highlight-icon { width: 36px; height: 36px; border-radius: 8px; background: #eff6ff; display: flex; align-items: center; justify-content: center; color: var(--mp-accent); flex-shrink: 0; }
        .mp-highlight-label { font-size: 12px; color: var(--mp-muted); }
        .mp-highlight-value { font-size: 14px; font-weight: 600; color: var(--mp-ink); }
        .mp-subjects-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
        .subject-card { background: var(--mp-card); border: 1px solid var(--mp-border); border-radius: var(--mp-radius); overflow: hidden; transition: box-shadow 0.15s, transform 0.15s; display: flex; flex-direction: column; }
        .subject-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.08); transform: translateY(-2px); }
        .subject-thumb { height: 148px; overflow: hidden; background: #f1f5f9; }
        .subject-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .subject-thumb-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; background: linear-gradient(135deg, #f1f5f9, #e2e8f0); }
        .subject-body { padding: 16px; flex: 1; display: flex; flex-direction: column; }
        .subject-name { font-size: 15px; font-weight: 600; color: var(--mp-ink); margin: 0 0 6px; }
        .subject-desc { font-size: 13px; color: var(--mp-muted); line-height: 1.6; flex: 1; margin: 0 0 14px; }
        .subject-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .enrolment-badge { display: flex; align-items: center; gap: 5px; font-size: 12px; color: var(--mp-muted); }
        .book-btn { font-size: 12px; font-weight: 600; color: var(--mp-accent); background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 7px; padding: 6px 12px; cursor: pointer; transition: background 0.12s; white-space: nowrap; }
        .book-btn:hover { background: var(--mp-accent); color: #fff; border-color: var(--mp-accent); }
        .mp-avg-row { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .mp-avg-num { font-size: 40px; font-weight: 800; color: var(--mp-ink); line-height: 1; }
        .mp-avg-meta { display: flex; flex-direction: column; gap: 4px; }
        .mp-avg-count { font-size: 13px; color: var(--mp-muted); }
        .mp-reviews-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .review-card { background: var(--mp-card); border: 1px solid var(--mp-border); border-radius: var(--mp-radius); padding: 16px; display: flex; flex-direction: column; gap: 10px; }
        .review-header { display: flex; align-items: center; gap: 10px; }
        .review-avatar { width: 36px; height: 36px; border-radius: 50%; background: #eff6ff; color: var(--mp-accent); font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .review-name { font-size: 14px; font-weight: 600; color: var(--mp-ink); margin: 0 0 2px; }
        .review-date { margin-left: auto; font-size: 12px; color: var(--mp-muted); white-space: nowrap; }
        .review-comment { font-size: 13px; color: #475569; line-height: 1.6; margin: 0; }
        .mp-no-reviews { color: var(--mp-muted); font-size: 14px; padding: 8px 0; }
        @media (max-width: 640px) {
          .mp-hero-inner { flex-direction: column; gap: 24px; }
          .mp-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .stat-card:nth-child(2) { border-right: none; }
          .stat-card:nth-child(3) { border-right: 1px solid var(--mp-border); }
        }
      `}</style>

      <div className="mp-root">
        {/* Hero */}
        <div className="mp-hero">
          <div className="mp-hero-inner">
            <div className="mp-avatar-wrap">
              {mentor.profileImageUrl ? (
                <img
                  className="mp-avatar"
                  src={mentor.profileImageUrl}
                  alt={fullName}
                />
              ) : (
                <div className="mp-avatar-placeholder">
                  {mentor.firstName?.[0]}
                  {mentor.lastName?.[0]}
                </div>
              )}
              {mentor.isCertified && (
                <div className="mp-cert-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            <div className="mp-hero-info">
              {mentor.startYear && (
                <p className="mp-since">Mentoring since {mentor.startYear}</p>
              )}
              <h1 className="mp-name">{fullName}</h1>
              <p className="mp-title-line">
                {mentor.title && <strong>{mentor.title}</strong>}
                {mentor.title && mentor.company && " · "}
                {mentor.company}
                {(mentor.title || mentor.company) && mentor.profession && " · "}
                {mentor.profession}
              </p>
              <div className="mp-tags">
                {mentor.isCertified && (
                  <span className="mp-tag cert">✓ Certified Mentor</span>
                )}
                {mentor.experienceYears > 0 && (
                  <span className="mp-tag">
                    {mentor.experienceYears}+ years exp.
                  </span>
                )}
                {subjectCount > 0 && (
                  <span className="mp-tag">{subjectCount} subjects</span>
                )}
              </div>
              <div className="mp-rating-row">
                <span className="mp-rating-num">{avgRating.toFixed(1)}</span>
                <StarRow rating={avgRating} size={18} />
                <span className="mp-review-count">
                  {reviews.length} review{reviews.length !== 1 ? "s" : ""} ·{" "}
                  {reviewPct}% positive
                </span>
              </div>
              <button
                className="mp-cta"
                onClick={() => navigate(`/book/${mentor.id}`)}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Schedule a session
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mp-stats-bar">
          <div className="mp-stats-inner">
            <StatCard
              value={mentor.totalEnrollments ?? 0}
              label="Students taught"
            />
            <StatCard
              value={mentor.experienceYears}
              suffix="+ yrs"
              label="Experience"
            />
            <StatCard value={`${avgRating.toFixed(1)} ★`} label="Avg rating" />
            <StatCard value={subjectCount} label="Subjects taught" />
          </div>
        </div>

        {/* Content */}
        <div className="mp-content">
          {/* About */}
          <section>
            <p className="mp-section-title">About</p>
            {mentor.bio && <p className="mp-bio">{mentor.bio}</p>}
            <div className="mp-highlights">
              {mentor.company && (
                <div className="mp-highlight">
                  <div className="mp-highlight-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  </div>
                  <div>
                    <p className="mp-highlight-label">Company</p>
                    <p className="mp-highlight-value">{mentor.company}</p>
                  </div>
                </div>
              )}
              {mentor.profession && (
                <div className="mp-highlight">
                  <div className="mp-highlight-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  </div>
                  <div>
                    <p className="mp-highlight-label">Profession</p>
                    <p className="mp-highlight-value">{mentor.profession}</p>
                  </div>
                </div>
              )}
              {mentor.experienceYears > 0 && (
                <div className="mp-highlight">
                  <div className="mp-highlight-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <p className="mp-highlight-label">Experience</p>
                    <p className="mp-highlight-value">
                      {mentor.experienceYears}+ years
                    </p>
                  </div>
                </div>
              )}
              {mentor.startYear && (
                <div className="mp-highlight">
                  <div className="mp-highlight-icon">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                      <path d="M6 12v5c3 3 9 3 12 0v-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="mp-highlight-label">Mentoring since</p>
                    <p className="mp-highlight-value">{mentor.startYear}</p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Subjects */}
          <section>
            <p className="mp-section-title">Subjects Taught</p>
            {subjectCount === 0 ? (
              <p style={{ color: "var(--mp-muted)", fontSize: 14 }}>
                No subjects assigned yet.
              </p>
            ) : (
              <div className="mp-subjects-grid">
                {mentor.subjects.map((s) => (
                  <SubjectCard
                    key={s.id}
                    subject={s}
                    onBook={(sid) => navigate(`/subjects/${sid}/book`)}
                  />
                ))}
              </div>
            )}
          </section>

          {/* Reviews */}
          <section>
            <p className="mp-section-title">Student Reviews</p>
            {reviews.length > 0 && (
              <div className="mp-avg-row">
                <span className="mp-avg-num">{avgRating.toFixed(1)}</span>
                <div className="mp-avg-meta">
                  <StarRow rating={avgRating} size={16} />
                  <span className="mp-avg-count">
                    {reviews.length} review{reviews.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            )}
            {reviews.length === 0 ? (
              <p className="mp-no-reviews">
                No reviews yet. Be the first to leave one!
              </p>
            ) : (
              <div className="mp-reviews-grid">
                {reviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
