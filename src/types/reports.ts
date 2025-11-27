// قيمة فلتر التقرير
export type FilterValue = string | number | boolean | Date | [number, number] | [Date, Date] | null;

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: FilterValue;
}

export interface CustomReportFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between';
  value: FilterValue;
}

export interface ReportColumn {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'currency';
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

// تقرير مخصص
export interface CustomReport {
  id: string;
  name: string;
  description?: string;
  report_type: string;
  data_source: string;
  columns: ReportColumn[];
  filters: CustomReportFilter[];
  created_at: string;
  updated_at: string;
}
