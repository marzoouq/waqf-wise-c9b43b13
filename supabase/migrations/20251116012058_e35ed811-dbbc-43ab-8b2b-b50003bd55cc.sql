-- جدول لحفظ محادثات الـ chatbot
CREATE TABLE IF NOT EXISTS public.chatbot_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT,
  message_type TEXT NOT NULL CHECK (message_type IN ('user', 'bot')),
  quick_reply_id TEXT,
  context JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- جدول لحفظ تفضيلات الردود السريعة
CREATE TABLE IF NOT EXISTS public.chatbot_quick_replies (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  icon TEXT,
  prompt TEXT NOT NULL,
  category TEXT,
  order_index INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- إدخال بيانات أولية للردود السريعة
INSERT INTO public.chatbot_quick_replies (id, text, icon, prompt, category, order_index) VALUES
('balance', '💰 رصيد المستفيدين', '💰', 'ما هو إجمالي رصيد المستفيدين الحالي؟ أعطني معلومات عن عدد المستفيدين النشطين وحالتهم المالية.', 'financial', 1),
('reports', '📊 التقارير المالية', '📊', 'أعطني ملخص شامل للحالة المالية الحالية للوقف، بما في ذلك الإيرادات والمصروفات.', 'financial', 2),
('properties', '🏢 العقارات', '🏢', 'ما هي حالة العقارات والإيجارات؟ كم عدد العقارات المؤجرة والشاغرة؟', 'properties', 3),
('requests', '📝 الطلبات المعلقة', '📝', 'كم عدد الطلبات المعلقة التي تحتاج موافقة؟ أعطني تفاصيل عن أنواع الطلبات.', 'requests', 4),
('distributions', '📤 التوزيعات', '📤', 'ما هي آخر التوزيعات المالية؟ ومتى تم آخر توزيع؟', 'distributions', 5),
('help', '❓ مساعدة', '❓', 'ما الذي يمكنك مساعدتي به؟ ما هي المعلومات التي يمكنك تقديمها؟', 'help', 6)
ON CONFLICT (id) DO NOTHING;

-- تفعيل RLS
ALTER TABLE public.chatbot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_quick_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies للمحادثات
CREATE POLICY "Users can view own conversations"
  ON public.chatbot_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON public.chatbot_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON public.chatbot_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies للردود السريعة
CREATE POLICY "Anyone authenticated can view active quick replies"
  ON public.chatbot_quick_replies FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- إنشاء indexes لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_user_id 
  ON public.chatbot_conversations(user_id);

CREATE INDEX IF NOT EXISTS idx_chatbot_conversations_created_at 
  ON public.chatbot_conversations(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chatbot_quick_replies_order 
  ON public.chatbot_quick_replies(order_index) 
  WHERE is_active = true;