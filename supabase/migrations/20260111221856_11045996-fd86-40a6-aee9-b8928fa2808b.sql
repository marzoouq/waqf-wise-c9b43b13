-- =====================================================
-- المرحلة 5: إصلاح سياسات chatbot_conversations
-- =====================================================

-- تغيير من 'public' إلى 'authenticated'
ALTER POLICY "Users can delete own conversations" ON public.chatbot_conversations TO authenticated;
ALTER POLICY "Users can insert own conversations" ON public.chatbot_conversations TO authenticated;
ALTER POLICY "Users can view own conversations" ON public.chatbot_conversations TO authenticated