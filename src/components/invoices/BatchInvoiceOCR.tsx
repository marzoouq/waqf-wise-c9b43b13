import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Upload, Loader2, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { useInvoiceOCR } from '@/hooks/useInvoiceOCR';
import { toast } from 'sonner';
import { BatchProcessingResult, InvoiceOCRResult } from '@/types/invoices';

interface BatchInvoiceOCRProps {
  onComplete: (results: BatchProcessingResult[]) => void;
  onCancel: () => void;
}

export const BatchInvoiceOCR = ({ onComplete, onCancel }: BatchInvoiceOCRProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [results, setResults] = useState<BatchProcessingResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { extractInvoiceData } = useInvoiceOCR();

  const handleFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    // التحقق من عدد الملفات
    if (selectedFiles.length > 10) {
      toast.error('يمكنك رفع 10 فواتير كحد أقصى في المرة الواحدة');
      return;
    }

    // التحقق من نوع وحجم الملفات
    const validFiles = selectedFiles.filter(file => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name}: نوع ملف غير مدعوم`);
        return false;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: حجم الملف أكبر من 10MB`);
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    setResults(validFiles.map(file => ({
      file,
      status: 'pending',
    })));
  };

  const processAllFiles = async () => {
    setIsProcessing(true);
    const newResults: BatchProcessingResult[] = [...results];

    for (let i = 0; i < files.length; i++) {
      // تحديث حالة الملف الحالي
      newResults[i].status = 'processing';
      setResults([...newResults]);

      try {
        const result = await extractInvoiceData(files[i]);
        
        if (result.success) {
          newResults[i].status = 'success';
          newResults[i].data = result.data;
          toast.success(`تم معالجة ${files[i].name} بنجاح`);
        } else {
          newResults[i].status = 'error';
          newResults[i].error = result.error;
          toast.error(`فشل معالجة ${files[i].name}`);
        }
      } catch (error) {
        newResults[i].status = 'error';
        newResults[i].error = error instanceof Error ? error.message : 'خطأ غير معروف';
        toast.error(`خطأ في معالجة ${files[i].name}`);
      }

      setResults([...newResults]);
    }

    setIsProcessing(false);
    toast.success('تم الانتهاء من معالجة جميع الفواتير');
  };

  const getProgress = () => {
    const processed = results.filter(r => r.status === 'success' || r.status === 'error').length;
    return (processed / files.length) * 100;
  };

  const getStatusIcon = (status: BatchProcessingResult['status']) => {
    switch (status) {
      case 'pending':
        return <FileImage className="h-5 w-5 text-muted-foreground" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 animate-spin text-primary" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>معالجة دفعة من الفواتير</CardTitle>
        <CardDescription>
          ارفع عدة صور فواتير (حتى 10) لمعالجتها دفعة واحدة
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {files.length === 0 ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/80 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-12 h-12 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground">
                <span className="font-semibold">اضغط لرفع الصور</span> أو اسحب وأفلت
              </p>
              <p className="text-xs text-muted-foreground">
                يمكنك رفع حتى 10 صور (JPG, PNG - حتى 10MB لكل صورة)
              </p>
            </div>
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png"
              multiple
              onChange={handleFilesSelect}
            />
          </label>
        ) : (
          <div className="space-y-4">
            {/* شريط التقدم */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>التقدم</span>
                  <span>{Math.round(getProgress())}%</span>
                </div>
                <Progress value={getProgress()} />
              </div>
            )}

            {/* قائمة الملفات */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {results.map((result) => (
                <div
                  key={result.file.name}
                  className="flex items-center gap-3 p-3 border rounded-lg bg-muted/30"
                >
                  {getStatusIcon(result.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {result.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(result.file.size / 1024).toFixed(1)} KB
                    </p>
                    {result.status === 'error' && (
                      <p className="text-xs text-red-600 mt-1">{result.error}</p>
                    )}
                    {result.status === 'success' && result.data && (
                      <p className="text-xs text-green-600 mt-1">
                        نسبة الثقة: {result.data.overall_confidence}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex gap-2">
              {!isProcessing ? (
                <>
                  <Button
                    onClick={processAllFiles}
                    disabled={files.length === 0}
                    className="flex-1"
                  >
                    بدء المعالجة ({files.length} فاتورة)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setFiles([]);
                      setResults([]);
                    }}
                  >
                    إعادة تعيين
                  </Button>
                  <Button variant="ghost" onClick={onCancel}>
                    إلغاء
                  </Button>
                </>
              ) : (
                <Button disabled className="flex-1">
                  <Loader2 className="me-2 h-4 w-4 animate-spin" />
                  جاري المعالجة...
                </Button>
              )}
            </div>

            {!isProcessing && results.some(r => r.status === 'success') && (
              <Button
                onClick={() => onComplete(results)}
                variant="default"
                className="w-full"
              >
                استخدام البيانات المستخرجة ({results.filter(r => r.status === 'success').length} فاتورة)
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
