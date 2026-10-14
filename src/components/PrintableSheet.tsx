import React, { useState } from 'react';
import { Printer, X, Download, FileText } from 'lucide-react';
import { SubstitutionPlan } from '../types';
import { CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';
import { downloadPrintablePDF, generatePrintableHTML } from '../utils/pdfExport';

interface PrintableSheetProps {
  plan: SubstitutionPlan;
  onClose: () => void;
}

export const PrintableSheet: React.FC<PrintableSheetProps> = ({ plan, onClose }) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      downloadPrintablePDF(plan);
    }
  };

  const handleDownloadPDF = () => {
    downloadPrintablePDF(plan);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  // Group assignments by period for the master sheet
  const sortedAssignments = [...plan.assignments].sort(
    (a, b) => a.period - b.period || a.classId - b.classId
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Printable Substitution Roster & PDF Export
            </h3>
            <p className="text-xs text-slate-500">
              Print directly or download the standalone report file to save as PDF
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownloadPDF}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? 'PDF Downloaded!' : 'Download Official PDF (.pdf)'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="min-h-[44px] px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-2 shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Dialog</span>
            </button>
            <button
              onClick={onClose}
              className="min-h-[44px] min-w-[44px] text-slate-400 hover:text-slate-700 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 sm:p-10 overflow-y-auto flex-1 font-sans text-slate-900 print:p-0 print:m-0">
          
          {/* Institutional Header */}
          <div className="text-center pb-6 border-b-2 border-slate-900 mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900">
              SubMaster Academic Academy
            </h1>
            <p className="text-xs uppercase tracking-widest text-slate-600 font-semibold mt-1">
              Classes 1–12 Daily Master Substitution Schedule
            </p>
            <div className="flex justify-between items-center text-xs text-slate-600 mt-4 pt-2 border-t border-slate-200 font-mono">
              <span><strong>DATE:</strong> {plan.date}</span>
              <span><strong>ISSUED AT:</strong> {plan.createdAt}</span>
              <span><strong>STATUS:</strong> OFFICIAL ROSTER</span>
            </div>
          </div>

          {/* Absent Staff Summary */}
          <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-700 block mb-1">
              Recorded Absences:
            </span>
            <div className="flex flex-wrap gap-2 text-slate-800">
              {plan.absences.map(a => {
                const t = getTeacherById(a.teacherId);
                const scopeLabel = a.scope === 'full' ? 'Full Day' : a.scope === 'morning' ? 'P1–4' : 'P5–8';
                return (
                  <span key={a.teacherId} className="px-2 py-0.5 bg-white border border-slate-200 rounded-sm">
                    <strong>{t?.name || a.teacherId}</strong> ({t?.department} · {scopeLabel})
                  </span>
                );
              })}
            </div>
          </div>

          {/* Master Substitution Table */}
          <div className="mb-8">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">
              Period-Wise Substitution Matrix
            </h2>
            <table className="w-full text-left border-collapse border border-slate-300 text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold">
                  <th className="p-2 border border-slate-300 text-center w-14">Period</th>
                  <th className="p-2 border border-slate-300 w-28">Timing</th>
                  <th className="p-2 border border-slate-300 w-24">Class</th>
                  <th className="p-2 border border-slate-300">Subject</th>
                  <th className="p-2 border border-slate-300">Absent Faculty</th>
                  <th className="p-2 border border-slate-300 font-bold text-blue-900">Assigned Substitute</th>
                  <th className="p-2 border border-slate-300 w-28 text-center">Faculty Sign</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssignments.map((a, index) => {
                  const sub = getTeacherById(a.substituteTeacherId);
                  const orig = getTeacherById(a.originalTeacherId);

                  return (
                    <tr
                      key={a.id}
                      className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}
                    >
                      <td className="p-2 border border-slate-300 text-center font-bold font-mono">
                        P{a.period}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-600 font-mono text-[11px]">
                        {PERIOD_TIMES[a.period]}
                      </td>
                      <td className="p-2 border border-slate-300 font-semibold text-slate-900">
                        {CLASS_NAMES[a.classId]}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-700">
                        {a.subject}
                      </td>
                      <td className="p-2 border border-slate-300 text-slate-600 line-through">
                        {orig?.name || a.originalTeacherId}
                      </td>
                      <td className="p-2 border border-slate-300 font-bold text-slate-900">
                        {sub?.name || a.substituteTeacherId}
                        <span className="block text-[10px] font-normal text-slate-500">
                          {sub?.department} · {a.wingMatch ? 'Same-Wing Match' : 'Cross-Wing'}
                        </span>
                      </td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Individual Slips (For Staff Room Notice Board / Slips) */}
          <div className="pt-4 border-t-2 border-dashed border-slate-300">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Individual Teacher Substitution Slips (Notice Board / Sign-Off)
            </h2>
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              {sortedAssignments.map(a => {
                const sub = getTeacherById(a.substituteTeacherId);
                const orig = getTeacherById(a.originalTeacherId);

                return (
                  <div
                    key={`slip-${a.id}`}
                    className="p-3 border border-slate-300 rounded-md bg-white space-y-1"
                  >
                    <div className="flex justify-between font-bold border-b border-slate-200 pb-1">
                      <span>{sub?.name}</span>
                      <span className="font-mono">P{a.period}</span>
                    </div>
                    <div className="text-slate-600">
                      <strong>Class:</strong> {CLASS_NAMES[a.classId]} ({a.subject})
                    </div>
                    <div className="text-slate-500">
                      <strong>Replacing:</strong> {orig?.name} ({PERIOD_TIMES[a.period]})
                    </div>
                    <div className="pt-1 text-[10px] text-slate-400 flex justify-between">
                      <span>Acknowledged: ____________</span>
                      <span className="font-mono">{plan.date}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Signature Signoff Block */}
          <div className="mt-10 pt-6 border-t border-slate-300 flex justify-between text-xs text-slate-600">
            <div>
              <p>Generated by SubMaster Substitution Engine</p>
              <p className="text-[11px] text-slate-400">Classes 1–12 Automated Workload Compliance</p>
            </div>
            <div className="text-right">
              <div className="w-48 border-b border-slate-400 mb-1" />
              <p className="font-semibold text-slate-800">Academic Coordinator / Vice Principal</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
