import { Beneficiary } from "@/types/beneficiary";
import { format, arLocale as ar } from "@/lib/date";

interface PrintableBeneficiariesListProps {
  beneficiaries: Beneficiary[];
  title?: string;
}

export function PrintableBeneficiariesList({ 
  beneficiaries,
  title = "كشف المستفيدين من الدرجة الأولى"
}: PrintableBeneficiariesListProps) {
  const printDate = format(new Date(), "dd MMMM yyyy", { locale: ar });

  return (
    <div className="print-container">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container,
          .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px;
          }
          .no-print {
            display: none !important;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          thead {
            display: table-header-group;
          }
          tfoot {
            display: table-footer-group;
          }
        }
        
        .print-container {
          background: white;
          color: black;
          font-family: 'Amiri', serif;
        }
        
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #1a5f4a;
          padding-bottom: 20px;
        }
        
        .print-title {
          font-size: 24px;
          font-weight: bold;
          margin: 10px 0;
          color: #1a5f4a;
        }
        
        .print-date {
          font-size: 14px;
          color: #666;
          margin-top: 10px;
        }
        
        .print-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 13px;
        }
        
        .print-table th,
        .print-table td {
          border: 1px solid #333;
          padding: 10px;
          text-align: right;
        }
        
        .print-table th {
          background-color: #f5f5f5;
          font-weight: bold;
          color: #1a5f4a;
        }
        
        .print-table tbody tr:nth-child(even) {
          background-color: #fafafa;
        }
        
        .print-footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #1a5f4a;
          font-size: 12px;
          color: #666;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
        }
        
        .signature-box {
          text-align: center;
        }
        
        .signature-line {
          border-top: 1px solid #333;
          width: 200px;
          margin: 40px auto 10px;
        }
      `}</style>

      <div className="print-header">
        <div className="print-title">{title}</div>
        <div className="print-date">تاريخ الطباعة: {printDate}</div>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th style={{ width: '50px' }}>م</th>
            <th>الاسم الكامل</th>
            <th style={{ width: '120px' }}>رقم الهوية</th>
            <th style={{ width: '100px' }}>الجنسية</th>
            <th style={{ width: '100px' }}>صلة القرابة</th>
            <th style={{ width: '80px' }}>الجنس</th>
          </tr>
        </thead>
        <tbody>
          {beneficiaries.map((beneficiary, index) => (
            <tr key={beneficiary.id}>
              <td>{index + 1}</td>
              <td>{beneficiary.full_name}</td>
              <td>{beneficiary.national_id}</td>
              <td>{beneficiary.nationality || 'سعودي'}</td>
              <td>{beneficiary.relationship}</td>
              <td>{beneficiary.gender}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        <div style={{ marginBottom: '20px' }}>
          <strong>إجمالي عدد المستفيدين:</strong> {beneficiaries.length}
        </div>
        
        <div className="signature-section">
          <div className="signature-box">
            <div className="signature-line"></div>
            <div>المعد</div>
          </div>
          
          <div className="signature-box">
            <div className="signature-line"></div>
            <div>المراجع</div>
          </div>
          
          <div className="signature-box">
            <div className="signature-line"></div>
            <div>الناظر</div>
          </div>
        </div>
      </div>
    </div>
  );
}