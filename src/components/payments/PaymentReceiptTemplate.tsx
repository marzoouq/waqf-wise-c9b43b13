import { formatDate } from "@/lib/date";

interface PaymentReceipt {
  payment_number: string;
  payment_date: string;
  amount_paid: number;
  payment_method?: string;
  receipt_number?: string;
  contracts?: {
    contract_number: string;
    tenant_name: string;
    properties: {
      name: string;
    };
  };
}

interface PaymentReceiptTemplateProps {
  payment: PaymentReceipt;
}

export const PaymentReceiptTemplate = ({ payment }: PaymentReceiptTemplateProps) => {
  const amountInWords = (amount: number): string => {
    // تحويل الرقم إلى كلمات (مبسط)
    const ones = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
    const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
    const hundreds = ['', 'مائة', 'مئتان', 'ثلاثمائة', 'أربعمائة', 'خمسمائة', 'ستمائة', 'سبعمائة', 'ثمانمائة', 'تسعمائة'];
    
    // تبسيط: إرجاع الرقم مع "ريال سعودي"
    return `${amount.toLocaleString('ar-SA')} ريال سعودي`;
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
          .receipt-container {
            border: 3px solid #333;
            padding: 30px;
            border-radius: 10px;
          }
          .receipt-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }
          .receipt-title {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .receipt-body {
            margin: 30px 0;
          }
          .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 15px 0;
            border-bottom: 1px dashed #ccc;
          }
          .receipt-label {
            font-weight: bold;
            font-size: 16px;
          }
          .receipt-value {
            font-size: 16px;
          }
          .amount-box {
            background: #f5f5f5;
            padding: 20px;
            text-align: center;
            margin: 30px 0;
            border-radius: 8px;
            border: 2px solid #333;
          }
          .amount-number {
            font-size: 36px;
            font-weight: bold;
            color: #2563eb;
          }
          .amount-words {
            font-size: 18px;
            margin-top: 10px;
            color: #666;
          }
          .receipt-footer {
            margin-top: 40px;
            text-align: center;
          }
          .stamp-area {
            margin-top: 50px;
            border: 2px dashed #999;
            padding: 40px;
            text-align: center;
            color: #999;
          }
        }
      `}</style>
      
      <div className="receipt-container">
        <div className="receipt-header">
          <div className="receipt-title">سند قبض</div>
          <p>رقم السند: {payment.payment_number}</p>
          <p>التاريخ: {formatDate(payment.payment_date, "dd MMMM yyyy")}</p>
        </div>

        <div className="receipt-body">
          <div className="receipt-row">
            <span className="receipt-label">استلمنا من السيد/ة:</span>
            <span className="receipt-value">{payment.contracts?.tenant_name || "-"}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">مقابل:</span>
            <span className="receipt-value">إيجار عقار {payment.contracts?.properties?.name || "-"}</span>
          </div>
          <div className="receipt-row">
            <span className="receipt-label">رقم العقد:</span>
            <span className="receipt-value">{payment.contracts?.contract_number || "-"}</span>
          </div>
          {payment.payment_method && (
            <div className="receipt-row">
              <span className="receipt-label">طريقة الدفع:</span>
              <span className="receipt-value">{payment.payment_method}</span>
            </div>
          )}
          {payment.receipt_number && (
            <div className="receipt-row">
              <span className="receipt-label">رقم الإيصال:</span>
              <span className="receipt-value">{payment.receipt_number}</span>
            </div>
          )}
        </div>

        <div className="amount-box">
          <div className="receipt-label">المبلغ المستلم</div>
          <div className="amount-number">{payment.amount_paid.toLocaleString('ar-SA')} ر.س</div>
          <div className="amount-words">{amountInWords(payment.amount_paid)}</div>
        </div>

        <div className="stamp-area">
          <p>ختم وتوقيع الجهة المستلمة</p>
        </div>

        <div className="receipt-footer">
          <p style={{ fontSize: '12px', color: '#666' }}>
            هذا السند صادر من نظام إدارة الوقف الإلكتروني
          </p>
        </div>
      </div>
    </div>
  );
};
