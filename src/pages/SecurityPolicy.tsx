import { Link } from "react-router-dom";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Shield, Lock, Key, Server, Eye, AlertTriangle } from "lucide-react";

export default function SecurityPolicy() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">سياسة الأمان</h1>
          <p className="text-muted-foreground">آخر تحديث: نوفمبر 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">التشفير</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نستخدم تشفير TLS 1.3 لجميع الاتصالات، وتشفير AES-256 لتخزين البيانات الحساسة. جميع كلمات المرور مشفرة باستخدام خوارزميات آمنة.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">المصادقة</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• دعم المصادقة الثنائية (2FA)</li>
              <li>• المصادقة بالبصمة (WebAuthn)</li>
              <li>• سياسات كلمات مرور قوية</li>
              <li>• تسجيل خروج تلقائي بعد فترة عدم النشاط</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Server className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">البنية التحتية</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• استضافة على خوادم آمنة ومعتمدة</li>
              <li>• نسخ احتياطي يومي مشفر</li>
              <li>• مراقبة على مدار الساعة</li>
              <li>• جدران حماية متعددة الطبقات</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">المراقبة والتدقيق</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نحتفظ بسجلات تدقيق شاملة لجميع العمليات الحساسة. يتم مراجعة هذه السجلات بانتظام للكشف عن أي نشاط مشبوه.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              <h2 className="text-xl font-semibold text-foreground m-0">الإبلاغ عن الثغرات</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              إذا اكتشفت أي ثغرة أمنية، يرجى إبلاغنا فوراً على security@waqf.sa. نقدر مساهمتك في الحفاظ على أمان المنصة.
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
