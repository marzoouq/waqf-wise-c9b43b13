import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Property {
  id: string;
  name: string;
  property_type: string;
  location: string;
  area?: number;
  units_count?: number;
  annual_revenue?: number;
  status: string;
  description?: string;
}

interface PropertyPrintTemplateProps {
  properties: Property[];
  title: string;
}

export const PropertyPrintTemplate = ({ properties, title }: PropertyPrintTemplateProps) => {
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
            padding: 20px;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .print-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .print-table th,
          .print-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: right;
          }
          .print-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .print-footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        }
      `}</style>
      
      <div className="print-header">
        <h1>{title}</h1>
        <p>تاريخ الطباعة: {format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
        <p>عدد العقارات: {properties.length}</p>
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>الاسم</th>
            <th>النوع</th>
            <th>الموقع</th>
            <th>المساحة</th>
            <th>عدد الوحدات</th>
            <th>الإيراد السنوي</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <tr key={property.id}>
              <td>{property.name}</td>
              <td>{property.property_type}</td>
              <td>{property.location}</td>
              <td>{property.area ? `${property.area} م²` : "-"}</td>
              <td>{property.units_count || "-"}</td>
              <td>{property.annual_revenue ? `${property.annual_revenue.toLocaleString()} ر.س` : "-"}</td>
              <td>{property.status}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-footer">
        <p>© {new Date().getFullYear()} - نظام إدارة الوقف</p>
      </div>
    </div>
  );
};
