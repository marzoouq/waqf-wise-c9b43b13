/**
 * أنواع بيانات jsPDF مع autoTable
 * jsPDF with autoTable TypeScript Definitions
 */

import { jsPDF } from 'jspdf';

export interface AutoTableOptions {
  startY?: number;
  head?: string[][];
  body?: string[][];
  styles?: {
    font?: string;
    halign?: 'left' | 'center' | 'right';
    fontSize?: number;
  };
  headStyles?: {
    fillColor?: number[];
    textColor?: number | number[];
  };
}

export interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
  autoTable: (options: AutoTableOptions) => void;
}

/**
 * دالة مساعدة لتحويل jsPDF إلى jsPDFWithAutoTable
 */
export function withAutoTable(doc: jsPDF): jsPDFWithAutoTable {
  return doc as jsPDFWithAutoTable;
}
