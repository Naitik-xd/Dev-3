import { Teacher, TimetableSlot, AbsenceRecord, SubstitutionAssignment, UncoveredSlot, SubstitutionPlan, CandidateEvaluation, Wing } from '../types';
import { TEACHERS, MASTER_TIMETABLE, getWingForClass, getTeacherById } from '../data/mockData';

export const MAX_DAILY_LESSONS = 8;
export const MAX_BASE_FOR_SUB = 5; // Teachers with >= 6 lessons receive NO substitutions
export const ABSENCE_THRESHOLD_PERCENT = 50;

/**
 * Checks if a teacher is absent during a specific period.
 */
export const isTeacherAbsentInPeriod = (
  teacherId: string,
  period: number,
  absences: AbsenceRecord[]
): boolean => {
  const record = absences.find(a => a.teacherId === teacherId);
  if (!record) return false;
  if (record.scope === 'full') return true;
  if (record.scope === 'morning' && period >= 1 && period <= 4) return true;
  if (record.scope === 'afternoon' && period >= 5 && period <= 8) return true;
  return false;
};

/**
 * Checks if a teacher is already teaching in the regular timetable for this period.
 */
export const isTeacherTeachingRegular = (
  teacherId: string,
  period: number,
  timetable: TimetableSlot[] = MASTER_TIMETABLE
): boolean => {
  return timetable.some(slot => slot.teacherId === teacherId && slot.period === period);
};

/**
 * Computes base scheduled periods for a teacher from the master timetable.
 */
export const getTeacherBasePeriods = (
  teacherId: string,
  timetable: TimetableSlot[] = MASTER_TIMETABLE
): number => {
  return timetable.filter(slot => slot.teacherId === teacherId).length;
};

/**
 * Proximity score between teacher wing and class wing.
 * Primary: 1-5, Middle: 6-8, Senior: 9-12
 */
export const getWingProximityScore = (teacherWing: Wing, classWing: Wing): { score: number; isMatch: boolean } => {
  if (teacherWing === classWing) {
    return { score: 100, isMatch: true };
  }
  // Adjacent wings get partial bonus
  if (
    (teacherWing === 'primary' && classWing === 'middle') ||
    (teacherWing === 'middle' && (classWing === 'primary' || classWing === 'senior')) ||
    (teacherWing === 'senior' && classWing === 'middle')
  ) {
    return { score: 35, isMatch: false };
  }
  return { score: 0, isMatch: false };
};

/**
 * Evaluates whether a candidate teacher can be assigned to a specific vacant slot.
 */
export const evaluateCandidate = (
  teacher: Teacher,
  classId: number,
  period: number,
  originalTeacherId: string,
  currentAssignedPeriods: Record<string, number>, // teacherId -> total current lessons today
  currentPeriodAssignments: Record<number, string[]>, // period -> list of teacherIds already busy in this period
  absences: AbsenceRecord[],
  timetable: TimetableSlot[] = MASTER_TIMETABLE
): CandidateEvaluation => {
  const classWing = getWingForClass(classId);
  const baseLoad = getTeacherBasePeriods(teacher.id, timetable);
  const currentTotal = currentAssignedPeriods[teacher.id] ?? baseLoad;

  // Rule: Cannot substitute for self
  if (teacher.id === originalTeacherId) {
    return {
      teacher,
      status: 'ineligible',
      reason: 'Scheduled regular teacher of this class',
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Rule: Marked absent in this period
  if (isTeacherAbsentInPeriod(teacher.id, period, absences)) {
    return {
      teacher,
      status: 'ineligible',
      reason: 'Marked absent during this period',
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Rule: Already teaching in master timetable during this period
  const regularSlot = timetable.find(s => s.teacherId === teacher.id && s.period === period);
  if (regularSlot) {
    return {
      teacher,
      status: 'ineligible',
      reason: `Already teaching regular Class ${regularSlot.classId} in Period ${period}`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Rule: Already assigned another substitution in this period
  const periodBusyList = currentPeriodAssignments[period] || [];
  if (periodBusyList.includes(teacher.id)) {
    return {
      teacher,
      status: 'ineligible',
      reason: `Already assigned another substitution in Period ${period}`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Rule: Teachers with 6 or more regular lessons should NOT receive substitutions
  if (baseLoad >= 6) {
    return {
      teacher,
      status: 'ineligible',
      reason: `Base workload of ${baseLoad} lessons reaches the $\\ge 6$ workload restriction`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Rule: Absolute hard ceiling of 8 lessons per day
  if (currentTotal >= MAX_DAILY_LESSONS) {
    return {
      teacher,
      status: 'ineligible',
      reason: `Daily maximum limit of ${MAX_DAILY_LESSONS} lessons reached`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal,
    };
  }

  // Calculate score for eligible candidate:
  // 1. Grade-level proximity (Primary: same wing gets +100, adjacent gets +35)
  const { score: wingScore, isMatch: wingMatch } = getWingProximityScore(teacher.wing, classWing);

  // 2. Department / Subject affinity (+25)
  const originalTeacher = getTeacherById(originalTeacherId);
  const departmentBonus = (originalTeacher && teacher.department === originalTeacher.department) ? 25 : 0;

  // 3. Workload equity bonus (more free periods remaining = higher priority)
  const equityBonus = (MAX_DAILY_LESSONS - currentTotal) * 8;

  const totalScore = wingScore + departmentBonus + equityBonus;

  const isRecommended = wingMatch && currentTotal <= 5;

  let rationale = `${wingMatch ? 'Same wing match' : 'Cross-wing coverage'}, current load ${currentTotal}/${MAX_DAILY_LESSONS}`;
  if (departmentBonus > 0) {
    rationale += `, ${teacher.department} specialty`;
  }

  return {
    teacher,
    status: isRecommended ? 'recommended' : 'eligible',
    reason: rationale,
    score: totalScore,
    currentWorkload: currentTotal,
    projectedWorkload: currentTotal + 1,
  };
};

/**
 * Gets ranked candidate list for a single slot (used for manual swapping modal).
 */
export const getCandidateTeachersForSlot = (
  classId: number,
  period: number,
  originalTeacherId: string,
  existingAssignments: SubstitutionAssignment[],
  absences: AbsenceRecord[],
  teachers: Teacher[] = TEACHERS,
  timetable: TimetableSlot[] = MASTER_TIMETABLE
): CandidateEvaluation[] => {
  // Build current load and period busy state
  const currentAssignedPeriods: Record<string, number> = {};
  const currentPeriodAssignments: Record<number, string[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []
  };

  for (const t of teachers) {
    currentAssignedPeriods[t.id] = getTeacherBasePeriods(t.id, timetable);
  }

  for (const assign of existingAssignments) {
    // Exclude the current slot assignment being inspected
    if (assign.classId === classId && assign.period === period) continue;
    currentAssignedPeriods[assign.substituteTeacherId] = (currentAssignedPeriods[assign.substituteTeacherId] || 0) + 1;
    if (!currentPeriodAssignments[assign.period]) {
      currentPeriodAssignments[assign.period] = [];
    }
    currentPeriodAssignments[assign.period].push(assign.substituteTeacherId);
  }

  const evaluations = teachers.map(teacher =>
    evaluateCandidate(
      teacher,
      classId,
      period,
      originalTeacherId,
      currentAssignedPeriods,
      currentPeriodAssignments,
      absences,
      timetable
    )
  );

  // Sort: recommended first, then eligible by highest score, then ineligible
  return evaluations.sort((a, b) => {
    if (a.status === 'recommended' && b.status !== 'recommended') return -1;
    if (b.status === 'recommended' && a.status !== 'recommended') return 1;
    if (a.status === 'eligible' && b.status === 'ineligible') return -1;
    if (b.status === 'eligible' && a.status === 'ineligible') return 1;
    return b.score - a.score;
  });
};

/**
 * Generates an end-to-end substitution plan for all selected absences.
 */
export const generateSubstitutionPlan = (
  absences: AbsenceRecord[],
  teachers: Teacher[] = TEACHERS,
  timetable: TimetableSlot[] = MASTER_TIMETABLE
): SubstitutionPlan => {
  const totalTeachers = teachers.length;
  const absentTeacherCount = absences.length;
  const absencePercentage = Math.round((absentTeacherCount / totalTeachers) * 100);

  // Check 50% threshold rule: If > 50% unavailable, do not generate
  if (absencePercentage > ABSENCE_THRESHOLD_PERCENT) {
    return {
      id: `plan-${Date.now()}`,
      createdAt: new Date().toLocaleTimeString(),
      date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
      absences,
      assignments: [],
      uncoveredSlots: [],
      aiSummary: `Absence threshold exceeded (${absencePercentage}% absent: ${absentTeacherCount} of ${totalTeachers} teachers). Contingency protocol requires administrative activation.`,
      isOverThreshold: true,
    };
  }

  // 1. Identify all vacant slots across all classes
  interface VacantSlot {
    classId: number;
    period: number;
    originalTeacherId: string;
    subject: string;
    classWing: Wing;
  }

  const vacantSlots: VacantSlot[] = [];

  for (const slot of timetable) {
    if (isTeacherAbsentInPeriod(slot.teacherId, slot.period, absences)) {
      vacantSlots.push({
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.teacherId,
        subject: slot.subject,
        classWing: getWingForClass(slot.classId),
      });
    }
  }

  // Sort vacant slots by period, then classId
  vacantSlots.sort((a, b) => a.period - b.period || a.classId - b.classId);

  // Track dynamic state
  const currentAssignedPeriods: Record<string, number> = {};
  const currentPeriodAssignments: Record<number, string[]> = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [], 8: []
  };

  for (const t of teachers) {
    currentAssignedPeriods[t.id] = getTeacherBasePeriods(t.id, timetable);
  }

  const assignments: SubstitutionAssignment[] = [];
  const uncoveredSlots: UncoveredSlot[] = [];

  // 2. Solve each vacant slot
  for (const slot of vacantSlots) {
    const candidates = teachers.map(teacher =>
      evaluateCandidate(
        teacher,
        slot.classId,
        slot.period,
        slot.originalTeacherId,
        currentAssignedPeriods,
        currentPeriodAssignments,
        absences,
        timetable
      )
    ).filter(c => c.status !== 'ineligible');

    if (candidates.length === 0) {
      uncoveredSlots.push({
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.originalTeacherId,
        subject: slot.subject,
        reason: 'No eligible teachers available with free period and valid workload quota',
      });
      continue;
    }

    // Sort eligible candidates by score
    candidates.sort((a, b) => b.score - a.score);
    const chosen = candidates[0];

    // Assign chosen substitute
    assignments.push({
      id: `assign-${slot.classId}-${slot.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      classId: slot.classId,
      period: slot.period,
      originalTeacherId: slot.originalTeacherId,
      substituteTeacherId: chosen.teacher.id,
      subject: slot.subject,
      reason: chosen.reason,
      wingMatch: chosen.teacher.wing === slot.classWing,
    });

    // Update dynamic state
    currentAssignedPeriods[chosen.teacher.id] = (currentAssignedPeriods[chosen.teacher.id] || 0) + 1;
    currentPeriodAssignments[slot.period].push(chosen.teacher.id);
  }

  return {
    id: `plan-${Date.now()}`,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' }),
    absences,
    assignments,
    uncoveredSlots,
    aiSummary: `Successfully resolved ${assignments.length} of ${vacantSlots.length} vacant periods across ${new Set(vacantSlots.map(s => s.classId)).size} classes with zero schedule collisions and wing proximity priority.`,
    isOverThreshold: false,
  };
};
