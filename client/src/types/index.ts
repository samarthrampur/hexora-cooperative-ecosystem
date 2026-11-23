// Core TypeScript Types for HEXORA Unified Ecosystem

export type WorkspaceType = 'LMS' | 'ERP' | 'EMPLOYMENT';

export type UserRoleType = 
  | 'SUPER_ADMIN' 
  | 'COOPERATIVE_ADMIN' 
  | 'COOPERATIVE_MEMBER' 
  | 'LEARNER' 
  | 'TRAINER' 
  | 'JOB_SEEKER' 
  | 'EMPLOYER';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  intendedRole: UserRoleType;
  activeWorkspace: WorkspaceType;
  hasSelectedPurpose: boolean;
  isEmailVerified: boolean;
  userRoles: { role: { name: UserRoleType; description?: string } }[];
  workspaceAccess: { workspace: WorkspaceType }[];
}

export interface AuthResponse {
  user: User;
  token: string;
  message?: string;
}

// LMS Types
export interface CourseCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  _count?: { courses: number };
}

export interface Skill {
  id: string;
  name: string;
  category: string;
  description?: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  contentType: 'VIDEO' | 'TEXT' | 'PDF' | 'RESOURCE';
  contentUrl?: string;
  contentBody?: string;
  durationMinutes: number;
  isFreePreview: boolean;
  progresses?: { isCompleted: boolean; completedAt?: string }[];
}

export interface AssessmentQuestion {
  id: string;
  assessmentId: string;
  questionText: string;
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE';
  optionsJson: string; // JSON string of string[]
  correctAnswer: string;
  points: number;
}

export interface Assessment {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  passingScore: number;
  timeLimitMinutes: number;
  questions?: AssessmentQuestion[];
  submissions?: AssessmentSubmission[];
}

export interface AssessmentSubmission {
  id: string;
  assessmentId: string;
  userId: string;
  score: number;
  passed: boolean;
  feedback?: string;
  submittedAt: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail?: string;
  description: string;
  categoryId: string;
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  instructorId: string;
  durationHours: number;
  objectives?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  createdAt: string;
  category?: CourseCategory;
  instructor?: { id: string; fullName: string; email: string };
  lessons?: Lesson[];
  assessments?: Assessment[];
  enrollments?: { progressPercent: number; isCompleted: boolean }[];
  courseSkills?: { skill: Skill }[];
}

export interface Certificate {
  id: string;
  certificateNumber: string;
  userId: string;
  courseId: string;
  issuedAt: string;
  issuingOrg: string;
  grade: string;
  skillsCredited?: string;
  course?: { title: string; category?: { name: string } };
  user?: { fullName: string; email: string };
}

// ERP Types
export interface Cooperative {
  id: string;
  name: string;
  registrationNumber: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  description?: string;
  status: string;
  logoUrl?: string;
  _count?: {
    members: number;
    tasks: number;
    meetings: number;
    financialRecords: number;
  };
}

export interface Member {
  id: string;
  cooperativeId: string;
  userId: string;
  membershipId: string;
  designation: string;
  departmentId?: string;
  joinDate: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  emergencyContact?: string;
  user: { fullName: string; email: string; phone?: string; avatarUrl?: string };
  department?: { id: string; name: string };
}

export interface Department {
  id: string;
  cooperativeId: string;
  name: string;
  description?: string;
  _count?: { members: number };
}

export interface Task {
  id: string;
  cooperativeId: string;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  assignedToMemberId?: string;
  createdByUserId: string;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  assignedMember?: { membershipId: string; user: { fullName: string } };
}

export interface AttendanceRecord {
  id: string;
  cooperativeId: string;
  memberId: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'HALF_DAY' | 'EXCUSED';
  checkInTime?: string;
  checkOutTime?: string;
  verificationMethod: 'MANUAL' | 'BIOMETRIC_DEVICE' | 'RFID' | 'MOBILE_APP';
  notes?: string;
  member: { membershipId: string; user: { fullName: string } };
}

export interface Meeting {
  id: string;
  cooperativeId: string;
  title: string;
  description?: string;
  agenda?: string;
  meetingDate: string;
  locationOrLink?: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'CONCLUDED' | 'CANCELLED';
  minutes?: {
    id: string;
    minutesContent: string;
    actionItemsJson?: string;
    decisionsJson?: string;
    attendanceCount: number;
  };
}

export interface FinancialRecord {
  id: string;
  cooperativeId: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  amount: number;
  description: string;
  transactionDate: string;
  referenceNumber?: string;
  receiptUrl?: string;
  isApproved: boolean;
  recordedByUser?: { fullName: string };
}

export interface DocumentRecord {
  id: string;
  cooperativeId: string;
  title: string;
  category: 'POLICY' | 'LEGAL' | 'FINANCIAL' | 'REPORT' | 'MINUTES' | 'OTHER';
  fileUrl: string;
  fileType?: string;
  fileSize?: number;
  isConfidential: boolean;
  createdAt: string;
  uploadedByUser?: { fullName: string };
}

// Employment Types
export interface CandidateSkill {
  id: string;
  skillId: string;
  proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'EXPERT';
  isVerified: boolean;
  sourceCourseId?: string;
  verifiedAt?: string;
  skill: Skill;
}

export interface CandidateProfile {
  id: string;
  userId: string;
  headline?: string;
  bio?: string;
  experienceYears: number;
  educationLevel?: string;
  currentCity?: string;
  resumeUrl?: string;
  portfolioUrl?: string;
  careerPreferences?: string;
  isPublic: boolean;
  candidateSkills: CandidateSkill[];
  user: { fullName: string; email: string; phone?: string; avatarUrl?: string };
}

export interface EmployerProfile {
  id: string;
  userId: string;
  companyName: string;
  industry: string;
  companySize: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  verifiedStatus: string;
}

export interface JobPosting {
  id: string;
  employerId: string;
  title: string;
  description: string;
  requirements?: string;
  employmentType: 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'REMOTE';
  experienceYears: number;
  location: string;
  salaryRange?: string;
  applicationDeadline?: string;
  status: 'ACTIVE' | 'CLOSED' | 'DRAFT';
  createdAt: string;
  employer?: EmployerProfile;
  jobSkills?: { skill: Skill; isMandatory: boolean }[];
  applications?: { id: string; status: string }[];
  matchScore?: number;
  matchingReasons?: string[];
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  candidateProfileId: string;
  coverLetter?: string;
  resumeUrl?: string;
  status: 'APPLIED' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';
  employerNotes?: string;
  appliedAt: string;
  jobPosting?: JobPosting;
  candidateProfile?: CandidateProfile;
}

export interface SkillGapAnalysis {
  candidateProfileId: string;
  jobPostingId?: string;
  jobTitle?: string;
  companyName?: string;
  existingSkills: { id: string; name: string; isVerified: boolean }[];
  missingSkills: { id: string; name: string; isMandatory: boolean }[];
  recommendedCourses: Course[];
  overallMatchPercentage: number;
}
