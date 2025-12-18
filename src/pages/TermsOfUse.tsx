import { Link } from "react-router-dom";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { FileText, Scale, AlertTriangle, CheckCircle, XCircle, HelpCircle } from "lucide-react";

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden" dir="rtl">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">شروط الاستخدام</h1>
          <p className="text-muted-foreground">آخر تحديث: نوفمبر 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">القبول بالشروط</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              باستخدامك لمنصة الوقف، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي من هذه الشروط، يرجى عدم استخدام المنصة.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">الاستخدام المسموح</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• استخدام المنصة للأغراض المشروعة فقط</li>
              <li>• تقديم معلومات صحيحة ودقيقة</li>
              <li>• الحفاظ على سرية بيانات الدخول</li>
              <li>• الالتزام بالقوانين واللوائح المعمول بها</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-xl font-semibold text-foreground m-0">الاستخدام المحظور</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• تقديم معلومات كاذبة أو مضللة</li>
              <li>• محاولة الوصول غير المصرح به للنظام</li>
              <li>• استخدام المنصة لأغراض احتيالية</li>
              <li>• نقل أو مشاركة بيانات المستخدمين الآخرين</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-warning" />
              <h2 className="text-xl font-semibold text-foreground m-0">إخلاء المسؤولية</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نسعى لتوفير خدمة موثوقة، لكننا لا نضمن خلو المنصة من الأخطاء أو الانقطاعات. نحتفظ بالحق في تعديل أو إيقاف الخدمة في أي وقت.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">التعديلات</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار على المنصة.
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="text-primary hover:text-primary/80 font-medium"
          >
            ← العودة للصفحة الرئيسية
          </Link>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
