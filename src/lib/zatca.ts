/**
 * ZATCA (هيئة الزكاة والضريبة والجمارك) QR Code Generator
 * Implements TLV (Tag-Length-Value) encoding as per ZATCA requirements
 * https://zatca.gov.sa/ar/E-Invoicing/Introduction/Guidelines/Documents/E-Invoicing_Simplified_Tax_Invoice_Implementation_Standard_vF.pdf
 */

export interface ZATCAInvoiceData {
  // Tag 1: اسم البائع (Seller Name)
  sellerName: string;
  
  // Tag 2: رقم تسجيل ضريبة القيمة المضافة للبائع (Seller VAT Registration Number)
  sellerVatNumber: string;
  
  // Tag 3: تاريخ الفاتورة (Invoice Date) - ISO 8601 format
  invoiceDate: string;
  
  // Tag 4: إجمالي الفاتورة شامل ضريبة القيمة المضافة (Invoice Total with VAT)
  invoiceTotal: string;
  
  // Tag 5: مجموع ضريبة القيمة المضافة (VAT Total)
  vatTotal: string;
}

/**
 * Convert string to hexadecimal
 */
function toHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Get UTF-8 byte length of string
 */
function getByteLength(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Create TLV (Tag-Length-Value) entry
 */
function createTLV(tag: number, value: string): string {
  const length = getByteLength(value);
  const tagHex = tag.toString(16).padStart(2, '0');
  const lengthHex = length.toString(16).padStart(2, '0');
  const valueHex = toHex(value);
  
  return tagHex + lengthHex + valueHex;
}

/**
 * Generate ZATCA-compliant QR Code data
 */
export function generateZATCAQRData(data: ZATCAInvoiceData): string {
  const tlvData = 
    createTLV(1, data.sellerName) +
    createTLV(2, data.sellerVatNumber) +
    createTLV(3, data.invoiceDate) +
    createTLV(4, data.invoiceTotal) +
    createTLV(5, data.vatTotal);
  
  // Convert hex string to base64
  const hexBytes = tlvData.match(/.{1,2}/g) || [];
  const bytes = new Uint8Array(hexBytes.map(byte => parseInt(byte, 16)));
  const base64 = btoa(String.fromCharCode(...bytes));
  
  return base64;
}

/**
 * Validate VAT number format (Saudi Arabia)
 * Format: 15 digits, starts with 3
 */
export function validateVATNumber(vatNumber: string): boolean {
  const cleanVat = vatNumber.replace(/\s/g, '');
  return /^3\d{14}$/.test(cleanVat);
}

/**
 * Format VAT number for display
 */
export function formatVATNumber(vatNumber: string): string {
  const cleanVat = vatNumber.replace(/\s/g, '');
  if (cleanVat.length !== 15) return vatNumber;
  
  // Format: 300 1234 5678 90123
  return `${cleanVat.slice(0, 3)} ${cleanVat.slice(3, 7)} ${cleanVat.slice(7, 11)} ${cleanVat.slice(11)}`;
}

/**
 * Format currency for ZATCA (2 decimal places)
 */
export function formatZATCACurrency(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Format date for ZATCA (ISO 8601)
 */
export function formatZATCADate(date: Date): string {
  return date.toISOString();
}
