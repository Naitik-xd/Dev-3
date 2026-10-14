import React, { useState } from 'react';
import { X, Check, AlertCircle, Sparkles, UserCheck, ShieldAlert, ArrowRight } from 'lucide-react';
import { SubstitutionAssignment, SubstitutionPlan } from '../types';
import { TEACHERS, CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';
import { getCandidateTeachersForSlot } from '../utils/solver';

interface SlotSwapModalProps {
  assignment: SubstitutionAssignment;
  plan: SubstitutionPlan;
  onClose: () => void;
  onSwapTeacher: (assignmentId: string, newSubstituteTeacherId: string, reason: string) => void;
}

export const SlotSwapModal: React.FC<SlotSwapModalProps> = ({
  assignment,
  plan,
  onClose,
  onSwapTeacher,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'recommended' | 'eligible'>('all');

  const originalTeacher = getTeacherById(assignment.originalTeacherId);
  const currentSubstitute = getTeacherById(assignment.substituteTeacherId);

  // Evaluate all teachers for this slot
  const candidates = getCandidateTeachersForSlot(
    assignment.classId,
    assignment.period,
    assignment.originalTeacherId,
    plan.assignments,
    plan.absences
  );

  const filteredCandidates = candidates.filter(c => {
    if (filterType === 'recommended') return c.status === 'recommended';
    if (filterType === 'eligible') return c.status === 'eligible' || c.status === 'recommended';
    return true;
  });

  const handleSelectCandidate = (candidateTeacherId: string, rationale: string) => {
    onSwapTeacher(assignment.id, candidateTeacherId, `Manual Override: ${rationale}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Reassign Substitute</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-semibold">
                {CLASS_NAMES[assignment.classId]} · Period {assignment.period}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {PERIOD_TIMES[assignment.period]} · Subject: {assignment.subject}
            </p>
          </div>
          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-700 rounded-lg flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Strip */}
        <div className="px-5 py-3 bg-blue-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Original Teacher:</span>
            <span className="font-semibold text-slate-800 line-through">
              {originalTeacher?.name || assignment.originalTeacherId}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-900">
            <span className="text-slate-500 font-medium">Current Substitute:</span>
            <span className="font-bold text-blue-700">
              {currentSubstitute?.name || assignment.substituteTeacherId}
            </span>
          </div>
        </div>

        {/* Filter buttons */}
        <div className="px-5 pt-3 pb-2 flex items-center gap-1.5 border-b border-slate-100">
          <button
            onClick={() => setFilterType('all')}
            className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Faculty ({candidates.length})
          </button>
          <button
            onClick={() => setFilterType('recommended')}
            className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'recommended'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recommended Only ({candidates.filter(c => c.status === 'recommended').length})
          </button>
          <button
            onClick={() => setFilterType('eligible')}
            className={`min-h-[38px] px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              filterType === 'eligible'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Eligible ({candidates.filter(c => c.status !== 'ineligible').length})
          </button>
        </div>

        {/* Candidate List */}
        <div className="p-5 overflow-y-auto space-y-2 flex-1">
          {filteredCandidates.map(c => {
            const isCurrentlyAssigned = c.teacher.id === assignment.substituteTeacherId;
            const isIneligible = c.status === 'ineligible';

            return (
              <div
                key={c.teacher.id}
                className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isCurrentlyAssigned
                    ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                    : isIneligible
                    ? 'border-slate-200 bg-slate-50/70 opacity-60'
                    : c.status === 'recommended'
                    ? 'border-emerald-200 bg-emerald-50/30 hover:border-emerald-400'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">
                      {c.teacher.name}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {c.teacher.wing.toUpperCase()} WING
                    </span>
                    {c.status === 'recommended' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-emerald-600" />
                        RECOMMENDED
                      </span>
                    )}
                    {isCurrentlyAssigned && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-800">
                        CURRENT ASSIGNMENT
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 mt-1 flex items-center gap-3 flex-wrap">
                    <span>{c.teacher.department}</span>
                    <span className="font-mono tabular-nums text-slate-500">
                      Workload: {c.currentWorkload} → {c.projectedWorkload}/8 lessons
                    </span>
                  </div>

                  <div className="text-xs mt-1.5">
                    {isIneligible ? (
                      <span className="text-red-700 flex items-center gap-1 font-medium">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        {c.reason}
                      </span>
                    ) : (
                      <span className="text-slate-600">
                        {c.reason}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 self-end sm:self-center">
                  {isCurrentlyAssigned ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 px-3 py-1.5 bg-blue-100 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                      Assigned
                    </span>
                  ) : isIneligible ? (
                    <button
                      disabled
                      className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 text-slate-400 cursor-not-allowed"
                    >
                      Conflict
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectCandidate(c.teacher.id, c.reason)}
                      className="min-h-[44px] px-4 py-1.5 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Assign</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Compliance: Hard 8-lesson max & wing proximity preference enforced.
          </span>
          <button
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
