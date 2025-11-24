import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDistributionEngine } from '@/hooks/useDistributionEngine';
import { DistributionPatternSelector } from '@/components/funds/DistributionPatternSelector';
import { ScenarioComparison } from '@/components/distributions/ScenarioComparison';
import { SmartRecommendations } from '@/components/distributions/SmartRecommendations';
import { BatchPaymentProcessor } from '@/components/distributions/BatchPaymentProcessor';
import { BankTransferGenerator } from '@/components/distributions/BankTransferGenerator';
import { TransferStatusTracker } from '@/components/distributions/TransferStatusTracker';
import { NotificationTemplateEditor } from '@/components/notifications/NotificationTemplateEditor';
import { FlexibleWorkflowBuilder } from '@/components/approvals/FlexibleWorkflowBuilder';
import { DistributionWizard } from '@/components/distributions/DistributionWizard';
import { DistributionTimeline } from '@/components/distributions/DistributionTimeline';
import { DistributionsDashboard } from '@/components/distributions/DistributionsDashboard';
import { DistributionAnalysisReport } from '@/components/reports/DistributionAnalysisReport';
import { DistributionEfficiencyReport } from '@/components/reports/DistributionEfficiencyReport';
import { BeneficiaryDistributionReport } from '@/components/reports/BeneficiaryDistributionReport';

// بيانات تجريبية
const testBeneficiaries = [
  {
    id: '1',
    full_name: 'أحمد محمد العتيبي',
    beneficiary_number: 'BEN-001',
    beneficiary_type: 'ولد',
    category: 'أبناء',
    status: 'active',
    family_size: 5,
    monthly_income: 3000,
    total_received: 120000,
    tribe: 'العتيبي',
    city: 'الرياض',
    iban: 'SA0380000000608010167519',
    bank_name: 'البنك الأهلي',
  },
  {
    id: '2',
    full_name: 'فاطمة عبدالله القحطاني',
    beneficiary_number: 'BEN-002',
    beneficiary_type: 'بنت',
    category: 'بنات',
    status: 'active',
    family_size: 3,
    monthly_income: 2000,
    total_received: 90000,
    tribe: 'القحطاني',
    city: 'جدة',
    iban: 'SA0380000000608010167520',
    bank_name: 'بنك الراجحي',
  },
  {
    id: '3',
    full_name: 'سارة سعد الدوسري',
    beneficiary_number: 'BEN-003',
    beneficiary_type: 'زوجة',
    category: 'زوجات',
    status: 'active',
    family_size: 4,
    monthly_income: 0,
    total_received: 150000,
    tribe: 'الدوسري',
    city: 'الدمام',
    iban: 'SA0380000000608010167521',
    bank_name: 'بنك الرياض',
  },
  {
    id: '4',
    full_name: 'عبدالرحمن خالد الشمري',
    beneficiary_number: 'BEN-004',
    beneficiary_type: 'ولد',
    category: 'أبناء',
    status: 'active',
    family_size: 6,
    monthly_income: 4000,
    total_received: 100000,
    tribe: 'الشمري',
    city: 'الرياض',
    iban: 'SA0380000000608010167522',
    bank_name: 'البنك الأهلي',
  },
  {
    id: '5',
    full_name: 'نورة ناصر العنزي',
    beneficiary_number: 'BEN-005',
    beneficiary_type: 'بنت',
    category: 'بنات',
    status: 'active',
    family_size: 2,
    monthly_income: 1500,
    total_received: 80000,
    tribe: 'العنزي',
    city: 'الطائف',
    iban: 'SA0380000000608010167523',
    bank_name: 'بنك الراجحي',
  },
];

const testDistributions = [
  {
    id: '1',
    distribution_number: 'DIST-2024-001',
    month: 'يناير 2024',
    total_amount: 500000,
    pattern: 'shariah',
    status: 'completed',
    beneficiaries_count: 5,
    created_at: '2024-01-15T10:00:00',
    approved_at: '2024-01-16T14:30:00',
    executed_at: '2024-01-17T09:00:00',
    distribution_date: '2024-01-17',
  },
  {
    id: '2',
    distribution_number: 'DIST-2024-002',
    month: 'فبراير 2024',
    total_amount: 450000,
    pattern: 'equal',
    status: 'completed',
    beneficiaries_count: 5,
    created_at: '2024-02-15T10:00:00',
    approved_at: '2024-02-16T16:00:00',
    executed_at: '2024-02-17T10:00:00',
    distribution_date: '2024-02-17',
  },
  {
    id: '3',
    distribution_number: 'DIST-2024-003',
    month: 'مارس 2024',
    total_amount: 480000,
    pattern: 'need_based',
    status: 'completed',
    beneficiaries_count: 5,
    created_at: '2024-03-15T10:00:00',
    approved_at: '2024-03-15T18:00:00',
    executed_at: '2024-03-16T09:00:00',
    distribution_date: '2024-03-16',
  },
];

const timelineEvents = [
  {
    id: '1',
    title: 'تم إنشاء التوزيع',
    description: 'تم إنشاء توزيع جديد بمبلغ 500,000 ريال',
    status: 'completed' as const,
    timestamp: '2024-01-15T10:00:00',
    user: 'أحمد المدير',
  },
  {
    id: '2',
    title: 'مراجعة محاسبية',
    description: 'تمت المراجعة والموافقة من قبل المحاسب',
    status: 'completed' as const,
    timestamp: '2024-01-16T11:00:00',
    user: 'محمد المحاسب',
  },
  {
    id: '3',
    title: 'موافقة الناظر',
    description: 'تمت الموافقة النهائية من الناظر',
    status: 'completed' as const,
    timestamp: '2024-01-16T14:30:00',
    user: 'عبدالله الناظر',
  },
  {
    id: '4',
    title: 'جاري التنفيذ',
    description: 'جاري معالجة التحويلات البنكية',
    status: 'in_progress' as const,
    timestamp: '2024-01-17T09:00:00',
    user: 'سعد المنفذ',
  },
  {
    id: '5',
    title: 'في انتظار التأكيد',
    description: 'في انتظار تأكيد البنك',
    status: 'pending' as const,
  },
];

export default function TestPhase4() {
  const { calculate, calculateMultipleScenarios, getRecommendation, isCalculating, scenarios } =
    useDistributionEngine();
  const [pattern, setPattern] = useState<'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid'>('equal');
  const [showWizard, setShowWizard] = useState(false);
  const [distributionResults, setDistributionResults] = useState<any>(null);

  const handleTestCalculation = async () => {
    const result = await calculate({
      total_amount: 500000,
      beneficiaries: testBeneficiaries as any,
      pattern: pattern as any,
      deductions: {
        nazer_percentage: 5,
        reserve_percentage: 10,
        development_percentage: 5,
        maintenance_percentage: 5,
        waqf_corpus_percentage: 5,
      },
    });

    setDistributionResults(result);
  };

  const handleTestScenarios = async () => {
    await calculateMultipleScenarios(
      {
        total_amount: 500000,
        beneficiaries: testBeneficiaries as any,
        deductions: {
          nazer_percentage: 5,
          reserve_percentage: 10,
          development_percentage: 5,
          maintenance_percentage: 5,
          waqf_corpus_percentage: 5,
        },
      },
      ['shariah', 'equal', 'need_based']
    );
  };

  const recommendation = getRecommendation(testBeneficiaries as any);

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار المرحلة الرابعة</h1>
          <p className="text-muted-foreground">اختبار شامل لجميع مكونات المرحلة الرابعة</p>
        </div>
        <Button onClick={() => setShowWizard(true)}>فتح معالج التوزيع</Button>
      </div>

      <Tabs defaultValue="engine" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engine">محرك التوزيع</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="reports">التقارير</TabsTrigger>
          <TabsTrigger value="workflows">مسارات العمل</TabsTrigger>
        </TabsList>

        {/* محرك التوزيع */}
        <TabsContent value="engine" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">اختبار محرك التوزيع الذكي</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  النمط الموصى به: <strong>{recommendation}</strong>
                </p>
                <DistributionPatternSelector
                  value={pattern}
                  onChange={(value) => setPattern(value as 'shariah' | 'equal' | 'need_based' | 'custom' | 'hybrid')}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleTestCalculation} disabled={isCalculating}>
                  حساب توزيع واحد
                </Button>
                <Button onClick={handleTestScenarios} variant="outline" disabled={isCalculating}>
                  مقارنة 3 سيناريوهات
                </Button>
              </div>

              {distributionResults && (
                <Card className="p-4 bg-muted">
                  <h4 className="font-semibold mb-2">نتيجة الحساب:</h4>
                  <pre className="text-xs overflow-auto max-h-60">
                    {JSON.stringify(distributionResults, null, 2)}
                  </pre>
                </Card>
              )}

              {scenarios.length > 0 && (
                <>
                  <ScenarioComparison scenarios={scenarios} />
                  <SmartRecommendations scenarios={scenarios} />
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Timeline التوزيع</h3>
            <DistributionTimeline distributionId="1" events={timelineEvents} />
          </Card>

          <DistributionsDashboard />
        </TabsContent>

        {/* المدفوعات */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">معالج الدفعات المجدولة</h3>
            <BatchPaymentProcessor
              distributionId="test-dist-1"
              totalBeneficiaries={testBeneficiaries.length}
            />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">مولد التحويلات البنكية</h3>
            <BankTransferGenerator distributionId="test-dist-1" />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تتبع حالة التحويلات</h3>
            <TransferStatusTracker transferFileId="test-file-1" />
          </Card>
        </TabsContent>

        {/* الإشعارات */}
        <TabsContent value="notifications" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">محرر قوالب الإشعارات</h3>
            <NotificationTemplateEditor />
          </Card>
        </TabsContent>

        {/* التقارير */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تقرير تحليل التوزيعات</h3>
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                تقرير تحليل التوزيعات - {testDistributions.length} توزيع
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <div>
                  <div className="text-sm text-muted-foreground">إجمالي المبلغ</div>
                  <div className="text-2xl font-bold">
                    {testDistributions.reduce((sum, d) => sum + d.total_amount, 0).toLocaleString('ar-SA')} ريال
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">المكتمل</div>
                  <div className="text-2xl font-bold text-green-500">
                    {testDistributions.filter(d => d.status === 'completed').length}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">المتوسط</div>
                  <div className="text-2xl font-bold">
                    {Math.round(testDistributions.reduce((sum, d) => sum + d.total_amount, 0) / testDistributions.length).toLocaleString('ar-SA')} ريال
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تقرير كفاءة التوزيعات</h3>
            <DistributionEfficiencyReport distributions={testDistributions as any} />
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">تقرير المستفيدين</h3>
            <BeneficiaryDistributionReport
              beneficiaries={testBeneficiaries as any}
              distributions={testDistributions as any}
            />
          </Card>
        </TabsContent>

        {/* مسارات العمل */}
        <TabsContent value="workflows" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">بناء مسارات الموافقات المرنة</h3>
            <FlexibleWorkflowBuilder />
          </Card>
        </TabsContent>
      </Tabs>

      <DistributionWizard
        open={showWizard}
        onOpenChange={setShowWizard}
        onComplete={data => {
          console.log('Distribution created:', data);
          setShowWizard(false);
        }}
      />
    </div>
  );
}
