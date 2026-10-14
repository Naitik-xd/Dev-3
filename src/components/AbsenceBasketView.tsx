import React, { useState } from 'react';
import { Search, Plus, Trash2, Clock, Sparkles, Check, Info, AlertCircle, BookOpen } from 'lucide-react';
import { Teacher, AbsenceRecord, AbsenceScope } from '../types';
import { TEACHERS, MASTER_TIMETABLE, CLASS_NAMES } from '../data/mockData';
import { AbsenceGauge } from './AbsenceGauge';
import { ABSENCE_THRESHOLD_PERCENT } from '../utils/solver';

interface AbsenceBasketViewProps {
  absences: AbsenceRecord[];
  onAddAbsence: (teacherId: string, scope?: AbsenceScope) => void;
  onRemoveAbsence: (teacherId: string) => void;
  onUpdateScope: (teacherId: string, scope: AbsenceScope) => void;
  onClearAll: () => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

export const AbsenceBasketView: React.FC<AbsenceBasketViewProps> = ({
  absences,
  onAddAbsence,
  onRemoveAbsence,
  onUpdateScope,
  onClearAll,
  onGeneratePlan,
  isGenerating,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWing, setSelectedWing] = useState<'all' | 'primary' | 'middle' | 'senior'>('all');

  const absentTeacherIds = new Set(absences.map(a => a.teacherId));
  const isOverThreshold = (absences.length / TEACHERS.length) * 100 > ABSENCE_THRESHOLD_PERCENT;

  // Filter teachers by search and wing
  const filteredTeachers = TEACHERS.filter(teacher => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.subjects.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesWing = selectedWing === 'all' || teacher.wing === selectedWing;

    return matchesSearch && matchesWing;
  });

  // Calculate affected slots for an absent teacher
  const getImpactedSlots = (teacherId: string, scope: AbsenceScope) => {
    return MASTER_TIMETABLE.filter(slot => {
      if (slot.teacherId !== teacherId) return false;
      if (scope === 'full') return true;
      if (scope === 'morning' && slot.period <= 4) return true;
      if (scope === 'afternoon' && slot.period >= 5) return true;
      return false;
    });
  };

  // Pre-configured quick demo presets
  const applyPreset = (preset: 'two' | 'morning' | 'heavy' | 'threshold') => {
    onClearAll();
    if (preset === 'two') {
      // 2 teachers absent: T01 (Primary English) & T13 (Senior Physics)
      onAddAbsence('T01', 'full');
      onAddAbsence('T13', 'full');
    } else if (preset === 'morning') {
      // 3 teachers absent for morning periods 1-4
      onAddAbsence('T02', 'morning');
      onAddAbsence('T08', 'morning');
      onAddAbsence('T14', 'morning');
    } else if (preset === 'heavy') {
      // 5 teachers absent across wings
      onAddAbsence('T01', 'full');
      onAddAbsence('T03', 'afternoon');
      onAddAbsence('T07', 'full');
      onAddAbsence('T10', 'morning');
      onAddAbsence('T16', 'full');
    } else if (preset === 'threshold') {
      // 10 teachers absent (exceeds 50% limit test)
      ['T01', 'T02', 'T03', 'T04', 'T05', 'T06', 'T07', 'T08', 'T09', 'T10'].forEach(id => {
        onAddAbsence(id, 'full');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Absence Gauge */}
      <AbsenceGauge absentCount={absences.length} totalTeachers={TEACHERS.length} />

      {/* Preset Test Scenarios */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Quick Test Scenarios:
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('two')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              2 Teachers (Full Day)
            </button>
            <button
              onClick={() => applyPreset('morning')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              3 Teachers (Morning P1–4)
            </button>
            <button
              onClick={() => applyPreset('heavy')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              5 Teachers (Multi-Wing)
            </button>
            <button
              onClick={() => applyPreset('threshold')}
              className="min-h-[38px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 transition-colors"
            >
              10 Teachers (&gt;50% Safety Test)
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Teacher Search & Directory (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Faculty Roster</h3>
                <p className="text-xs text-slate-500">
                  Select absent teachers to add them to today's substitution basket.
                </p>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {filteredTeachers.length} of {TEACHERS.length} teachers
              </span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search teacher by name, subject, or department..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Wing Segmented Filter (Responsive grid - no horizontal scroll) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg mb-4">
              <button
                onClick={() => setSelectedWing('all')}
                className={`min-h-[38px] px-2 sm:px-3 text-xs font-semibold rounded-md transition-colors text-center ${
                  selectedWing === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Wings
              </button>
              <button
                onClick={() => setSelectedWing('primary')}
                className={`min-h-[38px] px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedWing === 'primary'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Primary (1–5)
              </button>
              <button
                onClick={() => setSelectedWing('middle')}
                className={`min-h-[38px] px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedWing === 'middle'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Middle (6–8)
              </button>
              <button
                onClick={() => setSelectedWing('senior')}
                className={`min-h-[38px] px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                  selectedWing === 'senior'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Senior (9–12)
              </button>
            </div>

            {/* Teacher List */}
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {filteredTeachers.map(teacher => {
                const isAbsent = absentTeacherIds.has(teacher.id);
                const hasMaxBaseLoad = teacher.baseWorkload >= 6;

                return (
                  <div
                    key={teacher.id}
                    className={`p-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                      isAbsent
                        ? 'bg-red-50/60 border-red-200'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 truncate">
                          {teacher.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {teacher.wing.toUpperCase()} WING
                        </span>
                        <span className="text-[11px] font-mono tabular-nums text-slate-500">
                          · {teacher.baseWorkload}/8 Lessons
                        </span>
                        {hasMaxBaseLoad && (
                          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-sm">
                            Max Base (6 Lessons)
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 truncate">
                        {teacher.department} · {teacher.subjects.join(', ')}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isAbsent ? (
                        <button
                          onClick={() => onRemoveAbsence(teacher.id)}
                          className="min-h-[44px] px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 hover:bg-red-200 text-red-800 transition-colors flex items-center gap-1.5"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => onAddAbsence(teacher.id, 'full')}
                          className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Mark Absent</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {filteredTeachers.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No teachers match the current search or wing filter.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Active Absence Basket (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs sticky top-20">
            
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Absence Basket
                </h3>
                <span className="text-xs text-slate-500">
                  {absences.length} teacher{absences.length !== 1 ? 's' : ''} queued
                </span>
              </div>
              {absences.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="min-h-[38px] px-2.5 py-1 text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Empty state */}
            {absences.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">The basket is empty</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1">
                    Mark absent teachers from the left directory or choose a Quick Test Scenario above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mt-3 max-h-[460px] overflow-y-auto pr-1">
                {absences.map(record => {
                  const teacher = TEACHERS.find(t => t.id === record.teacherId);
                  if (!teacher) return null;
                  const impacted = getImpactedSlots(teacher.id, record.scope);

                  return (
                    <div
                      key={record.teacherId}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <span className="font-semibold text-xs text-slate-900 block">
                            {teacher.name}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {teacher.department} · {teacher.wing.toUpperCase()} Wing
                          </span>
                        </div>
                        <button
                          onClick={() => onRemoveAbsence(teacher.id)}
                          className="min-h-[38px] min-w-[38px] text-slate-400 hover:text-red-600 flex items-center justify-center rounded-md"
                          title="Remove from basket"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Absence Scope Selector: Full Day, Morning (1-4), Afternoon (5-8) */}
                      <div>
                        <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                          Absence Duration:
                        </span>
                        <div className="grid grid-cols-3 gap-1">
                          <button
                            onClick={() => onUpdateScope(teacher.id, 'full')}
                            className={`min-h-[38px] px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              record.scope === 'full'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Full Day (P1–8)
                          </button>
                          <button
                            onClick={() => onUpdateScope(teacher.id, 'morning')}
                            className={`min-h-[38px] px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              record.scope === 'morning'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Morning (P1–4)
                          </button>
                          <button
                            onClick={() => onUpdateScope(teacher.id, 'afternoon')}
                            className={`min-h-[38px] px-2 py-1 text-[11px] font-semibold rounded-md transition-colors ${
                              record.scope === 'afternoon'
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            Afternoon (P5–8)
                          </button>
                        </div>
                      </div>

                      {/* Vacant classes preview */}
                      <div className="text-[11px] text-slate-600 bg-white p-2 rounded-md border border-slate-100">
                        <span className="font-semibold text-slate-800">Leaves vacant: </span>
                        {impacted.length === 0 ? (
                          <span className="text-slate-400">No scheduled lessons in this scope</span>
                        ) : (
                          <span>
                            {impacted.map((s, idx) => (
                              <span key={idx}>
                                {idx > 0 && ', '}
                                P{s.period} ({CLASS_NAMES[s.classId]})
                              </span>
                            ))}
                            {' '}({impacted.length} period{impacted.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Action Bar */}
            {absences.length > 0 && (
              <div className="pt-4 mt-3 border-t border-slate-100 space-y-2">
                <button
                  onClick={onGeneratePlan}
                  disabled={isGenerating || isOverThreshold}
                  className={`w-full min-h-[48px] rounded-lg text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isOverThreshold
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : isGenerating
                      ? 'bg-blue-400 cursor-wait'
                      : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98]'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      <span>Coordinating Plan with Gemma 4...</span>
                    </>
                  ) : isOverThreshold ? (
                    <>
                      <AlertCircle className="w-4 h-4 text-slate-500" />
                      <span>Threshold Exceeded (&gt;50%)</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Substitution Plan</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Workload rules: Max 8 lessons/day. Staff with $\ge$6 lessons excluded from substitutions.
                </p>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
