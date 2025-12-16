import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatVATNumber, formatZATCACurrency } from "@/lib/zatca";
import { Building2, Calendar, Clock, User, Image as ImageIcon } from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { ZATCAQRCode } from "./ZATCAQRCode";
import type { OrganizationSettings } from "@/hooks/governance/useOrganizationSettings";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  invoice_time?: string;
  customer_name: string;
  customer_address?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_vat_number?: string;
  customer_commercial_registration?: string;
  customer_city?: string;
  subtotal: number;
  tax_amount: number;
  tax_rate?: number;
  total_amount: number;
  status: string;
  notes?: string;
  qr_code_data?: string;
  source_image_url?: string;
  ocr_extracted?: boolean;
  ocr_confidence_score?: number;
}

interface InvoiceLine {
  id: string;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
}

interface EnhancedInvoiceViewProps {
  invoice: Invoice;
  lines: InvoiceLine[];
  orgSettings: OrganizationSettings | null;
}

export default function EnhancedInvoiceView({
  invoice,
  lines,
  orgSettings,
}: EnhancedInvoiceViewProps) {
  return (
    <div className="space-y-6 print:space-y-4">
      {/* الصورة الأصلية للفاتورة (إن وجدت) */}
      {invoice.source_image_url && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary">
                <ImageIcon className="h-5 w-5" />
                <h3 className="font-bold">الفاتورة الأصلية</h3>
              </div>
              {invoice.ocr_extracted && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">استخراج تلقائي</span>
                  {invoice.ocr_confidence_score && (
                    <span className="font-mono text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      دقة: {invoice.ocr_confidence_score}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative w-full max-w-2xl mx-auto">
              <img
                src={invoice.source_image_url}
                alt="صورة الفاتورة الأصلية"
                className="w-full h-auto rounded-lg border shadow-sm"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold mb-1">فاتورة ضريبية</h1>
              <p className="text-sm opacity-90">Tax Invoice</p>
            </div>
            <InvoiceStatusBadge status={invoice.status} />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">التاريخ:</span>
              <span>{new Date(invoice.invoice_date).toLocaleDateString("ar-SA")}</span>
              {invoice.invoice_time && (
                <>
                  <Clock className="h-4 w-4 text-muted-foreground me-4" />
                  <span>{invoice.invoice_time}</span>
                </>
              )}
            </div>
            <div className="text-left">
              <span className="text-muted-foreground text-xs">رقم الفاتورة</span>
              <p className="text-lg font-bold text-primary">{invoice.invoice_number}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* معلومات البائع والمشتري */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* معلومات البائع */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <Building2 className="h-5 w-5" />
              <h3 className="font-bold">معلومات البائع</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {orgSettings ? (
              <>
                <div>
                  <p className="font-bold text-lg">{orgSettings.organization_name_ar}</p>
                  {orgSettings.organization_name_en && (
                    <p className="text-xs text-muted-foreground">
                      {orgSettings.organization_name_en}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <span className="text-muted-foreground">الرقم الضريبي:</span>
                  <p className="font-mono font-semibold">
                    {formatVATNumber(orgSettings.vat_registration_number)}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">السجل التجاري:</span>
                  <p className="font-semibold">
                    {orgSettings.commercial_registration_number}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">العنوان:</span>
                  <p>{orgSettings.address_ar}</p>
                  <p className="text-muted-foreground">{orgSettings.city}</p>
                </div>
                {orgSettings.phone && (
                  <div>
                    <span className="text-muted-foreground">الهاتف:</span>
                    <p>{orgSettings.phone}</p>
                  </div>
                )}
                {orgSettings.email && (
                  <div>
                    <span className="text-muted-foreground">البريد:</span>
                    <p>{orgSettings.email}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-muted-foreground italic">
                لم يتم تعيين معلومات المنشأة
              </p>
            )}
          </CardContent>
        </Card>

        {/* معلومات المشتري */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2 text-primary">
              <User className="h-5 w-5" />
              <h3 className="font-bold">معلومات المشتري</h3>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <p className="font-bold text-lg">{invoice.customer_name}</p>
            </div>
            <Separator />
            {invoice.customer_vat_number && (
              <div>
                <span className="text-muted-foreground">الرقم الضريبي:</span>
                <p className="font-mono font-semibold">
                  {formatVATNumber(invoice.customer_vat_number)}
                </p>
              </div>
            )}
            {invoice.customer_commercial_registration && (
              <div>
                <span className="text-muted-foreground">السجل التجاري:</span>
                <p className="font-semibold">
                  {invoice.customer_commercial_registration}
                </p>
              </div>
            )}
            {invoice.customer_address && (
              <div>
                <span className="text-muted-foreground">العنوان:</span>
                <p>{invoice.customer_address}</p>
                {invoice.customer_city && (
                  <p className="text-muted-foreground">{invoice.customer_city}</p>
                )}
              </div>
            )}
            {invoice.customer_phone && (
              <div>
                <span className="text-muted-foreground">الهاتف:</span>
                <p>{invoice.customer_phone}</p>
              </div>
            )}
            {invoice.customer_email && (
              <div>
                <span className="text-muted-foreground">البريد:</span>
                <p>{invoice.customer_email}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* جدول البنود */}
      <Card>
        <CardHeader>
          <h3 className="font-bold">بنود الفاتورة</h3>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted">
                  <TableHead className="text-right font-bold">#</TableHead>
                  <TableHead className="text-right font-bold">الوصف</TableHead>
                  <TableHead className="text-center font-bold">الكمية</TableHead>
                  <TableHead className="text-right font-bold">سعر الوحدة</TableHead>
                  <TableHead className="text-right font-bold">المجموع</TableHead>
                  <TableHead className="text-center font-bold">نسبة ض.ق.م</TableHead>
                  <TableHead className="text-right font-bold">قيمة ض.ق.م</TableHead>
                  <TableHead className="text-right font-bold">الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">{line.line_number}</TableCell>
                    <TableCell>{line.description}</TableCell>
                    <TableCell className="text-center">{line.quantity}</TableCell>
                    <TableCell className="text-right font-mono">
                      {formatZATCACurrency(line.unit_price)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatZATCACurrency(line.subtotal)}
                    </TableCell>
                    <TableCell className="text-center font-semibold">
                      {line.tax_rate}%
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {formatZATCACurrency(line.tax_amount)}
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      {formatZATCACurrency(line.line_total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* الملخص المالي */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex justify-end">
            <div className="w-full md:w-1/2 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">المجموع (غير شامل ض.ق.م):</span>
                <span className="font-mono font-semibold">
                  {formatZATCACurrency(invoice.subtotal)} ريال
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  ضريبة القيمة المضافة ({invoice.tax_rate || 15}%):
                </span>
                <span className="font-mono font-semibold">
                  {formatZATCACurrency(invoice.tax_amount)} ريال
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center text-lg font-bold">
                <span>الإجمالي (شامل ض.ق.م):</span>
                <span className="font-mono text-primary">
                  {formatZATCACurrency(invoice.total_amount)} ريال
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* الملاحظات */}
      {invoice.notes && (
        <Card>
          <CardHeader>
            <h3 className="font-bold">ملاحظات</h3>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {invoice.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* QR Code */}
      {invoice.qr_code_data && orgSettings && (
        <ZATCAQRCode
          data={{
            sellerName: orgSettings.organization_name_ar,
            sellerVatNumber: orgSettings.vat_registration_number,
            invoiceDate: new Date(invoice.invoice_date).toISOString(),
            invoiceTotal: formatZATCACurrency(invoice.total_amount),
            vatTotal: formatZATCACurrency(invoice.tax_amount),
          }}
          size={200}
          className="print:hidden"
        />
      )}
    </div>
  );
}
