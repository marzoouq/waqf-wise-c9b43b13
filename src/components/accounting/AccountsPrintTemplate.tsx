import { format, arLocale as ar } from "@/lib/date";
import { PrintHeader } from "@/components/shared/PrintHeader";
import { PrintFooter } from "@/components/shared/PrintFooter";
import { getAccountTypeLabel } from "@/lib/constants";

interface Account {
  id: string;
  code: string;
  name_ar: string;
  account_type: string;
  account_nature: string;
  current_balance: number;
  is_active: boolean;
}

interface AccountsPrintTemplateProps {
  accounts: Account[];
  title: string;
}

export const AccountsPrintTemplate = ({ accounts, title }: AccountsPrintTemplateProps) => {
  const totalDebit = accounts
    .filter(a => a.account_nature === 'debit')
    .reduce((sum, a) => sum + (a.current_balance || 0), 0);
    
  const totalCredit = accounts
    .filter(a => a.account_nature === 'credit')
    .reduce((sum, a) => sum + (a.current_balance || 0), 0);

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
            padding: 30px;
          }
          .accounts-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .accounts-table th,
          .accounts-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
          }
          .accounts-table th {
            background-color: #166534;
            color: white;
            font-weight: bold;
          }
          .accounts-table tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .total-row {
            background-color: #fef9c3 !important;
            font-weight: bold;
          }
          .debit-amount {
            color: #2563eb;
          }
          .credit-amount {
            color: #dc2626;
          }
          .summary-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f3f4f6;
            border-radius: 8px;
            text-align: center;
          }
        }
      `}</style>
      
      {/* ترويسة الوقف */}
      <PrintHeader title={title} subtitle={`عدد الحسابات: ${accounts.length}`} />

      <table className="accounts-table">
        <thead>
          <tr>
            <th>الرمز</th>
            <th>اسم الحساب</th>
            <th>النوع</th>
            <th>الطبيعة</th>
            <th>الرصيد</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          {accounts.map((account) => (
            <tr key={account.id}>
              <td>{account.code}</td>
              <td>{account.name_ar}</td>
              <td>{getAccountTypeLabel(account.account_type)}</td>
              <td>{account.account_nature === 'debit' ? 'مدين' : 'دائن'}</td>
              <td className={account.account_nature === 'debit' ? 'debit-amount' : 'credit-amount'}>
                {(account.current_balance || 0).toLocaleString()} ر.س
              </td>
              <td>{account.is_active ? 'نشط' : 'غير نشط'}</td>
            </tr>
          ))}
          <tr className="total-row">
            <td colSpan={4}>الإجماليات</td>
            <td>
              <div>مدين: {totalDebit.toLocaleString()} ر.س</div>
              <div>دائن: {totalCredit.toLocaleString()} ر.س</div>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      {/* تذييل الوقف */}
      <PrintFooter />
    </div>
  );
};
