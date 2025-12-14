import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileImage, CheckCircle, AlertCircle } from 'lucide-react';
import { useInvoiceOCR, ExtractedInvoiceData } from '@/hooks/useInvoiceOCR';
import { OCRConfidenceIndicator } from './OCRConfidenceIndicator';
import { validateVATNumber } from '@/lib/zatca';

interface InvoiceOCRUploadProps {
  onDataExtracted: (data: ExtractedInvoiceData, imageUrl: string) => void;
  onCancel: () => void;
}

export const InvoiceOCRUpload = ({ onDataExtracted, onCancel }: InvoiceOCRUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { extractInvoiceData, isProcessing, extractedData, error, imageUrl } = useInvoiceOCR();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('يرجى اختيار صورة بصيغة JPG, PNG أو ملف PDF');
      return;
    }

    // التحقق من حجم الملف (أقصى 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الملف يجب أن لا يتجاوز 10 ميجابايت');
      return;
    }

    setSelectedFile(file);

    // إنشاء معاينة للصورة
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!selectedFile) return;
    await extractInvoiceData(selectedFile);
  };

  const handleUseData = () => {
    if (extractedData && imageUrl) {
      onDataExtracted(extractedData, imageUrl);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* منطقة رفع الصورة */}
      {!extractedData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              رفع صورة الفاتورة
            </CardTitle>
            <CardDescription>
              ارفع صورة الفاتورة (JPG, PNG, PDF - حتى 10MB) لاستخراج البيانات تلقائياً
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">اضغط لرفع الصورة</span> أو اسحب وأفلت
                  </p>
                  <p className="text-xs text-muted-foreground">
                    JPG, PNG أو PDF (حتى 10MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/jpeg,image/jpg,image/png,application/pdf"
                  onChange={handleFileSelect}
                />
              </label>
            ) : (
              <div className="space-y-4">
                {previewUrl && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden bg-muted">
                    <img
                      src={previewUrl}
                      alt="معاينة الفاتورة"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleProcess}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        جاري التحليل...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="me-2 h-4 w-4" />
                        استخراج البيانات
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    تغيير الصورة
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* عرض البيانات المستخرجة */}
      {extractedData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                تم استخراج البيانات بنجاح
              </CardTitle>
              <CardDescription>
                نسبة الثقة الإجمالية: <strong className="text-primary">{extractedData.overall_confidence}%</strong>
                <br />
                يرجى مراجعة البيانات وتصحيحها إن لزم قبل الاستخدام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* مؤشرات الثقة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(extractedData.confidence_scores).map(([field, confidence]) => (
                  <OCRConfidenceIndicator
                    key={field}
                    fieldName={field}
                    confidence={confidence}
                  />
                ))}
              </div>

              {/* البيانات المستخرجة */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <h4 className="font-semibold mb-2">معلومات الفاتورة</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>الرقم:</strong> {extractedData.invoice_number || 'غير متوفر'}</p>
                    <p><strong>التاريخ:</strong> {extractedData.invoice_date || 'غير متوفر'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">بيانات العميل</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>الاسم:</strong> {extractedData.customer_name || 'غير متوفر'}</p>
                    <p>
                      <strong>الرقم الضريبي:</strong> {extractedData.customer_vat_number || 'غير متوفر'}
                      {extractedData.customer_vat_number && !validateVATNumber(extractedData.customer_vat_number) && (
                        <span className="text-red-600 text-xs me-2">⚠️ رقم غير صحيح</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h4 className="font-semibold mb-2">البنود ({extractedData.items.length})</h4>
                  <div className="space-y-2">
                    {extractedData.items.map((item, index) => (
                      <div key={`item-${index}-${item.description}`} className="p-2 bg-background rounded text-sm">
                        <p><strong>{item.description}</strong></p>
                        <p>الكمية: {item.quantity} × {item.unit_price} ريال = {item.total} ريال</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 border-t pt-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>المجموع قبل الضريبة:</span>
                    <span className="font-semibold">{extractedData.subtotal} ريال</span>
                  </div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>ضريبة القيمة المضافة:</span>
                    <span className="font-semibold">{extractedData.tax_amount} ريال</span>
                  </div>
                  <div className="flex justify-between font-bold text-base">
                    <span>المجموع الإجمالي:</span>
                    <span className="text-primary">{extractedData.total_amount} ريال</span>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex gap-2">
                <Button onClick={handleUseData} className="flex-1">
                  <CheckCircle className="me-2 h-4 w-4" />
                  استخدام هذه البيانات
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  معالجة صورة أخرى
                </Button>
                <Button variant="ghost" onClick={onCancel}>
                  إلغاء
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
