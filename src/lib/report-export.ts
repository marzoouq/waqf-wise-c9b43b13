/**
 * أداة تصدير التقارير
 */

import type { ReportResult, CustomReportTemplate } from "@/services/report.service";
import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * تصدير التقرير إلى Excel
 */
export async function exportToExcel(
  template: CustomReportTemplate,
  result: ReportResult
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(template.name);

  // Add headers
  const headers = result.columns.map((col) => col.label);
  worksheet.addRow(headers);

  // Style header row
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Add data rows
  result.data.forEach((row) => {
    const rowData = result.columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) return "";
      return value;
    });
    worksheet.addRow(rowData);
  });

  // Auto-fit columns
  worksheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const cellLength = cell.value ? String(cell.value).length : 0;
      if (cellLength > maxLength) {
        maxLength = cellLength;
      }
    });
    column.width = Math.min(maxLength + 2, 50);
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${template.name}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * تصدير التقرير إلى PDF
 */
export async function exportToPDF(
  template: CustomReportTemplate,
  result: ReportResult
): Promise<void> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // Add title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(template.name, 14, 15);

  // Add metadata
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString("ar-SA")}`, 14, 22);
  doc.text(`Total Records: ${result.totalCount}`, 14, 28);

  // Prepare table data
  const headers = result.columns.map((col) => col.label);
  const body = result.data.map((row) =>
    result.columns.map((col) => {
      const value = row[col.key];
      if (value === null || value === undefined) return "-";
      if (typeof value === "number") return value.toLocaleString("ar-SA");
      if (typeof value === "boolean") return value ? "Yes" : "No";
      return String(value);
    })
  );

  // Add table
  autoTable(doc, {
    head: [headers],
    body: body,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [66, 139, 202],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Save
  doc.save(`${template.name}.pdf`);
}
