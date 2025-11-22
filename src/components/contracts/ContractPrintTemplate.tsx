import { format } from "date-fns";
import { ar } from "date-fns/locale";

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
          .contract-header {
            text-align: center;
            margin-bottom: 40px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .contract-title {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .contract-section {
            margin-bottom: 30px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
            border-bottom: 2px solid #eee;
            padding-bottom: 5px;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
          }
          .info-label {
            font-weight: bold;
            color: #555;
          }
          .info-value {
            color: #333;
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
      
      <div className="contract-header">
        <div className="contract-title">عقد إيجار</div>
        <p>رقم العقد: {contract.contract_number}</p>
        <p>التاريخ: {format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
      </div>

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
          <span className="info-value">{format(new Date(contract.start_date), "dd/MM/yyyy", { locale: ar })}</span>
        </div>
        <div className="info-row">
          <span className="info-label">تاريخ النهاية:</span>
          <span className="info-value">{format(new Date(contract.end_date), "dd/MM/yyyy", { locale: ar })}</span>
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
    </div>
  );
};
