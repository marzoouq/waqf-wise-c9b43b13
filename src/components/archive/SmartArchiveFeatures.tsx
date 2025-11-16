import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  FileSearch,
  ScanText,
  FolderTree,
  Tag,
  Clock,
  Zap,
  Upload,
  Search,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function SmartArchiveFeatures() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleOCRScan = async () => {
    setIsProcessing(true);
    setOcrProgress(0);

    try {
      // محاكاة عملية OCR
      const interval = setInterval(() => {
        setOcrProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 300);

      // استدعاء edge function لـ OCR
      await supabase.functions.invoke('ocr-document', {
        body: { action: 'scan_all' }
      });

      toast({
        title: "اكتمل المسح الضوئي",
        description: "تم استخراج النص من جميع المستندات",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى إدخال نص للبحث",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .or(`title.ilike.%${searchQuery}%,ocr_text.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      toast({
        title: "نتائج البحث",
        description: `تم العثور على ${data.length} مستند`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "حدث خطأ",
        description: error.message,
      });
    }
  };

  const features = [
    {
      icon: ScanText,
      title: "المسح الضوئي الذكي (OCR)",
      description: "استخراج النص من المستندات الممسوحة ضوئياً",
      action: handleOCRScan,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Tag,
      title: "التصنيف التلقائي",
      description: "تصنيف المستندات تلقائياً باستخدام AI",
      action: () => toast({ title: "قريباً", description: "هذه الميزة قيد التطوير" }),
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: FolderTree,
      title: "التنظيم الذكي",
      description: "تنظيم الملفات حسب النوع والتاريخ",
      action: () => toast({ title: "قريباً", description: "هذه الميزة قيد التطوير" }),
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Clock,
      title: "سياسات الاحتفاظ",
      description: "إدارة دورة حياة المستندات",
      action: () => toast({ title: "قريباً", description: "هذه الميزة قيد التطوير" }),
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* البحث الذكي */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="h-5 w-5 text-primary" />
            البحث الذكي في المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث في محتوى المستندات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSmartSearch()}
                className="pr-10"
              />
            </div>
            <Button onClick={handleSmartSearch}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            البحث في عناوين المستندات والنصوص المستخرجة بتقنية OCR
          </p>
        </CardContent>
      </Card>

      {/* مسح OCR */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>جاري معالجة المستندات...</span>
                <span className="font-bold">{ocrProgress}%</span>
              </div>
              <Progress value={ocrProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* الميزات الذكية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            الميزات الذكية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`${feature.bg} rounded-lg p-4 border border-border/50 space-y-3`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 ${feature.color} flex-shrink-0 mt-0.5`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{feature.title}</h4>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={feature.action}
                    disabled={isProcessing}
                  >
                    <Zap className="h-3 w-3 ml-2" />
                    تفعيل
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* إحصائيات الأرشفة */}
      <Card>
        <CardHeader>
          <CardTitle>إحصائيات الأرشيف</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-primary">0</p>
              <p className="text-xs text-muted-foreground mt-1">مستندات معالجة</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-muted-foreground mt-1">تصنيف تلقائي</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-xs text-muted-foreground mt-1">نص مستخرج</p>
            </div>
            <div className="text-center p-3 bg-muted/50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">0 MB</p>
              <p className="text-xs text-muted-foreground mt-1">مساحة مستخدمة</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
