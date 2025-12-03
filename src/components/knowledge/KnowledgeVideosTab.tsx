/**
 * Knowledge Videos Tab Component
 * تبويب الفيديوهات في قاعدة المعرفة
 */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video } from "lucide-react";

export function KnowledgeVideosTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>شروحات الفيديو</CardTitle>
        <CardDescription>
          دروس مرئية لاستخدام النظام
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="overflow-hidden">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Video className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardContent className="pt-4">
                <h3 className="font-semibold">درس {n}: مقدمة للنظام</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  المدة: {5 + n} دقائق
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
