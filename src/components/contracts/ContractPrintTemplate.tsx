import { formatDate } from "@/lib/date";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintFooter } from "@/components/shared/PrintFooter";

interface Contract {
  id: string;
  contract_number: string;
  tenant_name: string;
  tenant_id_number: string;
  tenant_phone: string;
  start_date: string;
  end_date: string;
  monthly_rent: number;
  status: string;
  properties?: {
    name: string;
  };
}

interface ContractPrintTemplateProps {
  contract: Contract;
}

export const ContractPrintTemplate = ({ contract }: ContractPrintTemplateProps) => {
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
            font-family: Arial, sans-serif;
          }
          .contract-section {
            margin: 25px 0;
            padding: 15px;
            background-color: #f9fafb;
            border-radius: 8px;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #166534;
            border-bottom: 2px solid #166534;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            font-weight: bold;
            color: #374151;
          }
          .info-value {
            color: #1f2937;
          }
          .signature-section {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            width: 40%;
            text-align: center;
          }
          .signature-line {
            border-top: 2px solid #333;
            margin-top: 60px;
            padding-top: 10px;
          }
        }
      `}</style>
      
      {/* ترويسة الوقف */}
      <PrintHeader 
        title="عقد إيجار" 
        subtitle={`رقم العقد: ${contract.contract_number}`} 
      />

      <div className="contract-section">
        <div className="section-title">بيانات العقار</div>
        <div className="info-row">
          <span className="info-label">اسم العقار:</span>
          <span className="info-value">{contract.properties?.name || "-"}</span>
        </div>
      </div>

      <div className="contract-section">
        <div className="section-title">بيانات المستأجر</div>
        <div className="info-row">
          <span className="info-label">الاسم:</span>
          <span className="info-value">{contract.tenant_name}</span>
        </div>
        <div className="info-row">
          <span className="info-label">رقم الهوية:</span>
          <span className="info-value">{contract.tenant_id_number}</span>
        </div>
        <div className="info-row">
          <span className="info-label">رقم الهاتف:</span>
          <span className="info-value">{contract.tenant_phone}</span>
        </div>
      </div>

      <div className="contract-section">
        <div className="section-title">بيانات العقد</div>
        <div className="info-row">
          <span className="info-label">تاريخ البداية:</span>
          <span className="info-value">{formatDate(contract.start_date, "dd/MM/yyyy")}</span>
        </div>
        <div className="info-row">
          <span className="info-label">تاريخ النهاية:</span>
          <span className="info-value">{formatDate(contract.end_date, "dd/MM/yyyy")}</span>
        </div>
        <div className="info-row">
          <span className="info-label">الإيجار الشهري:</span>
          <span className="info-value">{contract.monthly_rent.toLocaleString()} ريال سعودي</span>
        </div>
        <div className="info-row">
          <span className="info-label">الحالة:</span>
          <span className="info-value">{contract.status}</span>
        </div>
      </div>

      <div className="signature-section">
        <div className="signature-box">
          <div className="signature-line">
            <strong>توقيع المؤجر</strong>
          </div>
        </div>
        <div className="signature-box">
          <div className="signature-line">
            <strong>توقيع المستأجر</strong>
          </div>
        </div>
      </div>

      {/* تذييل الوقف */}
      <PrintFooter />
    </div>
  );
};
