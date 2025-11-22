import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Distribution {
  id: string;
  month: string;
  distribution_date: string;
  total_amount: number;
  beneficiaries_count: number;
  nazer_share?: number;
  charity_share?: number;
  maintenance_share?: number;
  status: string;
}

interface DistributionDetail {
  beneficiary_name: string;
  beneficiary_type: string;
  allocated_amount: number;
  iban?: string;
}

interface DistributionPrintTemplateProps {
  distribution: Distribution;
  details?: DistributionDetail[];
}

export const DistributionPrintTemplate = ({ distribution, details }: DistributionPrintTemplateProps) => {
  return (
    <div className="print-template" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-template, .print-template * {
            visibility: visible;
          }
          .print-template {
            position: absolute;
            right: 0;
            top: 0;
            width: 100%;
            padding: 40px;
          }
          .dist-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .dist-title {
            font-size: 28px;
            font-weight: bold;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin: 30px 0;
          }
          .summary-card {
            border: 2px solid #e5e7eb;
            padding: 15px;
            border-radius: 8px;
          }
          .summary-label {
            font-size: 14px;
            color: #666;
            margin-bottom: 5px;
          }
          .summary-value {
            font-size: 20px;
            font-weight: bold;
            color: #2563eb;
          }
          .details-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 30px;
          }
          .details-table th,
          .details-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          .details-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            background-color: #f0f9ff;
            font-weight: bold;
          }
        }
      `}</style>
      
      <div className="dist-header">
        <div className="dist-title">سند توزيع غلة الوقف</div>
        <p>شهر: {distribution.month}</p>
        <p>التاريخ: {format(new Date(distribution.distribution_date), "dd MMMM yyyy", { locale: ar })}</p>
        <p>الحالة: {distribution.status}</p>
      </div>

      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-label">إجمالي المبلغ الموزع</div>
          <div className="summary-value">{distribution.total_amount.toLocaleString()} ر.س</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">عدد المستفيدين</div>
          <div className="summary-value">{distribution.beneficiaries_count}</div>
        </div>
        {distribution.nazer_share && (
          <div className="summary-card">
            <div className="summary-label">حصة الناظر</div>
            <div className="summary-value">{distribution.nazer_share.toLocaleString()} ر.س</div>
          </div>
        )}
        {distribution.charity_share && (
          <div className="summary-card">
            <div className="summary-label">حصة الخيرات</div>
            <div className="summary-value">{distribution.charity_share.toLocaleString()} ر.س</div>
          </div>
        )}
      </div>

      {details && details.length > 0 && (
        <>
          <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>تفاصيل التوزيع</h3>
          <table className="details-table">
            <thead>
              <tr>
                <th>اسم المستفيد</th>
                <th>النوع</th>
                <th>المبلغ المخصص</th>
                <th>IBAN</th>
              </tr>
            </thead>
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <td>{detail.beneficiary_name}</td>
                  <td>{detail.beneficiary_type}</td>
                  <td>{detail.allocated_amount.toLocaleString()} ر.س</td>
                  <td>{detail.iban || "-"}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td colSpan={2}>الإجمالي</td>
                <td>{details.reduce((sum, d) => sum + d.allocated_amount, 0).toLocaleString()} ر.س</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </>
      )}

      <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>تم إصدار هذا السند من نظام إدارة الوقف الإلكتروني</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
