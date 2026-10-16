export type Wing = 'primary' | 'middle' | 'senior';

export type AbsenceScope = 'full' | 'morning' | 'afternoon';

export interface Teacher {
  id: string;
  name: string;
  department: string;
  wing: Wing;
  baseWorkload: number; // Scheduled regular lessons today (3-6)
  subjects: string[];
  email: string;
}

export interface TimetableSlot {
  classId: number; // 1 to 12
  period: number;  // 1 to 8
  teacherId: string;
  subject: string;
}

export interface AbsenceRecord {
  teacherId: string;
  scope: AbsenceScope;
  timestamp: number;
}

export interface SubstitutionAssignment {
  id: string;
  classId: number; // 1 to 12
  period: number;  // 1 to 8
  originalTeacherId: string;
  substituteTeacherId: string;
  subject: string;
  reason: string;
  wingMatch: boolean;
  isManualOverride?: boolean;
  isEmergencyTier?: boolean;
  isStudyHall?: boolean;
}

export interface UncoveredSlot {
  classId: number;
  period: number;
  originalTeacherId: string;
  subject: string;
  reason: string;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetInMs: number;
  resetTimeFormatted: string;
  isLimited: boolean;
  totalUsed: number;
}

export interface SubstitutionPlan {
  id: string;
  createdAt: string;
  date: string;
  generatedAtTimestamp?: number;
  absences: AbsenceRecord[];
  assignments: SubstitutionAssignment[];
  uncoveredSlots: UncoveredSlot[];
  aiSummary?: string;
  aiContinuityNotes?: string;
  isOverThreshold: boolean;
  isContingencyPlan?: boolean;
  rateLimit?: RateLimitInfo;
}

export interface TeacherWorkloadStatus {
  teacher: Teacher;
  basePeriods: number;
  substitutedPeriods: number;
  totalPeriods: number;
  isEligibleForSub: boolean;
  isAbsentToday: boolean;
  absenceScope?: AbsenceScope;
  ineligibleReason?: string;
}

export interface CandidateEvaluation {
  teacher: Teacher;
  status: 'recommended' | 'eligible' | 'ineligible';
  reason: string;
  score: number;
  currentWorkload: number;
  projectedWorkload: number;
}
