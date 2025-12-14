import MainLayout from '@/components/layout/MainLayout';
import { TenantsAgingReport } from '@/components/tenants/TenantsAgingReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function TenantsAgingReportPage() {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/tenants')}>
              <ArrowRight className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">تقرير أعمار الديون</h1>
              <p className="text-muted-foreground">
                تحليل ذمم المستأجرين حسب فترة الاستحقاق
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Printer className="ms-2 h-4 w-4" />
              طباعة
            </Button>
            <Button variant="outline" size="sm">
              <Download className="ms-2 h-4 w-4" />
              تصدير Excel
            </Button>
          </div>
        </div>

        {/* Report */}
        <TenantsAgingReport />
      </div>
    </MainLayout>
  );
}
