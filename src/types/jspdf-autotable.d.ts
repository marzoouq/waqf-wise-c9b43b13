/**
 * Type definitions for jspdf-autotable
 * Provides type safety for autoTable method on jsPDF
 */

import 'jspdf';

declare module 'jspdf' {
  interface AutoTableOptions {
    startY?: number;
    head?: (string | number)[][];
    body?: (string | number | null)[][];
    foot?: (string | number)[][];
    styles?: {
      font?: string;
      fontStyle?: string;
      fontSize?: number;
      halign?: 'left' | 'center' | 'right';
      valign?: 'top' | 'middle' | 'bottom';
      fillColor?: number[] | string;
      textColor?: number[] | string;
      lineColor?: number[] | string;
      lineWidth?: number;
      cellPadding?: number | { top?: number; right?: number; bottom?: number; left?: number };
      minCellHeight?: number;
      minCellWidth?: number;
      overflow?: 'linebreak' | 'ellipsize' | 'visible' | 'hidden';
    };
    headStyles?: AutoTableOptions['styles'];
    bodyStyles?: AutoTableOptions['styles'];
    footStyles?: AutoTableOptions['styles'];
    alternateRowStyles?: AutoTableOptions['styles'];
    columnStyles?: Record<string | number, AutoTableOptions['styles'] & { cellWidth?: number | 'auto' | 'wrap' }>;
    margin?: number | { top?: number; right?: number; bottom?: number; left?: number };
    tableWidth?: number | 'auto' | 'wrap';
    theme?: 'striped' | 'grid' | 'plain';
    showHead?: 'everyPage' | 'firstPage' | 'never';
    showFoot?: 'everyPage' | 'lastPage' | 'never';
    tableLineColor?: number[] | string;
    tableLineWidth?: number;
    didDrawPage?: (data: { pageNumber: number; pageCount: number; table: unknown }) => void;
    didDrawCell?: (data: { cell: unknown; row: unknown; column: unknown }) => void;
    willDrawCell?: (data: { cell: unknown; row: unknown; column: unknown }) => void;
  }

  interface jsPDF {
    autoTable: (options: AutoTableOptions) => jsPDF;
    lastAutoTable?: {
      finalY: number;
      pageNumber: number;
      pageCount: number;
    };
  }
}
