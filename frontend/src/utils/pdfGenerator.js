import html2pdf from 'html2pdf.js';

/**
 * Generate clinical report PDF using HTML rendering
 * Full Arabic support with proper RTL layout
 * FIXED SCHEMA - Same format every time
 */
export const generateClinicalReportPDF = async (summaryData) => {
  // Create HTML element (not added to DOM)
  const element = document.createElement('div');
  element.innerHTML = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Tajawal', 'Arial', sans-serif;
      line-height: 1.8;
      color: #1a1a1a;
      background: #fff;
      padding: 40px;
      direction: rtl;
    }
    
    .header {
      text-align: center;
      border-bottom: 3px solid #7c5aed;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    
    .header h1 {
      font-size: 24px;
      font-weight: 700;
      color: #7c5aed;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      color: #666;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 16px;
      font-weight: 700;
      color: #7c5aed;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid #e0e0e0;
    }
    
    .content {
      font-size: 14px;
      line-height: 2;
    }
    
    .symptoms-list {
      list-style: none;
      padding-right: 20px;
    }
    
    .symptoms-list li {
      margin-bottom: 8px;
      position: relative;
    }
    
    .symptoms-list li::before {
      content: "•";
      color: #7c5aed;
      font-weight: bold;
      position: absolute;
      right: -20px;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .info-item {
      background: #f5f5f5;
      padding: 12px;
      border-radius: 8px;
    }
    
    .info-label {
      font-weight: 700;
      color: #555;
      font-size: 12px;
      margin-bottom: 4px;
    }
    
    .info-value {
      color: #1a1a1a;
      font-size: 14px;
    }
    
    .severity-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 700;
      font-size: 13px;
    }
    
    .severity-mild {
      background: #d4edda;
      color: #155724;
    }
    
    .severity-moderate {
      background: #fff3cd;
      color: #856404;
    }
    
    .severity-severe {
      background: #f8d7da;
      color: #721c24;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e0e0e0;
      text-align: center;
      font-size: 12px;
      color: #999;
    }
    
    .warning-box {
      background: #fff3cd;
      border: 2px solid #ffc107;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
    
    .warning-box strong {
      color: #856404;
      display: block;
      margin-bottom: 8px;
      font-size: 14px;
    }
    
    .warning-box p {
      color: #856404;
      font-size: 13px;
      line-height: 1.8;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>تقرير جلسة استشارة نفسية</h1>
    <p>منصة وعي للصحة النفسية</p>
    <p style="margin-top: 8px; font-size: 13px;">
      التاريخ: ${new Date().toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  </div>

  <div class="section">
    <div class="section-title">1. الشكوى الرئيسية</div>
    <div class="content">${summaryData.symptom || 'غير محددة'}</div>
  </div>

  <div class="section">
    <div class="section-title">2. الأعراض السريرية</div>
    ${summaryData.symptoms && summaryData.symptoms.length > 0 ? `
    <ul class="symptoms-list">
      ${summaryData.symptoms.map(s => `<li>${s}</li>`).join('')}
    </ul>
    ` : '<div class="content">لم يتم تحديد أعراض محددة</div>'}
  </div>

  <div class="section">
    <div class="section-title">3. التأثير الوظيفي</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">العمل/الدراسة</div>
        <div class="info-value">${summaryData.functionalImpact?.work || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">النوم</div>
        <div class="info-value">${summaryData.functionalImpact?.sleep || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">العلاقات الاجتماعية</div>
        <div class="info-value">${summaryData.functionalImpact?.relationships || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المدة</div>
        <div class="info-value">${summaryData.duration || 'غير محددة'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">4. تقييم الخطورة</div>
    <div class="content" style="margin-bottom: 12px;">
      أفكار إيذاء النفس: <strong>${summaryData.riskFactors?.selfHarm || 'لم تُذكر'}</strong>
    </div>
    <div>
      المستوى: 
      <span class="severity-badge ${
        summaryData.riskFactors?.severity?.includes('شديد') ? 'severity-severe' :
        summaryData.riskFactors?.severity?.includes('متوسط') ? 'severity-moderate' :
        'severity-mild'
      }">
        ${summaryData.riskFactors?.severity || 'غير محدد'}
      </span>
    </div>
  </div>

  <div class="warning-box">
    <strong>⚠️ ملاحظة</strong>
    <p>هذا التقرير يُلخص محتوى المحادثة فقط ولا يُعتبر تشخيصاً طبياً. التشخيص والعلاج من اختصاص الأخصائي المرخص.</p>
  </div>

  <div class="footer">
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة منصة وعي للصحة النفسية</p>
    <p>هذا التقرير سري ولا يجب مشاركته إلا مع المختصين في الرعاية الصحية</p>
  </div>
</body>
</html>
  `;

  // Generate PDF
  const opt = {
    margin: 10,
    filename: `تقرير-وعي-${Date.now()}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  // Generate and download
  try {
    await html2pdf().set(opt).from(element).save();
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('فشل إنشاء التقرير');
  }
};
