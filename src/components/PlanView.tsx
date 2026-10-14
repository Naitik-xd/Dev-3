import React, { useState } from 'react';
import { 
  ClipboardCheck, 
  Printer, 
  MessageSquare, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Edit3, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft,
  Layers,
  ArrowRight
} from 'lucide-react';
import { SubstitutionPlan, SubstitutionAssignment } from '../types';
import { TEACHERS, CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';
import { SlotSwapModal } from './SlotSwapModal';
import { WhatsAppModal } from './WhatsAppModal';
import { PrintableSheet } from './PrintableSheet';

interface PlanViewProps {
  plan: SubstitutionPlan | null;
  onNavigateToAbsences: () => void;
  onSwapTeacher: (assignmentId: string, newSubstituteTeacherId: string, reason: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
}

export const PlanView: React.FC<PlanViewProps> = ({
  plan,
  onNavigateToAbsences,
  onSwapTeacher,
  onRegenerate,
  isGenerating,
}) => {
  const [viewGrouping, setViewGrouping] = useState<'period' | 'class'>('period');
  const [activeSwapAssignment, setActiveSwapAssignment] = useState<SubstitutionAssignment | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  if (!plan) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 my-8 shadow-xs">
        <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
          <ClipboardCheck className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">No Substitution Plan Generated Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Mark absent faculty in the Absence Basket, then click "Generate Substitution Plan" to compute conflict-free allocations.
          </p>
        </div>
        <button
          onClick={onNavigateToAbsences}
          className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all inline-flex items-center gap-2 shadow-xs"
        >
          <span>Go to Absence Basket</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (plan.isOverThreshold) {
    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-2xl mx-auto space-y-4 my-8 shadow-xs text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-red-900">Plan Generation Locked: Absence Threshold Exceeded</h3>
          <p className="text-xs text-red-700 mt-2 max-w-md mx-auto leading-relaxed">
            Over 50% of school faculty ({plan.absences.length} of {TEACHERS.length}) have been marked absent. 
            Under institutional policy, automatic one-to-one substitutions cannot proceed safely.
          </p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl border border-red-200 text-xs text-left text-red-800 space-y-1">
          <p className="font-bold">Required Administrative Protocol:</p>
          <ul className="list-disc list-inside space-y-0.5 text-red-700">
            <li>Combine primary wings for joint auditorium audio-visual sessions.</li>
            <li>Convert Middle & Senior periods to supervised self-study in the library.</li>
            <li>Notify the Principal's office for contingency staffing.</li>
          </ul>
        </div>
        <button
          onClick={onNavigateToAbsences}
          className="min-h-[44px] px-5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors"
        >
          Adjust Absent Teachers in Basket
        </button>
      </div>
    );
  }

  // Summary figures
  const totalSlots = plan.assignments.length + plan.uncoveredSlots.length;
  const coveredSlots = plan.assignments.length;
  const coverageRate = totalSlots > 0 ? Math.round((coveredSlots / totalSlots) * 100) : 100;

  // Grouping logic
  const periods = [1, 2, 3, 4, 5, 6, 7, 8];
  const classIds = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="space-y-6">
      
      {/* Top Controls & Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">
              Today's Substitution Plan
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              · Generated at {plan.createdAt}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {plan.date} · {plan.absences.length} absent teacher{plan.absences.length !== 1 ? 's' : ''} accounted for
          </p>
        </div>

        {/* Action Buttons: WhatsApp & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowWhatsAppModal(true)}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-4 h-4 shrink-0" />
            <span>Share WhatsApp</span>
          </button>

          <button
            onClick={() => setShowPrintModal(true)}
            className="min-h-[44px] px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4 shrink-0" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onRegenerate}
            disabled={isGenerating}
            className="min-h-[44px] px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            {isGenerating ? 'Updating...' : 'Regenerate'}
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Absent Staff
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
            {plan.absences.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            of {TEACHERS.length} total faculty
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Vacant Periods
          </span>
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums block mt-1">
            {totalSlots}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across 12 classes
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Substitutions Assigned
          </span>
          <span className="text-2xl font-bold text-blue-700 font-mono tabular-nums block mt-1">
            {coveredSlots}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium mt-0.5 block">
            {coverageRate}% covered
          </span>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Unassigned Slots
          </span>
          <span className={`text-2xl font-bold font-mono tabular-nums block mt-1 ${
            plan.uncoveredSlots.length > 0 ? 'text-red-600' : 'text-slate-900'
          }`}>
            {plan.uncoveredSlots.length}
          </span>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            {plan.uncoveredSlots.length === 0 ? 'Zero collisions' : 'Requires review'}
          </span>
        </div>
      </div>

      {/* Gemma 4 AI Handover Briefing Banner */}
      <div className="bg-white border border-blue-200/90 rounded-xl p-4 sm:p-5 shadow-xs space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
            Gemma 4 Coordinator Handover Briefing
          </h3>
        </div>

        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          {plan.aiSummary || 'The substitution plan has been optimized under strict workload rules: no teacher exceeds 8 lessons, faculty holding 6 lessons are preserved, and grade-level proximity ensures pedagogical continuity.'}
        </p>

        {plan.aiContinuityNotes && (
          <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
            <span className="font-semibold text-slate-800">Continuity Guidelines:</span>
            <div className="whitespace-pre-line text-slate-600 pl-2">
              {plan.aiContinuityNotes}
            </div>
          </div>
        )}
      </div>

      {/* View Switcher: By Period vs By Class */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
          <button
            onClick={() => setViewGrouping('period')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-md transition-colors ${
              viewGrouping === 'period'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group by Period (1–8)
          </button>
          <button
            onClick={() => setViewGrouping('class')}
            className={`min-h-[38px] px-3.5 text-xs font-semibold rounded-md transition-colors ${
              viewGrouping === 'class'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Group by Class (1–12)
          </button>
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Click "Change" on any slot to reassign teacher
        </span>
      </div>

      {/* Grouped Content */}
      {viewGrouping === 'period' ? (
        // Period-wise grouping
        <div className="space-y-5">
          {periods.map(period => {
            const slotsInPeriod = plan.assignments.filter(a => a.period === period);
            const uncoveredInPeriod = plan.uncoveredSlots.filter(s => s.period === period);

            if (slotsInPeriod.length === 0 && uncoveredInPeriod.length === 0) {
              return null;
            }

            return (
              <div
                key={`period-${period}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-slate-900 font-mono">
                      PERIOD {period}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      {PERIOD_TIMES[period]}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {slotsInPeriod.length} substitution{slotsInPeriod.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {slotsInPeriod.map(assignment => {
                    const sub = getTeacherById(assignment.substituteTeacherId);
                    const orig = getTeacherById(assignment.originalTeacherId);

                    return (
                      <div
                        key={assignment.id}
                        className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {CLASS_NAMES[assignment.classId]}
                            </span>
                            <span className="text-xs font-medium text-slate-600">
                              · {assignment.subject}
                            </span>
                            {assignment.wingMatch && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700">
                                Wing Match
                              </span>
                            )}
                            {assignment.isManualOverride && (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-purple-50 text-purple-700">
                                Manual Override
                              </span>
                            )}
                          </div>

                          <div className="mt-1 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <span>Absent:</span>
                              <span className="line-through text-slate-700 font-medium">
                                {orig?.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
                              <span>Substitute:</span>
                              <span className="text-blue-700 font-bold">
                                {sub?.name}
                              </span>
                              <span className="text-[11px] font-normal text-slate-500">
                                ({sub?.department})
                              </span>
                            </div>
                          </div>

                          <p className="text-[11px] text-slate-500 mt-1">
                            {assignment.reason}
                          </p>
                        </div>

                        <div className="shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => setActiveSwapAssignment(assignment)}
                            className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {uncoveredInPeriod.map((uncovered, idx) => (
                    <div
                      key={`uncovered-${idx}`}
                      className="p-4 bg-red-50/50 flex items-center justify-between gap-3 text-xs text-red-900"
                    >
                      <div>
                        <span className="font-bold">{CLASS_NAMES[uncovered.classId]} · {uncovered.subject}</span>
                        <p className="text-red-700 mt-0.5">{uncovered.reason}</p>
                      </div>
                      <span className="px-2 py-1 rounded-md bg-red-100 text-red-800 font-semibold text-[11px]">
                        Uncovered
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Class-wise grouping (1-12)
        <div className="space-y-4">
          {classIds.map(classId => {
            const slotsForClass = plan.assignments.filter(a => a.classId === classId);
            if (slotsForClass.length === 0) return null;

            return (
              <div
                key={`class-${classId}`}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {CLASS_NAMES[classId]}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({classId <= 5 ? 'Primary Wing' : classId <= 8 ? 'Middle Wing' : 'Senior Wing'})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {slotsForClass.length} substituted period{slotsForClass.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {slotsForClass.map(assignment => {
                    const sub = getTeacherById(assignment.substituteTeacherId);
                    const orig = getTeacherById(assignment.originalTeacherId);

                    return (
                      <div
                        key={assignment.id}
                        className="p-4 sm:px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-sm">
                              P{assignment.period}
                            </span>
                            <span className="font-semibold text-sm text-slate-900">
                              {assignment.subject}
                            </span>
                            <span className="text-xs text-slate-500 font-mono">
                              ({PERIOD_TIMES[assignment.period]})
                            </span>
                          </div>

                          <div className="mt-1 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                            <div className="text-slate-500">
                              Absent: <span className="line-through">{orig?.name}</span>
                            </div>
                            <div className="text-blue-900 font-semibold">
                              Substitute: <span className="text-blue-700 font-bold">{sub?.name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="shrink-0">
                          <button
                            onClick={() => setActiveSwapAssignment(assignment)}
                            className="min-h-[44px] px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors flex items-center gap-1.5"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Change</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Slot Swap Modal */}
      {activeSwapAssignment && (
        <SlotSwapModal
          assignment={activeSwapAssignment}
          plan={plan}
          onClose={() => setActiveSwapAssignment(null)}
          onSwapTeacher={onSwapTeacher}
        />
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <WhatsAppModal
          plan={plan}
          onClose={() => setShowWhatsAppModal(false)}
        />
      )}

      {/* Printable Sheet View */}
      {showPrintModal && (
        <PrintableSheet
          plan={plan}
          onClose={() => setShowPrintModal(false)}
        />
      )}

    </div>
  );
};
