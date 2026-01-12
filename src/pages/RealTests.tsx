import { Link } from "react-router-dom";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TestTube, UserCheck, ShieldCheck, Activity } from "lucide-react";

export default function RealTests() {
  return (
    <PageErrorBoundary pageName="الاختبارات الحقيقية">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الاختبارات الحقيقية"
          description="صفحة تحقق من تدفقات العمل الفعلية (مبدئياً لتجنب 404)"
          icon={<TestTube className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />

        <Card>
          <CardHeader>
            <CardTitle>مسار جاهز</CardTitle>
            <CardDescription>
              تم إنشاء الصفحة لتفادي ظهور 404 عند فتحها من القائمة.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-3">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/users">
                <UserCheck className="h-4 w-4" />
                المستخدمون
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/security">
                <ShieldCheck className="h-4 w-4" />
                الأمان
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/system-monitoring">
                <Activity className="h-4 w-4" />
                النظام
              </Link>
            </Button>
          </CardContent>
        </Card>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
