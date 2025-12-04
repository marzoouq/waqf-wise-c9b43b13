// Dynamic imports for jsPDF
type JsPDF = any;
type AutoTable = any;

// Add Arabic font support for PDF (using a fallback for now)
const configureArabicPDF = (doc: JsPDF) => {
  // Note: For proper Arabic support, you would need to add a custom Arabic font
  // For now, we'll use the default font with right-to-left text
  doc.setLanguage("ar");
};

export const exportToPDF = async (
  title: string,
  headers: string[],
  data: (string | number | boolean | null | undefined)[][],
  filename: string
) => {
  const [jsPDFModule, autoTableModule] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable')
  ]);
  
  const jsPDF = jsPDFModule.default;
  const autoTable = autoTableModule.default;
  
  const doc = new jsPDF();
  configureArabicPDF(doc);

  // Add title
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.width / 2, 15, { align: "center" });

  // Add date
  doc.setFontSize(10);
  const date = new Date().toLocaleDateString("ar-SA");
  doc.text(`التاريخ: ${date}`, doc.internal.pageSize.width - 20, 25, {
    align: "right",
  });

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: 35,
    styles: {
      font: "helvetica",
      fontSize: 10,
      halign: "right",
    },
    headStyles: {
      fillColor: [34, 139, 34],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  doc.save(`${filename}.pdf`);
};

export const exportToExcel = async (
  data: Record<string, unknown>[],
  filename: string,
  sheetName: string = "Sheet1"
) => {
  const { exportToExcel: excelExport } = await import("@/lib/excel-helper");
  await excelExport(data, filename, sheetName);
};

/**
 * تصدير البيانات إلى CSV مع دعم اللغة العربية
 */
export const exportToCSV = (
  headers: string[],
  rows: (string | number | null | undefined)[][],
  filename: string
) => {
  // إنشاء محتوى CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell ?? ''}"`).join(','))
  ].join('\n');
  
  // إضافة BOM للدعم العربي
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // تحميل الملف
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
};

export const exportFinancialStatementToPDF = async (
  title: string,
  sections: { title: string; items: { label: string; amount: number }[] }[],
  totals: { label: string; amount: number }[],
  filename: string
) => {
  const { default: jsPDF } = await import('jspdf');
  
  const doc = new jsPDF();
  configureArabicPDF(doc);

  let yPosition = 20;

  // Title
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, doc.internal.pageSize.width / 2, yPosition, {
    align: "center",
  });
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const date = new Date().toLocaleDateString("ar-SA");
  doc.text(`كما في: ${date}`, doc.internal.pageSize.width / 2, yPosition, {
    align: "center",
  });
  yPosition += 15;

  // Sections
  doc.setFontSize(11);
  sections.forEach((section) => {
    // Section title
    doc.setFont("helvetica", "bold");
    doc.text(section.title, 20, yPosition);
    yPosition += 7;

    // Section items
    doc.setFont("helvetica", "normal");
    section.items.forEach((item) => {
      const amountText = item.amount.toFixed(2);
      doc.text(item.label, 30, yPosition);
      doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
        align: "right",
      });
      yPosition += 6;
    });

    yPosition += 5;

    // Check if we need a new page
    if (yPosition > doc.internal.pageSize.height - 30) {
      doc.addPage();
      yPosition = 20;
    }
  });

  // Totals
  yPosition += 5;
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, doc.internal.pageSize.width - 20, yPosition);
  yPosition += 7;

  doc.setFont("helvetica", "bold");
  totals.forEach((total) => {
    const amountText = total.amount.toFixed(2);
    doc.text(total.label, 20, yPosition);
    doc.text(amountText, doc.internal.pageSize.width - 30, yPosition, {
      align: "right",
    });
    yPosition += 7;
  });

  doc.save(`${filename}.pdf`);
};
