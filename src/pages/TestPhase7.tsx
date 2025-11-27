import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, Search, Sparkles, Database, CheckCircle, Clock, XCircle, AlertCircle, Brain, FolderTree } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { SmartArchiveFeatures } from "@/components/archive/SmartArchiveFeatures";

export default function TestPhase7() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  // إحصائيات الأرشفة الذكية
  const { data: stats } = useQuery({
    queryKey: ['phase7-stats'],
    queryFn: async () => {
      const [docsRes, ocrRes, tagsRes] = await Promise.all([
        supabase.from('documents').select('id, file_type'),
        supabase.from('ocr_processing_log').select('id, status'),
        supabase.from('document_tags').select('id, tag_type')
      ]);

      const totalDocuments = docsRes.data?.length || 0;
      const pdfDocuments = docsRes.data?.filter(d => d.file_type === 'application/pdf').length || 0;
      
      const totalOCR = ocrRes.data?.length || 0;
      const completedOCR = ocrRes.data?.filter(o => o.status === 'completed').length || 0;
      const processingOCR = ocrRes.data?.filter(o => o.status === 'processing').length || 0;
      const failedOCR = ocrRes.data?.filter(o => o.status === 'failed').length || 0;
      
      const totalTags = tagsRes.data?.length || 0;
      const autoTags = tagsRes.data?.filter(t => t.tag_type === 'auto').length || 0;
      const manualTags = tagsRes.data?.filter(t => t.tag_type === 'manual').length || 0;

      return {
        totalDocuments,
        pdfDocuments,
        totalOCR,
        completedOCR,
        processingOCR,
        failedOCR,
        totalTags,
        autoTags,
        manualTags,
        ocrSuccessRate: totalOCR > 0 ? ((completedOCR / totalOCR) * 100).toFixed(1) : 0
      };
    }
  });

  // سجلات OCR
  const { data: ocrLogs } = useQuery({
    queryKey: ['ocr-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ocr_processing_log')
        .select(`
          *,
          documents (name, file_type)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data || [];
    }
  });

  // البحث الذكي في المحتوى
  const smartSearch = useMutation({
    mutationFn: async (query: string) => {
      const { data, error } = await supabase
        .from('document_ocr_content')
        .select(`
          *,
          documents (id, name, file_type, uploaded_at)
        `)
        .textSearch('extracted_text', query);

      if (error) throw error;
      return data || [];
    },
    onSuccess: (results) => {
      toast({
        title: "نتائج البحث",
        description: `تم العثور على ${results.length} نتيجة`,
      });
    }
  });

  const handleSmartSearch = () => {
    if (searchQuery.trim()) {
      smartSearch.mutate(searchQuery);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار المرحلة السابعة</h1>
          <p className="text-muted-foreground">الأرشفة الذكية والذكاء الاصطناعي</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Sparkles className="w-5 h-5 ml-2 text-purple-500" />
          75% مكتملة
        </Badge>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">المستندات الكلية</p>
                <p className="text-2xl font-bold">{stats?.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">{stats?.pdfDocuments} ملف PDF</p>
              </div>
              <FileText className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معالجة OCR</p>
                <p className="text-2xl font-bold">{stats?.completedOCR} / {stats?.totalOCR}</p>
                <p className="text-xs text-muted-foreground">معدل النجاح {stats?.ocrSuccessRate}%</p>
              </div>
              <Brain className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العلامات التلقائية</p>
                <p className="text-2xl font-bold">{stats?.autoTags}</p>
                <p className="text-xs text-muted-foreground">{stats?.manualTags} يدوية</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">قيد المعالجة</p>
                <p className="text-2xl font-bold">{stats?.processingOCR}</p>
                <p className="text-xs text-red-500">{stats?.failedOCR} فشل</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* البحث الذكي في المحتوى */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            البحث الذكي في محتوى المستندات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="ابحث في محتوى المستندات باستخدام OCR..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSmartSearch()}
            />
            <Button 
              onClick={handleSmartSearch}
              disabled={smartSearch.isPending}
            >
              <Search className="w-4 h-4 ml-2" />
              بحث
            </Button>
          </div>
          
          {smartSearch.data && smartSearch.data.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm font-semibold">النتائج ({smartSearch.data.length}):</p>
              {smartSearch.data.map((result) => (
                <div key={result.id} className="p-3 border rounded-lg hover:bg-accent/50">
                  <p className="font-semibold text-sm">{result.documents?.name}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {result.extracted_text.substring(0, 150)}...
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* سجلات معالجة OCR */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            سجلات معالجة OCR ({ocrLogs?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ocrLogs && ocrLogs.length > 0 ? (
            <div className="space-y-3">
              {ocrLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{log.documents?.name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                      <span>📄 {log.documents?.file_type}</span>
                      <span>⏱️ {format(new Date(log.created_at), 'dd MMM yyyy - HH:mm', { locale: ar })}</span>
                      {log.processing_time_ms && (
                        <span>⚡ {(log.processing_time_ms / 1000).toFixed(1)}s</span>
                      )}
                    </div>
                    {log.error_message && (
                      <p className="text-xs text-red-500 mt-1">⚠️ {log.error_message}</p>
                    )}
                  </div>
                  <div className="text-left">
                    <Badge variant={
                      log.status === 'completed' ? 'default' :
                      log.status === 'processing' ? 'secondary' : 'destructive'
                    }>
                      {log.status === 'completed' && <CheckCircle className="w-3 h-3 ml-1" />}
                      {log.status === 'processing' && <Clock className="w-3 h-3 ml-1" />}
                      {log.status === 'failed' && <XCircle className="w-3 h-3 ml-1" />}
                      {log.status === 'completed' ? 'مكتمل' :
                       log.status === 'processing' ? 'جاري المعالجة' : 'فشل'}
                    </Badge>
                    {log.confidence_score && (
                      <p className="text-xs text-muted-foreground mt-1">
                        دقة: {(log.confidence_score * 100).toFixed(0)}%
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد سجلات OCR</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* الميزات الذكية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            حالة الميزات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">معالجة OCR</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                استخراج النصوص من المستندات بالذكاء الاصطناعي
              </p>
              <Badge variant="default" className="mt-2">نشط</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">البحث الذكي</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                بحث متقدم في محتوى النصوص المستخرجة
              </p>
              <Badge variant="default" className="mt-2">نشط</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <h4 className="font-semibold">التصنيف التلقائي</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                تصنيف المستندات تلقائياً حسب المحتوى
              </p>
              <Badge variant="secondary" className="mt-2">تجريبي</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FolderTree className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold">التنظيم الذكي</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                تنظيم الملفات تلقائياً في مجلدات ذكية
              </p>
              <Badge variant="outline" className="mt-2">قادم قريباً</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* مكونات SmartArchiveFeatures */}
      <SmartArchiveFeatures />

      {/* ملخص التحسينات */}
      <Card className="border-2 border-purple-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            ملخص تحسينات المرحلة السابعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✅ تم إنجازه:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• معالجة {stats?.completedOCR} مستند بتقنية OCR</li>
                <li>• استخراج نصوص بدقة {stats?.ocrSuccessRate}%</li>
                <li>• إضافة {stats?.autoTags} علامة تلقائية</li>
                <li>• تفعيل البحث الذكي في المحتوى</li>
                <li>• تسجيل {ocrLogs?.length} عملية OCR</li>
                <li>• دعم ملفات PDF بالكامل</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🔧 الميزات الجديدة:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• OCR باستخدام Lovable AI (Gemini)</li>
                <li>• بحث نصي كامل في المستندات</li>
                <li>• تتبع حالة المعالجة لحظياً</li>
                <li>• حساب معدل الدقة تلقائياً</li>
                <li>• رصد الأخطاء والمشاكل</li>
                <li>• واجهة اختبار تفاعلية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
