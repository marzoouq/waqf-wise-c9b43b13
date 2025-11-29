import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { MessageCenter } from "@/components/messages/MessageCenter";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MessageSquare } from "lucide-react";

export default function Messages() {
  return (
    <PageErrorBoundary pageName="الرسائل">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="الرسائل الداخلية"
          description="تواصل مع الإدارة والموظفين"
          icon={<MessageSquare className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />
        <MessageCenter />
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
