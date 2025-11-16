import { ChatbotInterface } from "@/components/chatbot/ChatbotInterface";

export default function Chatbot() {
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            🤖 المساعد الذكي
          </h1>
          <p className="text-muted-foreground">
            استخدم الذكاء الاصطناعي للحصول على تحليلات فورية ومساعدة في إدارة الوقف
          </p>
        </div>
        
        <ChatbotInterface />
      </div>
    </div>
  );
}
