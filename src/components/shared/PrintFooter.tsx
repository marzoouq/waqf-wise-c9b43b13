/**
 * PrintFooter - تذييل موحد للطباعة
 * تُستخدم في جميع قوالب الطباعة
 */

import { WAQF_IDENTITY, getCurrentDateTimeArabic } from '@/lib/waqf-identity';

interface PrintFooterProps {
  showVersion?: boolean;
  showConfidential?: boolean;
  className?: string;
}

export const PrintFooter = ({ 
  showVersion = true,
  showConfidential = false,
  className = '' 
}: PrintFooterProps) => {
  return (
    <div className={`print-footer ${className}`}>
      <style>{`
        .print-footer {
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #E5E7EB;
          text-align: center;
          font-size: 10px;
          color: #6B7280;
        }
        .print-footer-official {
          margin-bottom: 5px;
        }
        .print-footer-datetime {
          margin-bottom: 5px;
        }
        .print-footer-version {
          font-size: 9px;
          color: #9CA3AF;
        }
        .print-footer-confidential {
          margin-top: 10px;
          padding: 5px 10px;
          background-color: #FEF2F2;
          color: #DC2626;
          font-weight: bold;
          display: inline-block;
          border-radius: 4px;
        }
      `}</style>
      
      {/* النص الرسمي */}
      <div className="print-footer-official">
        * {WAQF_IDENTITY.footer}
      </div>
      
      {/* تاريخ ووقت الطباعة */}
      <div className="print-footer-datetime">
        تاريخ الطباعة: {getCurrentDateTimeArabic()}
      </div>
      
      {/* رقم الإصدار */}
      {showVersion && (
        <div className="print-footer-version">
          الإصدار: {WAQF_IDENTITY.version}
        </div>
      )}
      
      {/* تحذير سري */}
      {showConfidential && (
        <div className="print-footer-confidential">
          {WAQF_IDENTITY.confidential}
        </div>
      )}
    </div>
  );
};

export default PrintFooter;
