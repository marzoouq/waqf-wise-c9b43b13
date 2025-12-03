import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from "@/lib/toast";

interface BatchPaymentProcessorProps {
  distributionId: string;
  totalBeneficiaries: number;
  batchSize?: number;
  onComplete?: () => void;
}

interface BatchStatus {
  batchNumber: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed: number;
  total: number;
  errors: string[];
}

export function BatchPaymentProcessor({
  distributionId,
  totalBeneficiaries,
  batchSize = 50,
  onComplete,
}: BatchPaymentProcessorProps) {
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [batches, setBatches] = useState<BatchStatus[]>([]);
  const [currentBatch, setCurrentBatch] = useState(0);

  const totalBatches = Math.ceil(totalBeneficiaries / batchSize);

  const initializeBatches = () => {
    const newBatches: BatchStatus[] = [];
    for (let i = 0; i < totalBatches; i++) {
      newBatches.push({
        batchNumber: i + 1,
        status: 'pending',
        processed: 0,
        total: Math.min(batchSize, totalBeneficiaries - i * batchSize),
        errors: [],
      });
    }
    setBatches(newBatches);
  };

  const processBatch = async (batchIndex: number): Promise<boolean> => {
    if (isPaused) return false;

    // تحديث حالة الدفعة
    setBatches(prev => {
      const updated = [...prev];
      updated[batchIndex].status = 'processing';
      return updated;
    });

    try {
      // محاكاة معالجة الدفعة (في الواقع، هنا سيتم استدعاء API)
      const batch = batches[batchIndex];
      
      for (let i = 0; i < batch.total; i++) {
        if (isPaused) {
          throw new Error('تم إيقاف المعالجة مؤقتاً');
        }

        // محاكاة معالجة كل عنصر في الدفعة
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // محاكاة نسبة نجاح 95%
        const success = Math.random() > 0.05;
        
        if (!success) {
          setBatches(prev => {
            const updated = [...prev];
            updated[batchIndex].errors.push(`فشل معالجة العنصر ${i + 1}`);
            return updated;
          });
        }

        // تحديث التقدم
        setBatches(prev => {
          const updated = [...prev];
          updated[batchIndex].processed = i + 1;
          return updated;
        });
      }

      // نجاح الدفعة
      setBatches(prev => {
        const updated = [...prev];
        updated[batchIndex].status = 'completed';
        return updated;
      });

      return true;
    } catch (error) {
      // فشل الدفعة
      setBatches(prev => {
        const updated = [...prev];
        updated[batchIndex].status = 'failed';
        updated[batchIndex].errors.push(
          error instanceof Error ? error.message : 'خطأ غير متوقع'
        );
        return updated;
      });

      return false;
    }
  };

  const startProcessing = async () => {
    if (batches.length === 0) {
      initializeBatches();
    }

    setIsProcessing(true);
    setIsPaused(false);

    for (let i = currentBatch; i < totalBatches; i++) {
      if (isPaused) {
        setCurrentBatch(i);
        break;
      }

      const success = await processBatch(i);
      
      if (!success && batches[i].errors.length > 0) {
        // إعادة المحاولة مرة واحدة للدفعات الفاشلة
        await new Promise(resolve => setTimeout(resolve, 2000));
        await processBatch(i);
      }

      setCurrentBatch(i + 1);
    }

    if (!isPaused) {
      setIsProcessing(false);
      
      const failedBatches = batches.filter(b => b.status === 'failed');
      
      if (failedBatches.length === 0) {
        toast({
          title: 'اكتملت المعالجة',
          description: `تم معالجة ${totalBeneficiaries} مستفيد بنجاح`,
        });
        onComplete?.();
      } else {
        toast({
          title: 'اكتملت المعالجة مع أخطاء',
          description: `فشلت ${failedBatches.length} دفعة من أصل ${totalBatches}`,
          variant: 'destructive',
        });
      }
    }
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    toast({
      title: 'تم الإيقاف مؤقتاً',
      description: 'يمكنك استئناف المعالجة في أي وقت',
    });
  };

  const resumeProcessing = () => {
    setIsPaused(false);
    startProcessing();
  };

  const retryFailedBatches = async () => {
    const failedIndices = batches
      .map((b, i) => (b.status === 'failed' ? i : -1))
      .filter(i => i !== -1);

    setIsProcessing(true);
    setIsPaused(false);

    for (const index of failedIndices) {
      await processBatch(index);
    }

    setIsProcessing(false);
  };

  const totalProcessed = batches.reduce((sum, b) => sum + b.processed, 0);
  const overallProgress = (totalProcessed / totalBeneficiaries) * 100;
  const completedBatches = batches.filter(b => b.status === 'completed').length;
  const failedBatches = batches.filter(b => b.status === 'failed').length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>معالجة المدفوعات على دفعات</CardTitle>
        <CardDescription>
          معالجة {totalBeneficiaries} مستفيد على {totalBatches} دفعة ({batchSize} مستفيد/دفعة)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* التقدم الإجمالي */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">التقدم الإجمالي</span>
            <span className="text-muted-foreground">
              {totalProcessed} / {totalBeneficiaries} ({overallProgress.toFixed(1)}%)
            </span>
          </div>
          <Progress value={overallProgress} className="h-3" />
        </div>

        {/* الإحصائيات */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-primary">{completedBatches}</p>
            <p className="text-xs text-muted-foreground">دفعات مكتملة</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-amber-600">{currentBatch}</p>
            <p className="text-xs text-muted-foreground">دفعة حالية</p>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <p className="text-2xl font-bold text-red-600">{failedBatches}</p>
            <p className="text-xs text-muted-foreground">دفعات فاشلة</p>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex gap-2">
          {!isProcessing && batches.length === 0 && (
            <Button onClick={startProcessing} className="flex-1">
              <Play className="h-4 w-4 ml-2" />
              بدء المعالجة
            </Button>
          )}
          
          {isProcessing && !isPaused && (
            <Button onClick={pauseProcessing} variant="outline" className="flex-1">
              <Pause className="h-4 w-4 ml-2" />
              إيقاف مؤقت
            </Button>
          )}
          
          {isPaused && (
            <Button onClick={resumeProcessing} className="flex-1">
              <Play className="h-4 w-4 ml-2" />
              استئناف
            </Button>
          )}
          
          {failedBatches > 0 && !isProcessing && (
            <Button onClick={retryFailedBatches} variant="destructive" className="flex-1">
              <AlertCircle className="h-4 w-4 ml-2" />
              إعادة محاولة الفاشلة ({failedBatches})
            </Button>
          )}
        </div>

        {/* قائمة الدفعات */}
        {batches.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">تفاصيل الدفعات</h4>
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {batches.map((batch) => (
                  <Card key={batch.batchNumber} className={
                    batch.status === 'completed' ? 'border-emerald-500' :
                    batch.status === 'failed' ? 'border-red-500' :
                    batch.status === 'processing' ? 'border-blue-500' :
                    ''
                  }>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">الدفعة #{batch.batchNumber}</span>
                          <Badge variant={
                            batch.status === 'completed' ? 'default' :
                            batch.status === 'failed' ? 'destructive' :
                            batch.status === 'processing' ? 'secondary' :
                            'outline'
                          }>
                            {batch.status === 'pending' && 'معلق'}
                            {batch.status === 'processing' && 'جاري المعالجة'}
                            {batch.status === 'completed' && 'مكتمل'}
                            {batch.status === 'failed' && 'فشل'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          {batch.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                          {batch.status === 'failed' && <XCircle className="h-4 w-4 text-red-600" />}
                          {batch.status === 'processing' && <Loader2 className="h-4 w-4 animate-spin text-blue-600" />}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>التقدم:</span>
                          <span>{batch.processed} / {batch.total}</span>
                        </div>
                        <Progress 
                          value={(batch.processed / batch.total) * 100} 
                          className="h-1.5"
                        />
                      </div>

                      {batch.errors.length > 0 && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertDescription className="text-xs">
                            {batch.errors.slice(0, 2).map((error, i) => (
                              <p key={i}>• {error}</p>
                            ))}
                            {batch.errors.length > 2 && (
                              <p className="text-muted-foreground">
                                +{batch.errors.length - 2} أخطاء أخرى
                              </p>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
