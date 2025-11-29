import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";
import { PageErrorBoundary } from "@/components/shared/PageErrorBoundary";
import { MobileOptimizedLayout, MobileOptimizedHeader } from "@/components/layout/MobileOptimizedLayout";
import { Bot } from "lucide-react";

export default function Chatbot() {
  return (
    <PageErrorBoundary pageName="المساعد الذكي">
      <MobileOptimizedLayout>
        <MobileOptimizedHeader
          title="المساعد الذكي"
          description="استخدم الذكاء الاصطناعي للحصول على تحليلات فورية ومساعدة في إدارة الوقف"
          icon={<Bot className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary" />}
        />
        
        <div className="max-w-5xl mx-auto">
          <ChatbotInterface />
        </div>
      </MobileOptimizedLayout>
    </PageErrorBoundary>
  );
}
