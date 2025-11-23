import { MobileOptimizedLayout } from "@/components/layout/MobileOptimizedLayout";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";

export default function Messages() {
  return (
    <PageErrorBoundary pageName="الرسائل">
      <MobileOptimizedLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">الرسائل الداخلية</h1>
            <p className="text-muted-foreground mt-2">
              تواصل مع الإدارة والموظفين
            </p>
          </div>

          <MessageCenter />
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
