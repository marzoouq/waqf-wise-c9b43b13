import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface MaintenanceRequest {
  request_number: string;
  title: string;
  description: string;
  priority: string;
  category: string;
  status: string;
  requested_date: string;
  scheduled_date?: string;
  completed_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  properties?: {
    name: string;
  };
  vendor_name?: string;
}

interface MaintenancePrintTemplateProps {
  request: MaintenanceRequest;
}

export const MaintenancePrintTemplate = ({ request }: MaintenancePrintTemplateProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'عاجل': return '#dc2626';
      case 'عالي': return '#ea580c';
      case 'متوسط': return '#eab308';
      default: return '#6b7280';
    }
  };

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
          .maintenance-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .maintenance-title {
            font-size: 26px;
            font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin: 20px 0;
          }
          .info-item {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
          .info-label {
            font-size: 12px;
            color: #666;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 16px;
            font-weight: 600;
          }
          .description-section {
            margin: 30px 0;
            padding: 20px;
            background: #f9fafb;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
          }
        }
      `}</style>
      
      <div className="maintenance-header">
        <div className="maintenance-title">طلب صيانة</div>
        <p>رقم الطلب: {request.request_number}</p>
        <p>تاريخ الطباعة: {format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
      </div>

      <div className="info-grid">
        <div className="info-item">
          <div className="info-label">العنوان</div>
          <div className="info-value">{request.title}</div>
        </div>
        <div className="info-item">
          <div className="info-label">العقار</div>
          <div className="info-value">{request.properties?.name || "-"}</div>
        </div>
        <div className="info-item">
          <div className="info-label">الأولوية</div>
          <div className="info-value" style={{ color: getPriorityColor(request.priority) }}>
            {request.priority}
          </div>
        </div>
        <div className="info-item">
          <div className="info-label">الفئة</div>
          <div className="info-value">{request.category}</div>
        </div>
        <div className="info-item">
          <div className="info-label">الحالة</div>
          <div className="info-value">{request.status}</div>
        </div>
        <div className="info-item">
          <div className="info-label">تاريخ الطلب</div>
          <div className="info-value">
            {format(new Date(request.requested_date), "dd/MM/yyyy", { locale: ar })}
          </div>
        </div>
        {request.scheduled_date && (
          <div className="info-item">
            <div className="info-label">تاريخ الجدولة</div>
            <div className="info-value">
              {format(new Date(request.scheduled_date), "dd/MM/yyyy", { locale: ar })}
            </div>
          </div>
        )}
        {request.estimated_cost && (
          <div className="info-item">
            <div className="info-label">التكلفة المقدرة</div>
            <div className="info-value">{request.estimated_cost.toLocaleString()} ر.س</div>
          </div>
        )}
        {request.actual_cost && (
          <div className="info-item">
            <div className="info-label">التكلفة الفعلية</div>
            <div className="info-value">{request.actual_cost.toLocaleString()} ر.س</div>
          </div>
        )}
        {request.vendor_name && (
          <div className="info-item">
            <div className="info-label">اسم المقاول</div>
            <div className="info-value">{request.vendor_name}</div>
          </div>
        )}
      </div>

      <div className="description-section">
        <h3 style={{ marginBottom: '15px', fontWeight: 'bold' }}>وصف المشكلة:</h3>
        <p>{request.description}</p>
      </div>

      <div style={{ marginTop: '60px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>تم إصدار هذا المستند من نظام إدارة الوقف الإلكتروني</p>
        <p>© {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};
