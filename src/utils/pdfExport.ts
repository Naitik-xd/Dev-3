import { SubstitutionPlan } from '../types';
import { CLASS_NAMES, PERIOD_TIMES, getTeacherById } from '../data/mockData';

export function generatePrintableHTML(plan: SubstitutionPlan): string {
  const sortedAssignments = [...plan.assignments].sort(
    (a, b) => a.period - b.period || a.classId - b.classId
  );

  const absentListHTML = plan.absences
    .map(a => {
      const t = getTeacherById(a.teacherId);
      const scopeLabel = a.scope === 'full' ? 'Full Day' : a.scope === 'morning' ? 'P1–4' : 'P5–8';
      return `<span style="display:inline-block; padding: 2px 8px; margin: 2px; border: 1px solid #cbd5e1; border-radius: 4px; background: #fff; font-size: 11px;">
        <strong>${t?.name || a.teacherId}</strong> (${t?.department || ''} &middot; ${scopeLabel})
      </span>`;
    })
    .join('');

  const rowsHTML = sortedAssignments
    .map((a, idx) => {
      const sub = getTeacherById(a.substituteTeacherId);
      const orig = getTeacherById(a.originalTeacherId);
      const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';

      return `<tr style="background-color: ${bg};">
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; font-family: monospace;">P${a.period}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-family: monospace; font-size: 11px; color: #475569;">${PERIOD_TIMES[a.period]}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: 600;">${CLASS_NAMES[a.classId]}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;">${a.subject}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; text-decoration: line-through; color: #64748b;">${orig?.name || a.originalTeacherId}</td>
        <td style="padding: 8px; border: 1px solid #cbd5e1; font-weight: bold; color: #1e3a8a;">
          ${sub?.name || a.substituteTeacherId}
          <div style="font-size: 10px; font-weight: normal; color: #64748b;">${sub?.department || ''} &middot; ${a.wingMatch ? 'Same-Wing' : 'Cross-Wing'}</div>
        </td>
        <td style="padding: 8px; border: 1px solid #cbd5e1;"></td>
      </tr>`;
    })
    .join('');

  const slipsHTML = sortedAssignments
    .map(a => {
      const sub = getTeacherById(a.substituteTeacherId);
      const orig = getTeacherById(a.originalTeacherId);

      return `<div style="padding: 10px; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; margin-bottom: 8px; font-size: 11px; page-break-inside: avoid;">
        <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 4px;">
          <span>${sub?.name || ''}</span>
          <span style="font-family: monospace;">PERIOD ${a.period} (${PERIOD_TIMES[a.period]})</span>
        </div>
        <div style="color: #334155;"><strong>Class:</strong> ${CLASS_NAMES[a.classId]} (${a.subject})</div>
        <div style="color: #64748b;"><strong>Replacing:</strong> ${orig?.name || ''}</div>
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #cbd5e1; font-size: 10px; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>Signature: ____________</span>
          <span>${plan.date}</span>
        </div>
      </div>`;
    })
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Substitution Roster - ${plan.date}</title>
  <style>
    @page { size: A4; margin: 1.5cm; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th { background: #f1f5f9; padding: 8px; border: 1px solid #cbd5e1; font-size: 11px; text-transform: uppercase; text-align: left; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 16px;">
    <h1 style="margin: 0; font-size: 20px; text-transform: uppercase; letter-spacing: 0.5px;">SubMaster Academic Academy</h1>
    <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #475569; margin-top: 4px; font-weight: 600;">
      Classes 1–12 Daily Master Substitution Schedule
    </div>
    <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 11px; color: #475569; font-family: monospace;">
      <span><strong>DATE:</strong> ${plan.date}</span>
      <span><strong>ISSUED AT:</strong> ${plan.createdAt}</span>
      <span><strong>STATUS:</strong> OFFICIAL ROSTER</span>
    </div>
  </div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; margin-bottom: 16px;">
    <div style="font-weight: bold; font-size: 11px; text-transform: uppercase; margin-bottom: 6px; color: #334155;">Recorded Absences:</div>
    <div>${absentListHTML}</div>
  </div>

  <h2 style="font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; color: #1e293b;">Period-Wise Substitution Matrix</h2>
  <table>
    <thead>
      <tr>
        <th style="text-align: center; width: 45px;">Period</th>
        <th style="width: 100px;">Timing</th>
        <th style="width: 90px;">Class</th>
        <th>Subject</th>
        <th>Absent Faculty</th>
        <th style="color: #1e3a8a;">Assigned Substitute</th>
        <th style="width: 90px; text-align: center;">Faculty Sign</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHTML}
    </tbody>
  </table>

  <div style="margin-top: 24px; padding-top: 16px; border-top: 2px dashed #cbd5e1; page-break-before: auto;">
    <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 12px; color: #475569;">Teacher Notice Slips</h2>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
      ${slipsHTML}
    </div>
  </div>

  <div style="margin-top: 30px; padding-top: 16px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
    <div>Generated by SubMaster System &middot; Classes 1–12 Compliance Verified</div>
    <div style="text-align: right;">
      <div style="width: 180px; border-bottom: 1px solid #94a3b8; margin-bottom: 4px;"></div>
      <strong>Academic Coordinator / Vice Principal</strong>
    </div>
  </div>
</body>
</html>`;
}

export function downloadPrintableReport(plan: SubstitutionPlan): void {
  const html = generatePrintableHTML(plan);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const safeDate = plan.date.replace(/[^a-zA-Z0-9]/g, '_');
  link.download = `Substitution_Plan_${safeDate}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
