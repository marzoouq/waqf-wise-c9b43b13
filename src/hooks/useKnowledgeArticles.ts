/**
 * Hook for Knowledge Base Articles
 * خطاف لإدارة مقالات قاعدة المعرفة
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface KnowledgeArticle {
  id: string;
  category: string;
  title: string;
  description: string | null;
  content: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface KnowledgeFAQ {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  is_published: boolean;
}

// Fallback data for when DB is not available
const FALLBACK_ARTICLES: KnowledgeArticle[] = [
  { id: '1', category: "البداية", title: "كيفية استخدام النظام", description: "دليل شامل للبدء في استخدام نظام إدارة الوقف", content: "يوفر النظام مجموعة شاملة من الأدوات لإدارة الوقف بكفاءة...", sort_order: 1, is_published: true, created_at: '', updated_at: '' },
  { id: '2', category: "المستفيدون", title: "إضافة مستفيد جديد", description: "خطوات إضافة وإدارة المستفيدين", content: "لإضافة مستفيد جديد، اذهب إلى قسم المستفيدين...", sort_order: 2, is_published: true, created_at: '', updated_at: '' },
  { id: '3', category: "المالية", title: "إنشاء توزيع جديد", description: "كيفية إنشاء وإدارة التوزيعات المالية", content: "التوزيعات المالية تمر بعدة مراحل موافقات...", sort_order: 3, is_published: true, created_at: '', updated_at: '' },
  { id: '4', category: "التقارير", title: "إنشاء تقرير مخصص", description: "استخدام منشئ التقارير المخصصة", content: "يمكنك إنشاء تقارير مخصصة من خلال منشئ التقارير...", sort_order: 4, is_published: true, created_at: '', updated_at: '' },
  { id: '5', category: "العقارات", title: "إدارة العقود", description: "كيفية إنشاء وتجديد عقود الإيجار", content: "يمكن إدارة العقود من قسم العقارات...", sort_order: 5, is_published: true, created_at: '', updated_at: '' },
  { id: '6', category: "القروض", title: "إدارة القروض والأقساط", description: "كيفية متابعة القروض والأقساط", content: "نظام القروض يدعم جداول السداد التلقائية...", sort_order: 6, is_published: true, created_at: '', updated_at: '' },
  { id: '7', category: "الأمان", title: "إدارة الصلاحيات", description: "كيفية تعيين الأدوار والصلاحيات", content: "يوفر النظام نظام صلاحيات متقدم RBAC...", sort_order: 7, is_published: true, created_at: '', updated_at: '' },
  { id: '8', category: "المحاسبة", title: "شجرة الحسابات", description: "فهم وإدارة شجرة الحسابات", content: "شجرة الحسابات هي الأساس المحاسبي للنظام...", sort_order: 8, is_published: true, created_at: '', updated_at: '' },
  { id: '9', category: "الإشعارات", title: "تفعيل الإشعارات", description: "كيفية استلام الإشعارات الفورية", content: "يمكنك تخصيص تفضيلات الإشعارات من الإعدادات...", sort_order: 9, is_published: true, created_at: '', updated_at: '' },
  { id: '10', category: "النسخ الاحتياطي", title: "النسخ الاحتياطي للبيانات", description: "كيفية عمل نسخ احتياطي واستعادته", content: "يتم النسخ الاحتياطي تلقائياً بشكل يومي...", sort_order: 10, is_published: true, created_at: '', updated_at: '' },
];

const FALLBACK_FAQS: KnowledgeFAQ[] = [
  { id: '1', question: "كيف أقوم بتسجيل مستفيد جديد؟", answer: "اذهب إلى قسم المستفيدون ثم اضغط على إضافة مستفيد. قم بملء جميع الحقول المطلوبة وأرفق المستندات الداعمة.", sort_order: 1, is_published: true },
  { id: '2', question: "كيف يتم اعتماد التوزيعات المالية؟", answer: "التوزيعات تمر بـ 3 مراحل موافقة: المحاسب للمراجعة، الناظر للاعتماد، وأمين الصندوق للتنفيذ.", sort_order: 2, is_published: true },
  { id: '3', question: "ما هي أنواع التقارير المتاحة؟", answer: "النظام يوفر 15+ تقرير مالي وإداري بالإضافة إلى منشئ تقارير مخصصة.", sort_order: 3, is_published: true },
  { id: '4', question: "كيف أقوم بتجديد عقد إيجار؟", answer: "من قسم العقارات > العقود، اختر العقد المطلوب ثم اضغط تجديد. سيتم إنشاء عقد جديد تلقائياً.", sort_order: 4, is_published: true },
  { id: '5', question: "كيف أستطيع تتبع القروض والأقساط؟", answer: "قسم القروض يعرض جميع القروض مع جداول السداد وحالة كل قسط.", sort_order: 5, is_published: true },
  { id: '6', question: "هل يدعم النظام التحويلات البنكية؟", answer: "نعم، النظام يولد ملفات تحويل بنكي بصيغة CSV وExcel وMT940.", sort_order: 6, is_published: true },
  { id: '7', question: "كيف أقوم بعمل نسخة احتياطية؟", answer: "من إعدادات النظام > صيانة النظام > نسخ احتياطي. النسخ التلقائي مفعّل افتراضياً.", sort_order: 7, is_published: true },
  { id: '8', question: "ما هي الأدوار المتاحة في النظام؟", answer: "النظام يدعم 7 أدوار: ناظر، مشرف، محاسب، أمين صندوق، أرشيفي، مستفيد، مستخدم عادي.", sort_order: 8, is_published: true },
  { id: '9', question: "كيف أتلقى الإشعارات؟", answer: "يمكنك تفعيل الإشعارات داخل النظام، عبر البريد الإلكتروني، أو الرسائل القصيرة من الإعدادات.", sort_order: 9, is_published: true },
  { id: '10', question: "هل يمكن تخصيص التقارير؟", answer: "نعم، استخدم منشئ التقارير لإنشاء تقارير مخصصة حسب احتياجاتك.", sort_order: 10, is_published: true },
  { id: '11', question: "كيف أقوم برفع المستندات؟", answer: "من قسم الأرشيف، اضغط رفع مستند واختر الملف. النظام يدعم OCR تلقائي.", sort_order: 11, is_published: true },
  { id: '12', question: "ما هي مراحل معالجة الطلبات؟", answer: "الطلبات تمر بمراحل: استلام > معالجة > موافقة > تنفيذ. مع تتبع SLA تلقائي.", sort_order: 12, is_published: true },
  { id: '13', question: "كيف أضيف عقار جديد؟", answer: "من العقارات > إضافة عقار، أدخل التفاصيل والموقع والوحدات.", sort_order: 13, is_published: true },
  { id: '14', question: "هل يدعم النظام العمل أوفلاين؟", answer: "النظام يتطلب اتصال بالإنترنت للعمليات الحية، لكن بعض الصفحات تعمل أوفلاين.", sort_order: 14, is_published: true },
  { id: '15', question: "كيف أتواصل مع الدعم الفني؟", answer: "من قسم الدعم، يمكنك إنشاء تذكرة دعم أو استخدام الرسائل الداخلية.", sort_order: 15, is_published: true },
];

export function useKnowledgeArticles() {
  return useQuery({
    queryKey: ['knowledge-articles'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('knowledge_articles')
          .select('id, category, title, content, is_published, created_at, updated_at')
          .eq('is_published', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform DB data to match our interface
        return (data || []).map((item, index) => ({
          id: item.id,
          category: item.category || 'عام',
          title: item.title,
          description: item.content?.slice(0, 100) + '...',
          content: item.content,
          sort_order: index + 1,
          is_published: item.is_published,
          created_at: item.created_at,
          updated_at: item.updated_at,
        })) as KnowledgeArticle[];
      } catch {
        // Return fallback data if table doesn't exist or errors
        return FALLBACK_ARTICLES;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useKnowledgeFAQs() {
  return useQuery({
    queryKey: ['knowledge-faqs'],
    queryFn: async () => {
      // FAQs table doesn't exist in DB, use fallback
      return FALLBACK_FAQS;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
