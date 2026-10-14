import React, { useState } from 'react';
import { Calendar, Search, Filter, User, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';
import { TEACHERS, MASTER_TIMETABLE, CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';
import { SubstitutionPlan } from '../types';
import { MAX_DAILY_LESSONS } from '../utils/solver';

interface MasterTimetableTabProps {
  activePlan: SubstitutionPlan | null;
}

export const MasterTimetableTab: React.FC<MasterTimetableTabProps> = ({ activePlan }) => {
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [highlightTeacherId, setHighlightTeacherId] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'grid' | 'workloads'>('grid');

  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const classIds = Array.from({ length: 12 }, (_, i) => i + 1);

  // Filtered classes
  const displayedClassIds = selectedClass === 'all' ? classIds : [selectedClass];

  // Calculate teacher workloads considering active plan
  const teacherWorkloads = TEACHERS.map(teacher => {
    const basePeriods = MASTER_TIMETABLE.filter(s => s.teacherId === teacher.id).length;
    const substitutedPeriods = activePlan
      ? activePlan.assignments.filter(a => a.substituteTeacherId === teacher.id).length
      : 0;
    const totalPeriods = basePeriods + substitutedPeriods;
    const isAbsent = activePlan ? activePlan.absences.some(a => a.teacherId === teacher.id) : false;

    return {
      teacher,
      basePeriods,
      substitutedPeriods,
      totalPeriods,
      isAbsent,
      isExcludedBySixRule: teacher.baseWorkload >= 6,
    };
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            School Master Timetable & Workload Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Complete schedule for Classes 1–12 (8 periods per day) and live teacher workload compliance.
          </p>
        </div>

        {/* View Switcher: Matrix Grid vs Teacher Workloads */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setActiveSubTab('grid')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'grid'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Timetable Matrix
          </button>
          <button
            onClick={() => setActiveSubTab('workloads')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-md transition-colors ${
              activeSubTab === 'workloads'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Workload Compliance
          </button>
        </div>
      </div>

      {activeSubTab === 'grid' ? (
        <div className="space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-wrap items-center gap-4 text-xs">
            {/* Class filter */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Filter Class:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="min-h-[38px] px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">All Classes (1 to 12)</option>
                {classIds.map(c => (
                  <option key={c} value={c}>{CLASS_NAMES[c]}</option>
                ))}
              </select>
            </div>

            {/* Teacher highlight */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700">Highlight Faculty:</span>
              <select
                value={highlightTeacherId}
                onChange={e => setHighlightTeacherId(e.target.value)}
                className="min-h-[38px] px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 focus:outline-hidden focus:border-blue-500"
              >
                <option value="all">Show All Faculty</option>
                {TEACHERS.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.wing.toUpperCase()})</option>
                ))}
              </select>
            </div>

            <div className="ml-auto text-slate-500 text-[11px] font-mono">
              8 Periods · 45 mins each
            </div>
          </div>

          {/* Timetable Table Grid */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="p-3 sticky left-0 bg-slate-100 z-10 w-28 border-r border-slate-200">
                    Class
                  </th>
                  {periods.map(p => (
                    <th key={p} className="p-3 min-w-[130px] border-r border-slate-200 last:border-r-0">
                      <div className="font-mono">P{p}</div>
                      <div className="text-[10px] font-normal text-slate-500">{PERIOD_TIMES[p].split(' - ')[0]}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedClassIds.map(classId => (
                  <tr key={classId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-900 sticky left-0 bg-white border-r border-slate-200 shadow-xs">
                      <div>{CLASS_NAMES[classId]}</div>
                      <span className="text-[10px] font-medium text-slate-400">
                        {classId <= 5 ? 'Primary' : classId <= 8 ? 'Middle' : 'Senior'}
                      </span>
                    </td>
                    {periods.map(period => {
                      const slot = MASTER_TIMETABLE.find(
                        s => s.classId === classId && s.period === period
                      );
                      const teacher = slot ? getTeacherById(slot.teacherId) : null;
                      const isHighlighted = highlightTeacherId !== 'all' && slot?.teacherId === highlightTeacherId;

                      // Check if there is an active substitution for this slot
                      const activeSub = activePlan?.assignments.find(
                        a => a.classId === classId && a.period === period
                      );
                      const subTeacher = activeSub ? getTeacherById(activeSub.substituteTeacherId) : null;

                      return (
                        <td
                          key={period}
                          className={`p-2.5 border-r border-slate-100 last:border-r-0 align-top transition-colors ${
                            isHighlighted
                              ? 'bg-blue-100/70'
                              : activeSub
                              ? 'bg-amber-50/50'
                              : ''
                          }`}
                        >
                          {slot ? (
                            <div className="space-y-1">
                              <span className="font-semibold text-slate-900 block truncate">
                                {slot.subject}
                              </span>
                              
                              {activeSub ? (
                                <div>
                                  <span className="line-through text-slate-400 text-[11px] block truncate">
                                    {teacher?.name}
                                  </span>
                                  <span className="text-blue-700 font-bold text-[11px] block truncate">
                                    ↳ {subTeacher?.name}
                                  </span>
                                </div>
                              ) : (
                                <span className={`text-[11px] block truncate ${
                                  isHighlighted ? 'font-bold text-blue-900' : 'text-slate-600'
                                }`}>
                                  {teacher?.name}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      ) : (
        // Teacher Workload Compliance Table
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Faculty Workload Distribution</h3>
              <p className="text-xs text-slate-500">
                Enforcing rules: Max 8 daily lessons. Teachers with 6 base lessons receive no substitutions.
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {TEACHERS.length} Faculty Members
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-800 font-bold">
                  <th className="p-3">Faculty Name</th>
                  <th className="p-3">Department & Wing</th>
                  <th className="p-3 text-center font-mono">Base Lessons</th>
                  <th className="p-3 text-center font-mono">Substitutions</th>
                  <th className="p-3 text-center font-mono">Total Load</th>
                  <th className="p-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teacherWorkloads.map(w => {
                  return (
                    <tr key={w.teacher.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        {w.teacher.name}
                        {w.isAbsent && (
                          <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-sm bg-red-100 text-red-800 font-medium">
                            Absent Today
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-slate-600">
                        {w.teacher.department} · <span className="uppercase text-[11px] font-medium">{w.teacher.wing}</span>
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums text-slate-700">
                        {w.basePeriods}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums text-blue-700 font-semibold">
                        {w.substitutedPeriods > 0 ? `+${w.substitutedPeriods}` : '0'}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums font-bold text-slate-900">
                        {w.totalPeriods} / {MAX_DAILY_LESSONS}
                      </td>
                      <td className="p-3">
                        {w.isAbsent ? (
                          <span className="text-red-700 font-medium">
                            On Leave
                          </span>
                        ) : w.isExcludedBySixRule ? (
                          <span className="text-amber-800 font-medium">
                            Base 6 lessons · Excluded from subs
                          </span>
                        ) : w.totalPeriods >= MAX_DAILY_LESSONS ? (
                          <span className="text-red-700 font-medium">
                            Max daily capacity reached
                          </span>
                        ) : (
                          <span className="text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Eligible ({MAX_DAILY_LESSONS - w.totalPeriods} free periods)
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
