import { format, arLocale as ar } from "@/lib/date";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintFooter } from "@/components/shared/PrintFooter";

interface Request {
  request_number: string;
  beneficiary?: { full_name: string; national_id: string; };
  request_type?: { name: string; };
  description: string;
  amount?: number;
  status: string;
  priority?: string;
  submitted_at: string;
}

interface RequestPrintTemplateProps {
  request: Request;
}

export const RequestPrintTemplate = ({ request }: RequestPrintTemplateProps) => {
  return (
    <div className="print-template" style={{ display: 'none' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-template, .print-template * { visibility: visible; }
          .print-template { position: absolute; right: 0; top: 0; width: 100%; padding: 40px; }
          .request-info { margin: 30px 0; }
          .info-row { display: flex; justify-content: space-between; padding: 15px; border-bottom: 1px solid #e5e7eb; }
          .info-label { font-weight: bold; width: 30%; color: #166534; }
          .info-value { width: 70%; }
          .description-box { margin: 20px 0; padding: 20px; background: #f0fdf4; border: 1px solid #166534; border-radius: 8px; }
        }
      `}</style>
      
      <PrintHeader title="طلب مستفيد" subtitle={`رقم الطلب: ${request.request_number}`} />

      <div className="request-info">
        <div className="info-row">
          <span className="info-label">اسم المستفيد:</span>
          <span className="info-value">{request.beneficiary?.full_name || "-"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">رقم الهوية:</span>
          <span className="info-value">{request.beneficiary?.national_id || "-"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">نوع الطلب:</span>
          <span className="info-value">{request.request_type?.name || "-"}</span>
        </div>
        <div className="info-row">
          <span className="info-label">الحالة:</span>
          <span className="info-value">{request.status}</span>
        </div>
        <div className="info-row">
          <span className="info-label">الأولوية:</span>
          <span className="info-value">{request.priority || "-"}</span>
        </div>
        {request.amount && (
          <div className="info-row">
            <span className="info-label">المبلغ المطلوب:</span>
            <span className="info-value" style={{ fontWeight: 'bold', color: '#166534' }}>
              {request.amount.toLocaleString()} ريال سعودي
            </span>
          </div>
        )}
        <div className="info-row">
          <span className="info-label">تاريخ التقديم:</span>
          <span className="info-value">{format(new Date(request.submitted_at), "dd MMMM yyyy - HH:mm", { locale: ar })}</span>
        </div>
      </div>

      <div className="description-box">
        <h3 style={{ marginBottom: '10px', fontWeight: 'bold', color: '#166534' }}>تفاصيل الطلب:</h3>
        <p>{request.description}</p>
      </div>

      <PrintFooter />
    </div>
  );
};
