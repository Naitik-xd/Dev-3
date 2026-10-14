import React from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { ABSENCE_THRESHOLD_PERCENT } from '../utils/solver';

interface AbsenceGaugeProps {
  absentCount: number;
  totalTeachers: number;
}

export const AbsenceGauge: React.FC<AbsenceGaugeProps> = ({ absentCount, totalTeachers }) => {
  const percentage = Math.round((absentCount / totalTeachers) * 100);
  const isOverThreshold = percentage > ABSENCE_THRESHOLD_PERCENT;
  const isWarning = percentage >= 35 && !isOverThreshold;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Staff Availability Monitor
            </h2>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              {absentCount} of {totalTeachers} absent ({percentage}%)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Safety rule: Automatic substitution is permitted up to 50% staff absence.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isOverThreshold ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-800">
              <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
              Threshold Exceeded (&gt;50%)
            </span>
          ) : isWarning ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              High Absence Load
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              Normal Operation
            </span>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
        {/* 50% threshold marker line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
          style={{ left: '50%' }}
          title="50% Absence Limit"
        />
        <div
          className={`h-full transition-all duration-300 rounded-full ${
            isOverThreshold
              ? 'bg-red-600'
              : isWarning
              ? 'bg-amber-500'
              : 'bg-blue-600'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-mono">
        <span>0% (0 Absent)</span>
        <span className="font-semibold text-slate-700">50% Max Allowed ({Math.floor(totalTeachers / 2)} Teachers)</span>
        <span>100% ({totalTeachers})</span>
      </div>

      {isOverThreshold && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Substitutions Locked: Over 50% Faculty Unavailable</p>
            <p className="mt-0.5 text-red-700">
              With {absentCount} teachers absent, regular classroom coverage cannot satisfy instructional ratios. Please initiate the School Assembly or Grade-Combining Contingency protocol.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
