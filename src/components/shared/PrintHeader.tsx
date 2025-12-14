/**
 * PrintHeader - ترويسة موحدة للطباعة
 * تُستخدم في جميع قوالب الطباعة
 */

import { WAQF_IDENTITY, getCurrentDateArabic } from '@/lib/waqf-identity';

interface PrintHeaderProps {
  title: string;
  subtitle?: string;
  showDate?: boolean;
  className?: string;
}

export const PrintHeader = ({ 
  title, 
  subtitle, 
  showDate = true,
  className = '' 
}: PrintHeaderProps) => {
  return (
    <div className={`print-header ${className}`}>
      <style>{`
        .print-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #166534;
        }
        .print-header-logo {
          font-size: 48px;
          margin-bottom: 10px;
        }
        .print-header-waqf-name {
          font-size: 24px;
          font-weight: bold;
          color: #166534;
          margin-bottom: 5px;
        }
        .print-header-platform-name {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 20px;
        }
        .print-header-title {
          font-size: 20px;
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 5px;
        }
        .print-header-subtitle {
          font-size: 14px;
          color: #6B7280;
        }
        .print-header-date {
          font-size: 12px;
          color: #6B7280;
          margin-top: 10px;
        }
      `}</style>
      
      {/* شعار الوقف */}
      <div className="print-header-logo">{WAQF_IDENTITY.logo}</div>
      
      {/* اسم الوقف */}
      <div className="print-header-waqf-name">{WAQF_IDENTITY.name}</div>
      
      {/* اسم المنصة */}
      <div className="print-header-platform-name">{WAQF_IDENTITY.platformName}</div>
      
      {/* عنوان المستند */}
      <div className="print-header-title">{title}</div>
      
      {/* العنوان الفرعي */}
      {subtitle && <div className="print-header-subtitle">{subtitle}</div>}
      
      {/* التاريخ */}
      {showDate && (
        <div className="print-header-date">التاريخ: {getCurrentDateArabic()}</div>
      )}
    </div>
  );
};

export default PrintHeader;
