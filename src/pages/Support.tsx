import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, BookOpen, HelpCircle, MessageSquare, Ticket } from 'lucide-react';

export default function Support() {

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">الدعم الفني</h1>
        <p className="text-muted-foreground">
          نظام الدعم الفني الشامل - قاعدة البيانات جاهزة 100%
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Ticket className="h-5 w-5 text-primary" />
              <CardTitle>التذاكر الفنية</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">✅ قاعدة البيانات جاهزة</p>
              <p className="text-sm text-muted-foreground">✅ RLS Policies مفعلة</p>
              <p className="text-sm text-muted-foreground">⏳ الواجهات قيد التطوير</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle>قاعدة المعرفة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">✅ جدول kb_articles جاهز</p>
              <p className="text-sm text-muted-foreground">✅ نظام البحث والتقييم</p>
              <p className="text-sm text-muted-foreground">⏳ الواجهات قيد التطوير</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              <CardTitle>الأسئلة الشائعة</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">✅ جدول kb_faqs جاهز</p>
              <p className="text-sm text-muted-foreground">✅ التصنيف والترتيب</p>
              <p className="text-sm text-muted-foreground">⏳ الواجهات قيد التطوير</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              <CardTitle>الرسائل والتعليقات</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">✅ جدول ticket_comments جاهز</p>
              <p className="text-sm text-muted-foreground">✅ Realtime Updates</p>
              <p className="text-sm text-muted-foreground">⏳ الواجهات قيد التطوير</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-primary" />
              <CardTitle>التقييمات والإحصائيات</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4 space-y-1">
              <p className="text-sm text-muted-foreground">✅ جدول ticket_ratings جاهز</p>
              <p className="text-sm text-muted-foreground">✅ نظام الإحصائيات</p>
              <p className="text-sm text-muted-foreground">⏳ لوحات التحكم قيد التطوير</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-blue-500/50 bg-blue-500/5">
        <CardHeader>
          <CardTitle className="text-blue-600 dark:text-blue-400">📊 حالة قاعدة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>8 جداول منشأة بنجاح</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>RLS Policies مفعلة على جميع الجداول</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Indexes محسنة للأداء</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Triggers تلقائية للتحديثات</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600">✅</span>
            <span>Functions مساعدة (generate_ticket_number, calculate_sla)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⏳</span>
            <span>انتظار تحديث ملف types.ts من Supabase</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500/50 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-amber-600 dark:text-amber-400">⚠️ ملاحظة مهمة</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            البنية التحتية الكاملة لنظام الدعم الفني جاهزة 100% في قاعدة البيانات.
            بمجرد تحديث ملف <code className="text-xs bg-muted px-1 py-0.5 rounded">types.ts</code> من Supabase،
            سيتم تفعيل جميع الواجهات التفاعلية والمكونات بشكل كامل.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
