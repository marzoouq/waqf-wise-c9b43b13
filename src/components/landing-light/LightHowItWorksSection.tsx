/**
 * مكون How It Works Section للصفحة الخفيفة
 */

const steps = [
  { step: "1", title: "التسجيل", desc: "أنشئ حسابك في دقائق" },
  { step: "2", title: "إعداد البيانات", desc: "أضف بيانات الوقف والمستفيدين" },
  { step: "3", title: "البدء بالعمل", desc: "ابدأ في إدارة الوقف بكفاءة" }
];

export function LightHowItWorksSection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            كيف يعمل النظام؟
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            خطوات بسيطة للبدء في استخدام نظام إدارة الوقف
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((item, index) => (
            <div key={index} className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-4">
                {item.step}
              </div>
              <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
