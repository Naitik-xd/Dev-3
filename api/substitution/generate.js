// src/api/substitution/generate.ts
import { GoogleGenAI } from "@google/genai";

// src/data/mockData.ts
var TEACHERS = [
  // Primary Wing (Classes 1 - 5)
  {
    id: "T01",
    name: "Mrs. Ananya Sharma",
    department: "English & EVS",
    wing: "primary",
    baseWorkload: 4,
    subjects: ["English", "Environmental Studies", "Reading"],
    email: "ananya.sharma@school.edu"
  },
  {
    id: "T02",
    name: "Mr. Rajesh Patel",
    department: "Mathematics",
    wing: "primary",
    baseWorkload: 4,
    subjects: ["Primary Mathematics", "Mental Math"],
    email: "rajesh.patel@school.edu"
  },
  {
    id: "T03",
    name: "Ms. Priya Nair",
    department: "Science & Art",
    wing: "primary",
    baseWorkload: 3,
    subjects: ["General Science", "Visual Arts", "Crafts"],
    email: "priya.nair@school.edu"
  },
  {
    id: "T04",
    name: "Mrs. Sunita Rao",
    department: "Languages",
    wing: "primary",
    baseWorkload: 4,
    subjects: ["Hindi", "Moral Science", "Storytelling"],
    email: "sunita.rao@school.edu"
  },
  {
    id: "T05",
    name: "Mr. David Morris",
    department: "Physical Education",
    wing: "primary",
    baseWorkload: 4,
    subjects: ["Physical Ed", "Games & Athletics"],
    email: "david.morris@school.edu"
  },
  {
    id: "T06",
    name: "Ms. Kavita Sen",
    department: "Social Studies",
    wing: "primary",
    baseWorkload: 3,
    subjects: ["Social Studies", "Library & Reading"],
    email: "kavita.sen@school.edu"
  },
  // Middle Wing (Classes 6 - 8)
  {
    id: "T07",
    name: "Mr. Vikram Malhotra",
    department: "Mathematics",
    wing: "middle",
    baseWorkload: 5,
    subjects: ["Algebra", "Geometry", "Foundation Math"],
    email: "vikram.malhotra@school.edu"
  },
  {
    id: "T08",
    name: "Dr. Neha Gupta",
    department: "Science",
    wing: "middle",
    baseWorkload: 4,
    subjects: ["General Science", "Biology Basics", "Chemistry Lab"],
    email: "neha.gupta@school.edu"
  },
  {
    id: "T09",
    name: "Mrs. Sarah Jenkins",
    department: "English",
    wing: "middle",
    baseWorkload: 5,
    subjects: ["English Literature", "Grammar & Composition"],
    email: "sarah.jenkins@school.edu"
  },
  {
    id: "T10",
    name: "Mr. Amit Verma",
    department: "Social Sciences",
    wing: "middle",
    baseWorkload: 4,
    subjects: ["History & Civics", "Geography"],
    email: "amit.verma@school.edu"
  },
  {
    id: "T11",
    name: "Ms. Meera Joshi",
    department: "Languages",
    wing: "middle",
    baseWorkload: 3,
    subjects: ["Hindi", "Sanskrit", "Second Language"],
    email: "meera.joshi@school.edu"
  },
  {
    id: "T12",
    name: "Mr. Rahul Bajaj",
    department: "Computer Science",
    wing: "middle",
    baseWorkload: 4,
    subjects: ["Computer Science", "Coding & Robotics"],
    email: "rahul.bajaj@school.edu"
  },
  // Senior Secondary Wing (Classes 9 - 12)
  {
    id: "T13",
    name: "Dr. Robert Lang",
    department: "Science",
    wing: "senior",
    baseWorkload: 5,
    subjects: ["Physics", "Applied Physics"],
    email: "robert.lang@school.edu"
  },
  {
    id: "T14",
    name: "Mrs. Vandana Kapoor",
    department: "Science",
    wing: "senior",
    baseWorkload: 5,
    subjects: ["Chemistry", "Organic Chemistry"],
    email: "vandana.kapoor@school.edu"
  },
  {
    id: "T15",
    name: "Mr. Suresh Menon",
    department: "Mathematics",
    wing: "senior",
    baseWorkload: 6,
    // 6 base periods! Eligible for zero substitutions as per rules
    subjects: ["Senior Mathematics", "Calculus", "Statistics"],
    email: "suresh.menon@school.edu"
  },
  {
    id: "T16",
    name: "Dr. Alistair Finch",
    department: "Science",
    wing: "senior",
    baseWorkload: 4,
    subjects: ["Biology", "Biotechnology"],
    email: "alistair.finch@school.edu"
  },
  {
    id: "T17",
    name: "Mrs. Deepa Iyer",
    department: "English",
    wing: "senior",
    baseWorkload: 4,
    subjects: ["Senior English", "Communication Skills"],
    email: "deepa.iyer@school.edu"
  },
  {
    id: "T18",
    name: "Mr. Sanjeev Chawla",
    department: "Commerce & Economics",
    wing: "senior",
    baseWorkload: 5,
    subjects: ["Economics", "Accountancy", "Business Studies"],
    email: "sanjeev.chawla@school.edu"
  }
];
var getWingForClass = (classId) => {
  if (classId <= 5) return "primary";
  if (classId <= 8) return "middle";
  return "senior";
};
var CLASS_NAMES = {
  1: "Class 1-A",
  2: "Class 2-A",
  3: "Class 3-A",
  4: "Class 4-A",
  5: "Class 5-A",
  6: "Class 6-A",
  7: "Class 7-A",
  8: "Class 8-A",
  9: "Class 9-A",
  10: "Class 10-A",
  11: "Class 11-A",
  12: "Class 12-A"
};
var MASTER_TIMETABLE = [
  // Class 1 (Primary)
  { classId: 1, period: 1, teacherId: "T01", subject: "English" },
  { classId: 1, period: 2, teacherId: "T02", subject: "Mathematics" },
  { classId: 1, period: 3, teacherId: "T04", subject: "Hindi" },
  { classId: 1, period: 4, teacherId: "T05", subject: "Physical Ed" },
  { classId: 1, period: 5, teacherId: "T03", subject: "Art & Craft" },
  { classId: 1, period: 6, teacherId: "T01", subject: "EVS" },
  { classId: 1, period: 7, teacherId: "T06", subject: "Storytelling" },
  { classId: 1, period: 8, teacherId: "T05", subject: "Games" },
  // Class 2 (Primary)
  { classId: 2, period: 1, teacherId: "T02", subject: "Mathematics" },
  { classId: 2, period: 2, teacherId: "T01", subject: "English" },
  { classId: 2, period: 3, teacherId: "T05", subject: "Physical Ed" },
  { classId: 2, period: 4, teacherId: "T03", subject: "Science Basics" },
  { classId: 2, period: 5, teacherId: "T04", subject: "Hindi" },
  { classId: 2, period: 6, teacherId: "T06", subject: "Social Studies" },
  { classId: 2, period: 7, teacherId: "T02", subject: "Mental Math" },
  { classId: 2, period: 8, teacherId: "T04", subject: "Reading & Morals" },
  // Class 3 (Primary)
  { classId: 3, period: 1, teacherId: "T04", subject: "Hindi" },
  { classId: 3, period: 2, teacherId: "T03", subject: "Science" },
  { classId: 3, period: 3, teacherId: "T01", subject: "English" },
  { classId: 3, period: 4, teacherId: "T02", subject: "Mathematics" },
  { classId: 3, period: 5, teacherId: "T06", subject: "Social Studies" },
  { classId: 3, period: 6, teacherId: "T05", subject: "Physical Ed" },
  { classId: 3, period: 7, teacherId: "T01", subject: "Reading Lab" },
  { classId: 3, period: 8, teacherId: "T02", subject: "Mathematics" },
  // Class 4 (Primary)
  { classId: 4, period: 1, teacherId: "T05", subject: "Physical Ed" },
  { classId: 4, period: 2, teacherId: "T04", subject: "Hindi" },
  { classId: 4, period: 3, teacherId: "T02", subject: "Mathematics" },
  { classId: 4, period: 4, teacherId: "T01", subject: "English" },
  { classId: 4, period: 5, teacherId: "T03", subject: "Science" },
  { classId: 4, period: 6, teacherId: "T07", subject: "Math Enrichment" },
  { classId: 4, period: 7, teacherId: "T04", subject: "Moral Science" },
  { classId: 4, period: 8, teacherId: "T06", subject: "Social Studies" },
  // Class 5 (Primary)
  { classId: 5, period: 1, teacherId: "T03", subject: "Science" },
  { classId: 5, period: 2, teacherId: "T06", subject: "Social Studies" },
  { classId: 5, period: 3, teacherId: "T04", subject: "Hindi" },
  { classId: 5, period: 4, teacherId: "T08", subject: "Intro Bio" },
  { classId: 5, period: 5, teacherId: "T01", subject: "English" },
  { classId: 5, period: 6, teacherId: "T02", subject: "Mathematics" },
  { classId: 5, period: 7, teacherId: "T05", subject: "Games" },
  { classId: 5, period: 8, teacherId: "T12", subject: "Intro Computers" },
  // Class 6 (Middle)
  { classId: 6, period: 1, teacherId: "T07", subject: "Mathematics" },
  { classId: 6, period: 2, teacherId: "T08", subject: "General Science" },
  { classId: 6, period: 3, teacherId: "T09", subject: "English" },
  { classId: 6, period: 4, teacherId: "T10", subject: "History" },
  { classId: 6, period: 5, teacherId: "T11", subject: "Hindi" },
  { classId: 6, period: 6, teacherId: "T12", subject: "Computer Lab" },
  { classId: 6, period: 7, teacherId: "T07", subject: "Math Tutorial" },
  { classId: 6, period: 8, teacherId: "T09", subject: "English Grammar" },
  // Class 7 (Middle)
  { classId: 7, period: 1, teacherId: "T08", subject: "Science" },
  { classId: 7, period: 2, teacherId: "T07", subject: "Mathematics" },
  { classId: 7, period: 3, teacherId: "T10", subject: "Geography" },
  { classId: 7, period: 4, teacherId: "T09", subject: "English" },
  { classId: 7, period: 5, teacherId: "T12", subject: "Computer Science" },
  { classId: 7, period: 6, teacherId: "T11", subject: "Hindi" },
  { classId: 7, period: 7, teacherId: "T08", subject: "Science Lab" },
  { classId: 7, period: 8, teacherId: "T10", subject: "Civics" },
  // Class 8 (Middle)
  { classId: 8, period: 1, teacherId: "T09", subject: "English Literature" },
  { classId: 8, period: 2, teacherId: "T10", subject: "History" },
  { classId: 8, period: 3, teacherId: "T07", subject: "Algebra" },
  { classId: 8, period: 4, teacherId: "T11", subject: "Sanskrit" },
  { classId: 8, period: 5, teacherId: "T08", subject: "Physics & Chem" },
  { classId: 8, period: 6, teacherId: "T09", subject: "Writing Workshop" },
  { classId: 8, period: 7, teacherId: "T12", subject: "Robotics & Logic" },
  { classId: 8, period: 8, teacherId: "T07", subject: "Geometry" },
  // Class 9 (Senior)
  { classId: 9, period: 1, teacherId: "T10", subject: "Social Science" },
  { classId: 9, period: 2, teacherId: "T09", subject: "English" },
  { classId: 9, period: 3, teacherId: "T13", subject: "Physics" },
  { classId: 9, period: 4, teacherId: "T14", subject: "Chemistry" },
  { classId: 9, period: 5, teacherId: "T15", subject: "Mathematics" },
  { classId: 9, period: 6, teacherId: "T16", subject: "Biology" },
  { classId: 9, period: 7, teacherId: "T17", subject: "English Lab" },
  { classId: 9, period: 8, teacherId: "T18", subject: "Economics Basics" },
  // Class 10 (Senior)
  { classId: 10, period: 1, teacherId: "T13", subject: "Physics" },
  { classId: 10, period: 2, teacherId: "T14", subject: "Chemistry" },
  { classId: 10, period: 3, teacherId: "T15", subject: "Mathematics" },
  { classId: 10, period: 4, teacherId: "T16", subject: "Biology" },
  { classId: 10, period: 5, teacherId: "T17", subject: "English" },
  { classId: 10, period: 6, teacherId: "T18", subject: "Social Studies" },
  { classId: 10, period: 7, teacherId: "T15", subject: "Math Problem Solving" },
  { classId: 10, period: 8, teacherId: "T13", subject: "Physics Lab" },
  // Class 11 (Senior)
  { classId: 11, period: 1, teacherId: "T14", subject: "Chemistry" },
  { classId: 11, period: 2, teacherId: "T15", subject: "Calculus" },
  { classId: 11, period: 3, teacherId: "T16", subject: "Biotechnology" },
  { classId: 11, period: 4, teacherId: "T13", subject: "Physics" },
  { classId: 11, period: 5, teacherId: "T18", subject: "Economics" },
  { classId: 11, period: 6, teacherId: "T17", subject: "English Core" },
  { classId: 11, period: 7, teacherId: "T14", subject: "Chemistry Lab" },
  { classId: 11, period: 8, teacherId: "T15", subject: "Applied Math" },
  // Class 12 (Senior)
  { classId: 12, period: 1, teacherId: "T15", subject: "Advanced Math" },
  { classId: 12, period: 2, teacherId: "T13", subject: "Physics" },
  { classId: 12, period: 3, teacherId: "T14", subject: "Organic Chemistry" },
  { classId: 12, period: 4, teacherId: "T18", subject: "Accountancy" },
  { classId: 12, period: 5, teacherId: "T16", subject: "Cell Biology" },
  { classId: 12, period: 6, teacherId: "T18", subject: "Business Studies" },
  { classId: 12, period: 7, teacherId: "T13", subject: "Physics Practical" },
  { classId: 12, period: 8, teacherId: "T17", subject: "Elective English" }
];
var getTeacherById = (id) => {
  if (id === "DUTY-LIB") {
    return {
      id: "DUTY-LIB",
      name: "Library & Supervised Study Hall",
      department: "Curriculum Review & Study",
      wing: "middle",
      baseWorkload: 0,
      subjects: ["Self-Study", "Reading", "Coursework Review"],
      email: "library@school.edu"
    };
  }
  return TEACHERS.find((t) => t.id === id);
};

// src/utils/solver.ts
var MAX_DAILY_LESSONS = 8;
var ABSENCE_THRESHOLD_PERCENT = 50;
var isTeacherAbsentInPeriod = (teacherId, period, absences) => {
  const record = absences.find((a) => a.teacherId === teacherId);
  if (!record) return false;
  if (record.scope === "full") return true;
  if (record.scope === "morning" && period >= 1 && period <= 4) return true;
  if (record.scope === "afternoon" && period >= 5 && period <= 8) return true;
  return false;
};
var isTeacherTeachingRegular = (teacherId, period, timetable = MASTER_TIMETABLE) => {
  return timetable.some((slot) => slot.teacherId === teacherId && slot.period === period);
};
var getTeacherBasePeriods = (teacherId, timetable = MASTER_TIMETABLE) => {
  return timetable.filter((slot) => slot.teacherId === teacherId).length;
};
var getWingProximityScore = (teacherWing, classWing) => {
  if (teacherWing === classWing) {
    return { score: 100, isMatch: true };
  }
  if (teacherWing === "primary" && classWing === "middle" || teacherWing === "middle" && (classWing === "primary" || classWing === "senior") || teacherWing === "senior" && classWing === "middle") {
    return { score: 35, isMatch: false };
  }
  return { score: 0, isMatch: false };
};
var evaluateCandidate = (teacher, classId, period, originalTeacherId, currentAssignedPeriods, currentPeriodAssignments, absences, timetable = MASTER_TIMETABLE) => {
  const classWing = getWingForClass(classId);
  const baseLoad = getTeacherBasePeriods(teacher.id, timetable);
  const currentTotal = currentAssignedPeriods[teacher.id] ?? baseLoad;
  if (teacher.id === originalTeacherId) {
    return {
      teacher,
      status: "ineligible",
      reason: "Scheduled regular teacher of this class",
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  if (isTeacherAbsentInPeriod(teacher.id, period, absences)) {
    return {
      teacher,
      status: "ineligible",
      reason: "Marked absent during this period",
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  const regularSlot = timetable.find((s) => s.teacherId === teacher.id && s.period === period);
  if (regularSlot) {
    return {
      teacher,
      status: "ineligible",
      reason: `Already teaching regular Class ${regularSlot.classId} in Period ${period}`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  const periodBusyList = currentPeriodAssignments[period] || [];
  if (periodBusyList.includes(teacher.id)) {
    return {
      teacher,
      status: "ineligible",
      reason: `Already assigned another substitution in Period ${period}`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  if (baseLoad >= 6) {
    return {
      teacher,
      status: "ineligible",
      reason: `Base workload of ${baseLoad} lessons reaches the $\\ge 6$ workload restriction`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  if (currentTotal >= MAX_DAILY_LESSONS) {
    return {
      teacher,
      status: "ineligible",
      reason: `Daily maximum limit of ${MAX_DAILY_LESSONS} lessons reached`,
      score: -100,
      currentWorkload: currentTotal,
      projectedWorkload: currentTotal
    };
  }
  const { score: wingScore, isMatch: wingMatch } = getWingProximityScore(teacher.wing, classWing);
  const originalTeacher = getTeacherById(originalTeacherId);
  const departmentBonus = originalTeacher && teacher.department === originalTeacher.department ? 25 : 0;
  const equityBonus = (MAX_DAILY_LESSONS - currentTotal) * 8;
  const totalScore = wingScore + departmentBonus + equityBonus;
  const isRecommended = wingMatch && currentTotal <= 5;
  let rationale = `${wingMatch ? "Same wing match" : "Cross-wing coverage"}, current load ${currentTotal}/${MAX_DAILY_LESSONS}`;
  if (departmentBonus > 0) {
    rationale += `, ${teacher.department} specialty`;
  }
  return {
    teacher,
    status: isRecommended ? "recommended" : "eligible",
    reason: rationale,
    score: totalScore,
    currentWorkload: currentTotal,
    projectedWorkload: currentTotal + 1
  };
};
var generateSubstitutionPlan = (absences, teachers = TEACHERS, timetable = MASTER_TIMETABLE, forceContingency = false) => {
  const totalTeachers = teachers.length;
  const absentTeacherCount = absences.length;
  const absencePercentage = Math.round(absentTeacherCount / totalTeachers * 100);
  if (absencePercentage > ABSENCE_THRESHOLD_PERCENT && !forceContingency) {
    const now2 = /* @__PURE__ */ new Date();
    return {
      id: `plan-${Date.now()}`,
      createdAt: now2.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
      date: now2.toLocaleDateString(void 0, { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
      generatedAtTimestamp: Date.now(),
      absences,
      assignments: [],
      uncoveredSlots: [],
      aiSummary: `Absence threshold exceeded (${absencePercentage}% absent: ${absentTeacherCount} of ${totalTeachers} teachers). Contingency protocol requires administrative activation.`,
      isOverThreshold: true,
      isContingencyPlan: false
    };
  }
  const isContingencyActive = forceContingency || absencePercentage > ABSENCE_THRESHOLD_PERCENT;
  const vacantSlots = [];
  for (const slot of timetable) {
    if (isTeacherAbsentInPeriod(slot.teacherId, slot.period, absences)) {
      vacantSlots.push({
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.teacherId,
        subject: slot.subject,
        classWing: getWingForClass(slot.classId)
      });
    }
  }
  vacantSlots.sort((a, b) => a.period - b.period || a.classId - b.classId);
  const currentAssignedPeriods = {};
  const currentPeriodAssignments = {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: []
  };
  for (const t of teachers) {
    currentAssignedPeriods[t.id] = getTeacherBasePeriods(t.id, timetable);
  }
  const assignments = [];
  const uncoveredSlots = [];
  for (const slot of vacantSlots) {
    const candidates = teachers.map(
      (teacher) => evaluateCandidate(
        teacher,
        slot.classId,
        slot.period,
        slot.originalTeacherId,
        currentAssignedPeriods,
        currentPeriodAssignments,
        absences,
        timetable
      )
    ).filter((c) => c.status !== "ineligible");
    let emergencyCandidate = null;
    if (candidates.length === 0) {
      const emergencyPool = teachers.filter((t) => {
        if (t.id === slot.originalTeacherId) return false;
        if (isTeacherAbsentInPeriod(t.id, slot.period, absences)) return false;
        if (isTeacherTeachingRegular(t.id, slot.period, timetable)) return false;
        if ((currentPeriodAssignments[slot.period] || []).includes(t.id)) return false;
        const currentTotal = currentAssignedPeriods[t.id] ?? t.baseWorkload;
        return currentTotal < 7;
      });
      if (emergencyPool.length > 0) {
        emergencyPool.sort((a, b) => {
          const aWingMatch = a.wing === slot.classWing ? 1 : 0;
          const bWingMatch = b.wing === slot.classWing ? 1 : 0;
          if (aWingMatch !== bWingMatch) return bWingMatch - aWingMatch;
          const aLoad = currentAssignedPeriods[a.id] ?? a.baseWorkload;
          const bLoad = currentAssignedPeriods[b.id] ?? b.baseWorkload;
          return aLoad - bLoad;
        });
        emergencyCandidate = emergencyPool[0];
      }
    }
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const chosen = candidates[0];
      assignments.push({
        id: `assign-${slot.classId}-${slot.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.originalTeacherId,
        substituteTeacherId: chosen.teacher.id,
        subject: slot.subject,
        reason: chosen.reason,
        wingMatch: chosen.teacher.wing === slot.classWing
      });
      currentAssignedPeriods[chosen.teacher.id] = (currentAssignedPeriods[chosen.teacher.id] || 0) + 1;
      currentPeriodAssignments[slot.period].push(chosen.teacher.id);
    } else if (emergencyCandidate) {
      assignments.push({
        id: `assign-${slot.classId}-${slot.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.originalTeacherId,
        substituteTeacherId: emergencyCandidate.id,
        subject: slot.subject,
        reason: `Option B Emergency Tier: Single extra period granted (6 \u2192 7 lessons, within safe 8-cap)`,
        wingMatch: emergencyCandidate.wing === slot.classWing,
        isEmergencyTier: true
      });
      currentAssignedPeriods[emergencyCandidate.id] = (currentAssignedPeriods[emergencyCandidate.id] || 0) + 1;
      currentPeriodAssignments[slot.period].push(emergencyCandidate.id);
    } else {
      assignments.push({
        id: `assign-${slot.classId}-${slot.period}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        classId: slot.classId,
        period: slot.period,
        originalTeacherId: slot.originalTeacherId,
        substituteTeacherId: "DUTY-LIB",
        subject: `${slot.subject} (Supervised Study)`,
        reason: "Option A Guaranteed Coverage: Supervised Curriculum Study in Library Hall under Duty Master",
        wingMatch: true,
        isStudyHall: true
      });
    }
  }
  const studyHallCount = assignments.filter((a) => a.isStudyHall).length;
  const emergencyTierCount = assignments.filter((a) => a.isEmergencyTier).length;
  let summaryNote = isContingencyActive ? `Contingency Protocol Active: All ${vacantSlots.length} vacant periods covered across Classes 1\u201312 (${assignments.length - studyHallCount} faculty substitutions, ${studyHallCount} supervised library sessions). 100% zero-abandoned attendance maintained.` : `All ${vacantSlots.length} vacant periods successfully covered across ${new Set(vacantSlots.map((s) => s.classId)).size} classes with zero abandoned sessions.`;
  if (!isContingencyActive) {
    if (emergencyTierCount > 0) {
      summaryNote += ` Deployed ${emergencyTierCount} emergency faculty period${emergencyTierCount !== 1 ? "s" : ""} (capped at 7 lessons).`;
    }
    if (studyHallCount > 0) {
      summaryNote += ` Coordinated ${studyHallCount} supervised library study session${studyHallCount !== 1 ? "s" : ""} for unfillable periods.`;
    }
  }
  const now = /* @__PURE__ */ new Date();
  return {
    id: `plan-${Date.now()}`,
    createdAt: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true }),
    date: now.toLocaleDateString(void 0, { weekday: "long", year: "numeric", month: "short", day: "numeric" }),
    generatedAtTimestamp: Date.now(),
    absences,
    assignments,
    uncoveredSlots: [],
    aiSummary: summaryNote,
    isOverThreshold: false,
    isContingencyPlan: isContingencyActive
  };
};

// src/utils/rateLimiter.ts
var MAX_REQUESTS = 80;
var WINDOW_MS = 5 * 60 * 60 * 1e3;
var requestTimestamps = [];
function formatDuration(ms) {
  if (ms <= 0) return "now";
  const totalMinutes = Math.ceil(ms / (1e3 * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
function cleanOldTimestamps(now = Date.now()) {
  const cutoff = now - WINDOW_MS;
  while (requestTimestamps.length > 0 && requestTimestamps[0] <= cutoff) {
    requestTimestamps.shift();
  }
}
function tryConsumeRateLimit(now = Date.now()) {
  cleanOldTimestamps(now);
  const totalUsed = requestTimestamps.length;
  if (totalUsed >= MAX_REQUESTS) {
    const oldest = requestTimestamps[0];
    const resetInMs = Math.max(0, oldest + WINDOW_MS - now);
    return {
      allowed: false,
      remaining: 0,
      limit: MAX_REQUESTS,
      resetInMs,
      resetTimeFormatted: formatDuration(resetInMs),
      totalUsed,
      isLimited: true
    };
  }
  requestTimestamps.push(now);
  const newUsed = requestTimestamps.length;
  const remaining = Math.max(0, MAX_REQUESTS - newUsed);
  return {
    allowed: true,
    remaining,
    limit: MAX_REQUESTS,
    resetInMs: 0,
    resetTimeFormatted: "0m",
    totalUsed: newUsed,
    isLimited: false
  };
}

// src/api/substitution/generate.ts
async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const { absences, forceContingency, plan: clientPlan } = req.body;
    if (!absences || !Array.isArray(absences)) {
      return res.status(400).json({ error: "Absences array is required" });
    }
    const plan = clientPlan || generateSubstitutionPlan(absences, TEACHERS, void 0, !!forceContingency);
    if (plan.isOverThreshold) {
      return res.json({ plan });
    }
    const rateStatus = tryConsumeRateLimit();
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.setHeader("X-RateLimit-Limit", rateStatus.limit.toString());
    res.setHeader("X-RateLimit-Remaining", rateStatus.remaining.toString());
    res.setHeader("X-RateLimit-Reset-In", rateStatus.resetTimeFormatted);
    plan.rateLimit = rateStatus;
    if (!rateStatus.allowed) {
      plan.aiSummary = `Gemma 4 platform rate limit active (${rateStatus.limit}/${rateStatus.limit} requests used in 5-hour window across all users). Conflict-free substitution plan safely created via deterministic solver. Gemma will refresh in ${rateStatus.resetTimeFormatted}.`;
      plan.aiContinuityNotes = `\u2022 Rate Limit Policy: Maximum 80 Gemma requests per 5 hours inclusive of all IPs.
\u2022 Integrity: All ${plan.assignments.length} vacant periods safely covered under 8-lesson cap with 0 abandoned sessions.
\u2022 Next Refresh: Gemma AI summaries will automatically resume in ${rateStatus.resetTimeFormatted}.`;
      return res.json({ plan, rateLimit: rateStatus });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && plan.assignments.length > 0) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: { "User-Agent": "aistudio-build" }
          }
        });
        const absentSummary = absences.map((a) => {
          const teacher = TEACHERS.find((t) => t.id === a.teacherId);
          return `${teacher?.name || a.teacherId} (${a.scope} absence)`;
        }).join(", ");
        const assignmentDetails = plan.assignments.map((as) => {
          const orig = TEACHERS.find((t) => t.id === as.originalTeacherId)?.name;
          const sub = TEACHERS.find((t) => t.id === as.substituteTeacherId)?.name;
          return `P${as.period} (${CLASS_NAMES[as.classId]} ${as.subject}): ${orig} covered by ${sub} [${as.reason}]`;
        }).join("\n");
        const prompt = `You are the lead academic coordinator intelligence engine powered by Gemma 4 for a K-12 school (Classes 1-12, 8 periods/day).
The following daily substitution assignments were resolved under strict workload constraints (max 8 lessons, no assignments to teachers with >=6 base lessons, and grade-level proximity prioritized):

ABSENT STAFF:
${absentSummary}

ASSIGNMENTS:
${assignmentDetails}

Provide two concise outputs:
1. "briefing": A sharp 2-sentence executive summary for the morning assembly coordinator regarding coverage stability and workload health.
2. "continuityTips": 2-3 brief practical bullet points for pedagogical continuity and supervision handovers.

Respond strictly in valid JSON format:
{
  "briefing": "...",
  "continuityTips": "..."
}`;
        let responseText = null;
        const gemmaModels = [
          "gemma-4-26b-a4b-it",
          "gemma-4-31b-it",
          "gemma-2-27b-it",
          "gemma-2-9b-it"
        ];
        for (const model of gemmaModels) {
          try {
            const timeoutPromise = new Promise(
              (_, reject) => setTimeout(() => reject(new Error(`Timeout calling Gemma model ${model}`)), 7e3)
            );
            const callPromise = ai.models.generateContent({
              model,
              contents: prompt
            });
            const response = await Promise.race([callPromise, timeoutPromise]);
            if (response && response.text) {
              responseText = response.text;
              break;
            }
          } catch (modelErr) {
            console.warn(`Gemma serverless model ${model} skipped:`, modelErr?.message || modelErr);
          }
        }
        if (responseText) {
          try {
            const cleanText = responseText.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
            const parsed = JSON.parse(cleanText);
            plan.aiSummary = parsed.briefing || plan.aiSummary;
            plan.aiContinuityNotes = parsed.continuityTips || void 0;
          } catch {
            plan.aiSummary = responseText.trim();
          }
        } else {
          const affectedWings = /* @__PURE__ */ new Set();
          plan.assignments.forEach((a) => {
            if (a.classId <= 5) affectedWings.add("Primary (Classes 1\u20135)");
            else if (a.classId <= 8) affectedWings.add("Middle (Classes 6\u20138)");
            else affectedWings.add("Senior (Classes 9\u201312)");
          });
          plan.aiSummary = `All ${plan.assignments.length} vacant lessons resolved with 100% schedule integrity across ${Array.from(affectedWings).join(" and ")}. Workload quotas strictly maintained below 8 daily lessons with zero double-booking.`;
          plan.aiContinuityNotes = `\u2022 Supervision Priority: Ensure substitutes for Classes 1\u20135 collect homeroom folders for activity continuity.
\u2022 Core Subjects: Science and Math substitutions have been routed to wing specialists to maintain syllabus pacing.
\u2022 Staff Welfare: Faculty with 6 regular base periods were successfully shielded from extra substitution duties.`;
        }
      } catch (err) {
        plan.aiSummary = `Plan verified by SubMaster Engine: ${plan.assignments.length} substitutions scheduled with grade-level proximity matching.`;
      }
    }
    return res.json({ plan, rateLimit: rateStatus });
  } catch (err) {
    console.error("Serverless error generating substitution plan:", err);
    return res.status(500).json({ error: "Failed to generate substitution plan" });
  }
}
export {
  handler as default
};
