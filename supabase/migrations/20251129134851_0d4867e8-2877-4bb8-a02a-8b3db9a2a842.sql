-- جدول إعدادات الصفحة الترحيبية
CREATE TABLE IF NOT EXISTS public.landing_page_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key text UNIQUE NOT NULL,
    setting_value jsonb NOT NULL DEFAULT '{}',
    setting_type text NOT NULL DEFAULT 'text', -- text, json, boolean, number
    description text,
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- إضافة RLS
ALTER TABLE public.landing_page_settings ENABLE ROW LEVEL SECURITY;

-- سياسة القراءة للجميع (البيانات عامة)
CREATE POLICY "Landing settings are viewable by everyone"
ON public.landing_page_settings
FOR SELECT
USING (is_active = true);

-- سياسة التعديل للمشرفين فقط
CREATE POLICY "Admins can manage landing settings"
ON public.landing_page_settings
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nazer'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nazer'));

-- إدراج البيانات الافتراضية
INSERT INTO public.landing_page_settings (setting_key, setting_value, setting_type, description) VALUES
-- معلومات الاتصال
('contact_email', '"info@waqf.sa"', 'text', 'البريد الإلكتروني للتواصل'),
('contact_phone', '"+966 50 000 0000"', 'text', 'رقم الهاتف'),
('contact_address', '"الرياض، المملكة العربية السعودية"', 'text', 'العنوان'),

-- روابط التواصل الاجتماعي
('social_twitter', '"https://twitter.com/waqf_sa"', 'text', 'رابط تويتر'),
('social_linkedin', '"https://linkedin.com/company/waqf-sa"', 'text', 'رابط لينكدإن'),

-- نصوص الصفحة
('hero_title', '"منصة إدارة الوقف الإلكترونية"', 'text', 'عنوان الصفحة الرئيسية'),
('hero_subtitle', '"نظام متكامل لإدارة الأوقاف الإسلامية بكفاءة وشفافية"', 'text', 'العنوان الفرعي'),
('footer_description', '"منصة متكاملة لإدارة الأوقاف الإسلامية بكفاءة وشفافية، تدعم توزيع الغلة وإدارة المستفيدين والمحاسبة المتقدمة."', 'text', 'وصف الـ Footer'),

-- محتوى الصفحات القانونية
('privacy_policy', '{"title": "سياسة الخصوصية", "content": "نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. هذه السياسة توضح كيفية جمع واستخدام وحماية معلوماتك."}', 'json', 'سياسة الخصوصية'),
('terms_of_use', '{"title": "شروط الاستخدام", "content": "باستخدامك لهذه المنصة، فإنك توافق على الالتزام بهذه الشروط والأحكام."}', 'json', 'شروط الاستخدام'),
('security_policy', '{"title": "سياسة الأمان", "content": "نحن نستخدم أحدث تقنيات الأمان لحماية بياناتك ومعلوماتك المالية."}', 'json', 'سياسة الأمان'),

-- الأسئلة الشائعة
('faq_items', '[
  {"question": "ما هي منصة الوقف؟", "answer": "منصة إلكترونية متكاملة لإدارة الأوقاف الإسلامية، تشمل إدارة المستفيدين والمحاسبة وتوزيع الغلة."},
  {"question": "كيف يمكنني التسجيل؟", "answer": "يمكنك التسجيل من خلال الضغط على زر التسجيل وملء البيانات المطلوبة."},
  {"question": "هل المنصة آمنة؟", "answer": "نعم، نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك."},
  {"question": "كيف يتم توزيع الغلة؟", "answer": "يتم توزيع الغلة وفق شروط الواقف وبموافقة الناظر من خلال نظام آلي دقيق."}
]', 'json', 'الأسئلة الشائعة')

ON CONFLICT (setting_key) DO NOTHING;

-- Trigger لتحديث updated_at
CREATE OR REPLACE FUNCTION update_landing_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS landing_settings_updated_at ON public.landing_page_settings;
CREATE TRIGGER landing_settings_updated_at
    BEFORE UPDATE ON public.landing_page_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_landing_settings_updated_at();