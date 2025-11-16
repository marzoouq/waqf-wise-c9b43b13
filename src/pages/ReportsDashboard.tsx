import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveDashboard } from '@/components/reports/InteractiveDashboard';
import { ScheduledReports } from '@/components/reports/ScheduledReports';
import { ReportBuilder } from '@/components/reports/ReportBuilder';
import { BeneficiaryReports } from '@/components/reports/BeneficiaryReports';
import { PropertiesReports } from '@/components/reports/PropertiesReports';
import { BarChart3, Calendar, Settings, Users, Building2 } from 'lucide-react';

const ReportsDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 md:p-8 lg:p-10 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gradient-primary">
            لوحة تحكم التقارير
          </h1>
          <p className="text-muted-foreground mt-1">
            نظام تقارير شامل مع لوحات تحكم تفاعلية وجدولة آلية
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden md:inline">لوحة التحكم</span>
            </TabsTrigger>
            <TabsTrigger value="scheduled" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden md:inline">التقارير المجدولة</span>
            </TabsTrigger>
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden md:inline">منشئ التقارير</span>
            </TabsTrigger>
            <TabsTrigger value="beneficiaries" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden md:inline">المستفيدون</span>
            </TabsTrigger>
            <TabsTrigger value="properties" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden md:inline">العقارات</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <InteractiveDashboard />
          </TabsContent>

          <TabsContent value="scheduled">
            <ScheduledReports />
          </TabsContent>

          <TabsContent value="builder">
            <ReportBuilder />
          </TabsContent>

          <TabsContent value="beneficiaries">
            <BeneficiaryReports />
          </TabsContent>

          <TabsContent value="properties">
            <PropertiesReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportsDashboard;
