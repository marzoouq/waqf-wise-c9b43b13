import { format, arLocale as ar } from "@/lib/date";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintFooter } from "@/components/shared/PrintFooter";
import type { Distribution } from "@/types/distributions";

interface PrintDistribution extends Pick<Distribution, 'id' | 'month' | 'distribution_date' | 'total_amount' | 'beneficiaries_count' | 'status'> {
  nazer_share?: number;
  charity_share?: number;
  maintenance_share?: number;
}

interface DistributionDetail {
  beneficiary_name: string;
  beneficiary_type: string;
  allocated_amount: number;
  iban?: string;
}

interface DistributionPrintTemplateProps {
  distribution: PrintDistribution;
  details?: DistributionDetail[];
}

export const DistributionPrintTemplate = ({ distribution, details }: DistributionPrintTemplateProps) => {
  return (
    <div className="print-template" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-template, .print-template * { visibility: visible; }
          .print-template { position: absolute; right: 0; top: 0; width: 100%; padding: 40px; }
          .summary-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
          .summary-card { border: 2px solid #166534; padding: 15px; border-radius: 8px; background: #f0fdf4; }
          .summary-label { font-size: 14px; color: #166534; margin-bottom: 5px; }
          .summary-value { font-size: 20px; font-weight: bold; color: #166534; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .details-table th, .details-table td { border: 1px solid #ddd; padding: 12px; text-align: right; }
          .details-table th { background-color: #166534; color: white; font-weight: bold; }
          .details-table tr:nth-child(even) { background-color: #f9fafb; }
          .total-row { background-color: #fef9c3 !important; font-weight: bold; }
        }
      `}</style>
      
      <PrintHeader 
        title="سند توزيع غلة الوقف" 
        subtitle={`شهر: ${distribution.month} | الحالة: ${distribution.status}`} 
      />

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
          <h3 style={{ marginTop: '30px', marginBottom: '15px', color: '#166534' }}>تفاصيل التوزيع</h3>
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
              {details.map((detail) => (
                <tr key={detail.beneficiary_name}>
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

      <PrintFooter />
    </div>
  );
};
