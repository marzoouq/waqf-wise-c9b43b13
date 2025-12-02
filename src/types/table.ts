/**
 * أنواع الجداول المتجاوبة
 */

import { ReactNode } from 'react';

// نوع عام للصفوف
export interface TableRow {
  id: string;
  [key: string]: unknown;
}

// نوع محدد للأعمدة مع دعم Generic
export interface TableColumn<T = TableRow> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => ReactNode;
  className?: string;
  mobileHidden?: boolean;
}

// Props للجدول المتجاوب مع دعم Generic
export interface ResponsiveTableProps<T = TableRow> {
  columns: TableColumn<T>[];
  data: T[];
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  mobileCardView?: boolean;
  mobileCardRender?: (row: T) => ReactNode;
}

// أنواع محددة لبيانات الجداول الشائعة
export interface BeneficiaryTableRow extends TableRow {
  full_name: string;
  national_id: string;
  phone: string;
  category: string;
  status: string;
}


export interface PaymentTableRow extends TableRow {
  payment_number: string;
  payment_date: string;
  amount: number;
  status: string;
}

export interface LoanTableRow extends TableRow {
  loan_number: string;
  loan_amount: number;
  remaining_amount: number;
  status: string;
}
