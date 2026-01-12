import { Link } from "react-router-dom";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, Play, ShieldCheck } from "lucide-react";

export default function ComprehensiveTest() {
  return (
    <PageErrorBoundary pageName="الاختبارات الشاملة">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الاختبارات الشاملة"
          description="صفحة تشغيل سيناريوهات الاختبار والتحقق السريع"
          icon={<TestTube className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>قيد الإعداد</CardTitle>
            <CardDescription>
              تم إنشاء المسار لتجنب 404. يمكنك حالياً استخدام أدوات المراقبة والأمان من الروابط أدناه.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/system-monitoring">
                <Play className="h-4 w-4" />
                مراقبة النظام
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/security">
                <ShieldCheck className="h-4 w-4" />
                لوحة الأمان
              </Link>
            </Button>
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
