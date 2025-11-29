import { Link } from "react-router-dom";
import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Shield, Lock, Eye, Database, UserCheck, FileText } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">سياسة الخصوصية</h1>
          <p className="text-muted-foreground">آخر تحديث: نوفمبر 2025</p>
        </div>

        <div className="prose prose-lg max-w-none space-y-8">
          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">مقدمة</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نحن في منصة الوقف نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية المعلومات التي تقدمها لنا عند استخدام خدماتنا.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">البيانات التي نجمعها</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• المعلومات الشخصية: الاسم، رقم الهوية، البريد الإلكتروني، رقم الهاتف</li>
              <li>• المعلومات المالية: بيانات الحساب البنكي لأغراض صرف المستحقات</li>
              <li>• بيانات الاستخدام: سجلات الدخول والنشاط على المنصة</li>
              <li>• المستندات: الوثائق المرفوعة لإثبات الأهلية</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <UserCheck className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">كيف نستخدم بياناتك</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• التحقق من هويتك وأهليتك للاستفادة من خدمات الوقف</li>
              <li>• معالجة طلباتك وصرف مستحقاتك</li>
              <li>• التواصل معك بخصوص حسابك وخدماتنا</li>
              <li>• تحسين خدماتنا وتجربة المستخدم</li>
            </ul>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">حماية البيانات</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك. جميع البيانات مشفرة أثناء النقل والتخزين، ونطبق أفضل الممارسات الأمنية لحماية معلوماتك.
            </p>
          </section>

          <section className="bg-card rounded-xl p-6 border border-border">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-semibold text-foreground m-0">حقوقك</h2>
            </div>
            <ul className="text-muted-foreground space-y-2">
              <li>• الوصول إلى بياناتك الشخصية وطلب نسخة منها</li>
              <li>• تصحيح أي معلومات غير دقيقة</li>
              <li>• طلب حذف بياناتك (مع مراعاة المتطلبات القانونية)</li>
              <li>• الاعتراض على معالجة بياناتك لأغراض معينة</li>
            </ul>
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
