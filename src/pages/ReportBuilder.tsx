import { ReportBuilder as ReportBuilderComponent } from '@/components/reports/ReportBuilder';

const ReportBuilder = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            منشئ التقارير المخصصة
          </h1>
          <p className="text-muted-foreground mt-1">
            قم بإنشاء تقارير مخصصة حسب احتياجاتك
          </p>
        </div>

        <ReportBuilderComponent />
      </div>
    </div>
  );
};

export default ReportBuilder;
