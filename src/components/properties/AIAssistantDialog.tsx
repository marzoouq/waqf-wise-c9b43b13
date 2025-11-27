import { useState } from "react";
import { productionLogger } from "@/lib/logger/production-logger";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface AIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyData?: Record<string, any>;
  actionType: "analyze_property" | "suggest_maintenance" | "predict_revenue" | "optimize_contracts" | "alert_insights";
}

export function AIAssistantDialog({ open, onOpenChange, propertyData, actionType }: AIAssistantDialogProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");

  const actionTitles = {
    analyze_property: "تحليل العقار بالذكاء الاصطناعي",
    suggest_maintenance: "اقتراح خطة صيانة ذكية",
    predict_revenue: "توقع الإيرادات المستقبلية",
    optimize_contracts: "تحسين العقود",
    alert_insights: "تحليل التنبيهات والمخاطر"
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const { data, error } = await supabase.functions.invoke('property-ai-assistant', {
        body: {
          action: actionType,
          data: propertyData
        }
      });

      if (error) throw error;

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setAnalysis(data.analysis);
      toast.success("تم التحليل بنجاح!");
    } catch (error) {
      productionLogger.error("AI Analysis Error:", error);
      toast.error("حدث خطأ أثناء التحليل");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            {actionTitles[actionType]}
          </DialogTitle>
          <DialogDescription>
            استخدم الذكاء الاصطناعي للحصول على رؤى وتوصيات متقدمة
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!analysis && (
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-primary mt-1" />
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">ما الذي سيفعله الذكاء الاصطناعي:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {actionType === "analyze_property" && (
                        <>
                          <li>تحليل العائد على الاستثمار (ROI)</li>
                          <li>توصيات لتحسين الإيرادات</li>
                          <li>تقييم الموقع والطلب</li>
                          <li>مقترحات للصيانة والتطوير</li>
                        </>
                      )}
                      {actionType === "suggest_maintenance" && (
                        <>
                          <li>جدول صيانة دورية شامل</li>
                          <li>أولويات الصيانة العاجلة</li>
                          <li>تقدير التكاليف المتوقعة</li>
                          <li>توصيات لتقليل التكاليف</li>
                        </>
                      )}
                      {actionType === "predict_revenue" && (
                        <>
                          <li>توقعات الإيرادات للـ 6 أشهر القادمة</li>
                          <li>تحليل الاتجاهات والأنماط</li>
                          <li>عوامل المخاطر المحتملة</li>
                          <li>توصيات لزيادة الإيرادات</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {analysis && (
            <Card>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إغلاق
            </Button>
            {!analysis && (
              <Button onClick={handleAnalyze} disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                    جاري التحليل...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 ml-2" />
                    تحليل الآن
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}