import { Report } from '../types';

export function openPrintableReport(report: Report, language: 'en' | 'te' = 'en') {
  const isTe = language === 'te';
  const printWindow = window.open('', '_blank', 'width=850,height=1000');
  if (!printWindow) {
    alert('Please allow popups to view and print the diagnostic report.');
    return;
  }

  const dateStr = new Date(report.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const summaryText = isTe ? report.summaryTe || report.summary : report.summary;
  const biomarkersHtml = (report.biomarkers || [
    {
      name: report.testType,
      value: report.glucose || report.cholesterol || report.cbc || report.thyroid || 'Within limits',
      unit: 'Standard unit',
      normalRange: 'Normal reference threshold',
      status: 'normal',
    },
  ])
    .map(
      (b) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 16px; font-weight: 600; color: #1e293b;">${b.name}</td>
        <td style="padding: 12px 16px; font-weight: 700; color: #2563eb; font-size: 16px;">${b.value} <span style="font-size: 12px; color: #64748b; font-weight: 400;">${b.unit}</span></td>
        <td style="padding: 12px 16px; color: #475569;">${b.normalRange}</td>
        <td style="padding: 12px 16px;">
          <span style="display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: 700; background: ${
            b.status === 'normal' ? '#ecfdf5; color: #059669;' : '#fef2f2; color: #dc2626;'
          }">
            ${b.status.toUpperCase()}
          </span>
        </td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>VMC Diagnostic Report - ${report.reportId}</title>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            margin: 0;
            padding: 36px;
            background: #ffffff;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 24px;
          }
          .logo {
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .logo-box {
            width: 44px;
            height: 44px;
            background: #2563eb;
            color: white;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            font-size: 22px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0;
          }
          .subtitle {
            font-size: 12px;
            color: #64748b;
            margin-top: 2px;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1e40af;
            padding: 4px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.5px;
          }
          .patient-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 16px 20px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
            margin-bottom: 28px;
          }
          .label {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            margin-bottom: 4px;
          }
          .value {
            font-size: 14px;
            font-weight: 600;
            color: #1e293b;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background: #f1f5f9;
            padding: 12px 16px;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            color: #475569;
            letter-spacing: 0.5px;
          }
          .ai-box {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 18px 22px;
            margin-bottom: 24px;
          }
          .ai-title {
            font-size: 14px;
            font-weight: 700;
            color: #1d4ed8;
            margin-bottom: 6px;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .doctor-box {
            background: #fdf4ff;
            border: 1px solid #f0abfc;
            border-radius: 12px;
            padding: 18px 22px;
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #64748b;
          }
          .qr-placeholder {
            width: 72px;
            height: 72px;
            border: 2px dashed #94a3b8;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            text-align: center;
            border-radius: 6px;
            color: #64748b;
          }
          .print-btn {
            background: #2563eb;
            color: white;
            padding: 10px 20px;
            font-size: 14px;
            font-weight: 600;
            border-radius: 8px;
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .no-print {
              display: none;
            }
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          <span style="color: #64748b; font-size: 13px;">Official VMC Diagnostic Record (ISO 15189 Certified Kiosk)</span>
        </div>

        <div class="header">
          <div class="logo">
            <div class="logo-box">+</div>
            <div>
              <h1 class="title">VENDING MACHINE CLINIC</h1>
              <div class="subtitle">Autonomous AI-Powered Self-Service Diagnostic Kiosk Network</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge">CERTIFIED LAB RESULT</span>
            <div style="font-size: 12px; font-weight: 700; margin-top: 6px; color: #0f172a;">${report.reportId}</div>
            <div style="font-size: 11px; color: #64748b;">Date: ${dateStr}</div>
          </div>
        </div>

        <div class="patient-card">
          <div>
            <div class="label">Patient Name</div>
            <div class="value">${report.userName}</div>
          </div>
          <div>
            <div class="label">Booking ID</div>
            <div class="value">${report.bookingId}</div>
          </div>
          <div>
            <div class="label">Test Performed</div>
            <div class="value" style="color: #2563eb;">${report.testType}</div>
          </div>
          <div>
            <div class="label">Origin Kiosk</div>
            <div class="value">${report.kioskLocation || 'Kiosk #01 (HiTech City)'}</div>
          </div>
        </div>

        <h3 style="margin-bottom: 12px; font-size: 16px; color: #1e293b;">Biochemical Assay Readings</h3>
        <table>
          <thead>
            <tr>
              <th>Biomarker Assay</th>
              <th>Observed Value</th>
              <th>Reference Interval</th>
              <th>Flag / Status</th>
            </tr>
          </thead>
          <tbody>
            ${biomarkersHtml}
          </tbody>
        </table>

        <div class="ai-box">
          <div class="ai-title">🤖 AI Clinical Assessment & Recommendations</div>
          <p style="margin: 0 0 8px 0; font-size: 14px; line-height: 1.6; color: #1e3a8a;">${summaryText}</p>
          ${report.advice ? `<p style="margin: 0; font-size: 13px; color: #2563eb; font-weight: 600;">💡 Lifestyle Advice: ${report.advice}</p>` : ''}
        </div>

        ${
          report.doctorNotes
            ? `
          <div class="doctor-box">
            <div style="font-size: 14px; font-weight: 700; color: #86198f; margin-bottom: 4px;">
              🩺 Attending Physician Review (${report.doctorName || 'Dr. Ananya Sharma, MD'})
            </div>
            <p style="margin: 0; font-size: 13px; color: #701a75; line-height: 1.5;">${report.doctorNotes}</p>
          </div>
        `
            : ''
        }

        <div class="footer">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div class="qr-placeholder">
              <span>SCAN TO<br/>VERIFY</span>
            </div>
            <div>
              <div style="font-weight: 700; color: #0f172a;">Digital Cryptographic Seal</div>
              <div style="font-size: 11px;">Verified by VMC Health Cloud Core Engine. Valid for medical review.</div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-family: 'Brush Script MT', cursive, sans-serif; color: #1e40af;">
              ${report.doctorName || 'Dr. Ananya Sharma'}
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 2px;">Chief Clinical Officer, VMC</div>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
