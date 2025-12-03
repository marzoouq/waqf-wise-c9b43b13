/**
 * Knowledge Downloads Tab Component
 * تبويب التنزيلات في قاعدة المعرفة
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

const DOWNLOADABLE_FILES = [
  "دليل المستخدم الكامل (PDF)",
  "نموذج طلب مستفيد جديد",
  "قالب تقرير مالي",
  "نموذج عقد إيجار",
  "دليل المحاسب السريع"
];

export function KnowledgeDownloadsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>ملفات قابلة للتنزيل</CardTitle>
        <CardDescription>
          أدلة PDF ونماذج وقوالب مفيدة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {DOWNLOADABLE_FILES.map((item) => (
            <div 
              key={`download-${item}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-primary" />
                <span>{item}</span>
              </div>
              <Button variant="outline" size="sm">
                تنزيل
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
