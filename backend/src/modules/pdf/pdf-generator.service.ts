import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as puppeteer from 'puppeteer';

export interface ClinicalReportData {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  functionalImpact: {
    work?: string;
    sleep?: string;
    relationships?: string;
  };
  riskFactors: {
    selfHarm?: string;
    severity?: string;
  };
  preliminaryDiagnosis: string;
  clinicalRecommendations: string[];
}

@Injectable()
export class PDFGeneratorService {
  private readonly logger = new Logger(PDFGeneratorService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate clinical report PDF for therapists (Arabic support)
   */
  async generateClinicalReportPDF(data: any, reportData: ClinicalReportData): Promise<Buffer> {
    try {
      // Create HTML template with full Arabic support
      const html = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير جلسة استشارة نفسية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&display=swap');
    
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
    
    .symptoms-list, .recommendations-list {
      list-style: none;
      padding-right: 20px;
    }
    
    .symptoms-list li, .recommendations-list li {
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
    
    .recommendations-list li {
      padding: 8px 12px;
      background: #f9f9f9;
      border-right: 3px solid #7c5aed;
      margin-bottom: 10px;
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
      التاريخ: ${new Date(data.completedAt).toLocaleDateString('ar-EG', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </p>
  </div>

  <div class="section">
    <div class="section-title">الشكوى الرئيسية</div>
    <div class="content">${data.symptom || 'غير محددة'}</div>
  </div>

  <div class="section">
    <div class="section-title">الأعراض السريرية</div>
    <ul class="symptoms-list">
      ${(reportData.symptoms || []).map(s => `<li>${s}</li>`).join('')}
    </ul>
  </div>

  <div class="section">
    <div class="section-title">التأثير الوظيفي</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">العمل/الدراسة</div>
        <div class="info-value">${reportData.functionalImpact?.work || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">النوم</div>
        <div class="info-value">${reportData.functionalImpact?.sleep || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">العلاقات الاجتماعية</div>
        <div class="info-value">${reportData.functionalImpact?.relationships || 'غير محدد'}</div>
      </div>
      <div class="info-item">
        <div class="info-label">المدة</div>
        <div class="info-value">${reportData.duration || 'غير محددة'}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">تقييم الخطورة</div>
    <div class="content" style="margin-bottom: 12px;">
      أفكار إيذاء النفس: <strong>${reportData.riskFactors?.selfHarm || 'لم تُذكر'}</strong>
    </div>
    <div>
      المستوى: 
      <span class="severity-badge ${
        reportData.riskFactors?.severity?.includes('شديد') ? 'severity-severe' :
        reportData.riskFactors?.severity?.includes('متوسط') ? 'severity-moderate' :
        'severity-mild'
      }">
        ${reportData.riskFactors?.severity || 'غير محدد'}
      </span>
    </div>
  </div>

  <div class="section">
    <div class="section-title">التشخيص الأولي</div>
    <div class="content">${reportData.preliminaryDiagnosis || 'بحاجة إلى تقييم كامل'}</div>
  </div>

  <div class="section">
    <div class="section-title">التوصيات السريرية</div>
    <ol class="recommendations-list">
      ${(reportData.clinicalRecommendations || []).map(r => `<li>${r}</li>`).join('')}
    </ol>
  </div>

  <div class="warning-box">
    <strong>⚠️ تنويه مهم</strong>
    <p>هذا التقرير لأغراض إعلامية فقط وليس تشخيصاً طبياً معتمداً. يجب مراجعة أخصائي صحة نفسية مرخص للتقييم الكامل والعلاج المناسب.</p>
  </div>

  <div class="footer">
    <p>تم إنشاء هذا التقرير تلقائياً بواسطة منصة وعي للصحة النفسية</p>
    <p>هذا التقرير سري ولا يجب مشاركته إلا مع المختصين في الرعاية الصحية</p>
  </div>
</body>
</html>
      `;

      // Launch Puppeteer and generate PDF
      const browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
        ],
      });

      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '40px',
          bottom: '40px',
          left: '40px',
          right: '40px',
        },
      }) as Buffer;

      await browser.close();
      
      return pdfBuffer;
    } catch (error) {
      this.logger.error('Error generating PDF:', error);
      throw error;
    }
  }
}
