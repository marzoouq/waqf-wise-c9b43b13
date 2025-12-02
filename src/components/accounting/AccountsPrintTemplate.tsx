import { format, arLocale as ar } from "@/lib/date";

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
          .accounts-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #333;
            padding-bottom: 20px;
          }
          .accounts-table {
            width: 100%;
            border-collapse: collapse;
          }
          .accounts-table th,
          .accounts-table td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: right;
          }
          .accounts-table th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .total-row {
            background-color: #e3f2fd;
            font-weight: bold;
          }
          .debit-amount {
            color: #2563eb;
          }
          .credit-amount {
            color: #dc2626;
          }
        }
      `}</style>
      
      <div className="accounts-header">
        <h1>{title}</h1>
        <p>تاريخ الطباعة: {format(new Date(), "dd MMMM yyyy", { locale: ar })}</p>
        <p>عدد الحسابات: {accounts.length}</p>
      </div>

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
              <td>{account.account_type}</td>
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
    </div>
  );
};
