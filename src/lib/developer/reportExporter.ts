interface ExportData {
  timestamp: string;
  type: string;
  data: any[];
}

export const reportExporter = {
  exportToJSON: (data: any[], filename: string = 'report') => {
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

  exportToCSV: (data: any[], filename: string = 'report') => {
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

  exportWebVitals: (vitals: any) => {
    const data = [
      { metric: 'LCP', value: vitals.lcp, rating: vitals.lcp_rating, unit: 'ms' },
      { metric: 'FCP', value: vitals.fcp, rating: vitals.fcp_rating, unit: 'ms' },
      { metric: 'CLS', value: vitals.cls, rating: vitals.cls_rating, unit: '' },
      { metric: 'INP', value: vitals.inp, rating: vitals.inp_rating, unit: 'ms' },
      { metric: 'TTFB', value: vitals.ttfb, rating: vitals.ttfb_rating, unit: 'ms' },
    ];

    return {
      json: () => reportExporter.exportToJSON(data, 'web-vitals'),
      csv: () => reportExporter.exportToCSV(data, 'web-vitals'),
    };
  },

  exportNetworkStats: (requests: any[]) => {
    const data = requests.map(req => ({
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

  exportErrors: (errors: any[]) => {
    const data = errors.map(err => ({
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
