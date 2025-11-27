/**
 * أدوات تصدير التقارير للمطورين
 */

// أنواع البيانات المدعومة للتصدير
interface ExportableRecord {
  [key: string]: string | number | boolean | null | undefined;
}

interface ExportData {
  timestamp: string;
  type: string;
  data: ExportableRecord[];
}

interface WebVitalsData {
  lcp?: number;
  lcp_rating?: string;
  fcp?: number;
  fcp_rating?: string;
  cls?: number;
  cls_rating?: string;
  inp?: number;
  inp_rating?: string;
  ttfb?: number;
  ttfb_rating?: string;
}

interface NetworkRequest {
  method: string;
  url: string;
  status: number;
  duration: number;
  timestamp: number;
}

interface ErrorLog {
  error_type: string;
  error_message: string;
  severity: string;
  status: string;
  created_at: string;
}

export const reportExporter = {
  exportToJSON: (data: ExportableRecord[], filename: string = 'report') => {
    const exportData: ExportData = {
      timestamp: new Date().toISOString(),
      type: 'json',
      data,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    downloadBlob(blob, `${filename}-${Date.now()}.json`);
  },

  exportToCSV: (data: ExportableRecord[], filename: string = 'report') => {
    if (!data || data.length === 0) {
      throw new Error('No data to export');
    }

    // استخراج العناوين
    const headers = Object.keys(data[0]);
    
    // بناء CSV
    const csvRows = [
      headers.join(','), // العناوين
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          // معالجة القيم التي تحتوي على فواصل أو علامات اقتباس
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        }).join(',')
      )
    ];

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    downloadBlob(blob, `${filename}-${Date.now()}.csv`);
  },

  exportWebVitals: (vitals: WebVitalsData) => {
    const data: ExportableRecord[] = [
      { metric: 'LCP', value: vitals.lcp ?? 0, rating: vitals.lcp_rating ?? '', unit: 'ms' },
      { metric: 'FCP', value: vitals.fcp ?? 0, rating: vitals.fcp_rating ?? '', unit: 'ms' },
      { metric: 'CLS', value: vitals.cls ?? 0, rating: vitals.cls_rating ?? '', unit: '' },
      { metric: 'INP', value: vitals.inp ?? 0, rating: vitals.inp_rating ?? '', unit: 'ms' },
      { metric: 'TTFB', value: vitals.ttfb ?? 0, rating: vitals.ttfb_rating ?? '', unit: 'ms' },
    ];

    return {
      json: () => reportExporter.exportToJSON(data, 'web-vitals'),
      csv: () => reportExporter.exportToCSV(data, 'web-vitals'),
    };
  },

  exportNetworkStats: (requests: NetworkRequest[]) => {
    const data: ExportableRecord[] = requests.map(req => ({
      method: req.method,
      url: req.url,
      status: req.status,
      duration: req.duration,
      timestamp: new Date(req.timestamp).toISOString(),
    }));

    return {
      json: () => reportExporter.exportToJSON(data, 'network-requests'),
      csv: () => reportExporter.exportToCSV(data, 'network-requests'),
    };
  },

  exportErrors: (errors: ErrorLog[]) => {
    const data: ExportableRecord[] = errors.map(err => ({
      type: err.error_type,
      message: err.error_message,
      severity: err.severity,
      status: err.status,
      created_at: err.created_at,
    }));

    return {
      json: () => reportExporter.exportToJSON(data, 'error-logs'),
      csv: () => reportExporter.exportToCSV(data, 'error-logs'),
    };
  },
};

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
