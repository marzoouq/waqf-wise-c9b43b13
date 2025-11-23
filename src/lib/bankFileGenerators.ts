/**
 * مولدات ملفات التحويل البنكي
 * المرحلة 8: التكامل البنكي
 */

export interface BankTransferRecord {
  beneficiary_name: string;
  account_number: string;
  iban?: string;
  amount: number;
  reference: string;
  description?: string;
}

/**
 * تصدير ملف CSV للبنوك المحلية (الراجحي، الأهلي، الرياض)
 */
export function generateCSVFile(records: BankTransferRecord[]): string {
  const headers = [
    'اسم المستفيد',
    'رقم الحساب',
    'الآيبان',
    'المبلغ',
    'المرجع',
    'البيان'
  ].join(',');

  const rows = records.map(record => [
    record.beneficiary_name,
    record.account_number,
    record.iban || '',
    record.amount.toFixed(2),
    record.reference,
    record.description || ''
  ].join(','));

  return [headers, ...rows].join('\n');
}

/**
 * تصدير ملف MT940 للبنوك الدولية
 */
export function generateMT940File(
  records: BankTransferRecord[],
  accountNumber: string,
  date: Date = new Date()
): string {
  const formatDate = (d: Date) => {
    const year = d.getFullYear().toString().slice(-2);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return year + month + day;
  };

  const lines: string[] = [];
  
  // Header
  lines.push(':20:TRANSFER' + formatDate(date));
  lines.push(':25:' + accountNumber);
  lines.push(':28C:1/1');
  lines.push(':60F:C' + formatDate(date) + 'SAR0,00');

  // Transactions
  records.forEach((record, index) => {
    lines.push(':61:' + formatDate(date) + 'C' + record.amount.toFixed(2).replace('.', ',') + 'NTRF');
    lines.push(':86:' + record.reference + ' ' + record.beneficiary_name);
  });

  // Footer
  const total = records.reduce((sum, r) => sum + r.amount, 0);
  lines.push(':62F:C' + formatDate(date) + 'SAR' + total.toFixed(2).replace('.', ','));

  return lines.join('\n');
}

/**
 * تصدير ملف ISO20022 XML
 */
export function generateISO20022XML(
  records: BankTransferRecord[],
  senderName: string,
  senderAccount: string,
  msgId: string = `MSG${Date.now()}`
): string {
  const formatDate = () => new Date().toISOString();
  const total = records.reduce((sum, r) => sum + r.amount, 0);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.03">\n';
  xml += '  <CstmrCdtTrfInitn>\n';
  xml += '    <GrpHdr>\n';
  xml += `      <MsgId>${msgId}</MsgId>\n`;
  xml += `      <CreDtTm>${formatDate()}</CreDtTm>\n`;
  xml += `      <NbOfTxs>${records.length}</NbOfTxs>\n`;
  xml += `      <CtrlSum>${total.toFixed(2)}</CtrlSum>\n`;
  xml += '      <InitgPty>\n';
  xml += `        <Nm>${senderName}</Nm>\n`;
  xml += '      </InitgPty>\n';
  xml += '    </GrpHdr>\n';
  xml += '    <PmtInf>\n';
  xml += `      <PmtInfId>PMTINF${Date.now()}</PmtInfId>\n`;
  xml += '      <PmtMtd>TRF</PmtMtd>\n';
  xml += '      <NbOfTxs>' + records.length + '</NbOfTxs>\n';
  xml += `      <CtrlSum>${total.toFixed(2)}</CtrlSum>\n`;
  xml += '      <ReqdExctnDt>' + new Date().toISOString().split('T')[0] + '</ReqdExctnDt>\n';
  xml += '      <Dbtr>\n';
  xml += `        <Nm>${senderName}</Nm>\n`;
  xml += '      </Dbtr>\n';
  xml += '      <DbtrAcct>\n';
  xml += '        <Id>\n';
  xml += `          <IBAN>${senderAccount}</IBAN>\n`;
  xml += '        </Id>\n';
  xml += '      </DbtrAcct>\n';

  records.forEach((record, index) => {
    xml += '      <CdtTrfTxInf>\n';
    xml += '        <PmtId>\n';
    xml += `          <EndToEndId>${record.reference}</EndToEndId>\n`;
    xml += '        </PmtId>\n';
    xml += '        <Amt>\n';
    xml += `          <InstdAmt Ccy="SAR">${record.amount.toFixed(2)}</InstdAmt>\n`;
    xml += '        </Amt>\n';
    xml += '        <Cdtr>\n';
    xml += `          <Nm>${record.beneficiary_name}</Nm>\n`;
    xml += '        </Cdtr>\n';
    xml += '        <CdtrAcct>\n';
    xml += '          <Id>\n';
    if (record.iban) {
      xml += `            <IBAN>${record.iban}</IBAN>\n`;
    } else {
      xml += `            <Othr><Id>${record.account_number}</Id></Othr>\n`;
    }
    xml += '          </Id>\n';
    xml += '        </CdtrAcct>\n';
    if (record.description) {
      xml += '        <RmtInf>\n';
      xml += `          <Ustrd>${record.description}</Ustrd>\n`;
      xml += '        </RmtInf>\n';
    }
    xml += '      </CdtTrfTxInf>\n';
  });

  xml += '    </PmtInf>\n';
  xml += '  </CstmrCdtTrfInitn>\n';
  xml += '</Document>';

  return xml;
}

/**
 * تنزيل الملف
 */
export function downloadFile(content: string, filename: string, type: string = 'text/plain') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
