import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockDataProvider, useMockData } from "@/components/design-preview/MockDataProvider";
import { PreviewContainer } from "@/components/design-preview/PreviewContainer";
import { BeforeAfter } from "@/components/design-preview/BeforeAfter";
import { DevicePreview } from "@/components/design-preview/DevicePreview";
import { UnifiedPageContainer } from "@/components/unified/UnifiedPageContainer";
import { UnifiedKPICard } from "@/components/unified/UnifiedKPICard";
import { UnifiedDataTable } from "@/components/unified/UnifiedDataTable";
import { StatsCard } from "@/components/beneficiary/StatsCard";
import { 
  Users, 
  Building2, 
  TrendingUp, 
  AlertCircle,
  DollarSign,
  FileText,
  Package
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

function DesignPreviewContent() {
  const mockData = useMockData();

  return (
    <UnifiedPageContainer maxWidth="2xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">🎨 معاينة التصميم الجديد</h1>
          <p className="text-muted-foreground">
            بيئة معزولة لاختبار المكونات الجديدة دون التأثير على النظام الأساسي
          </p>
        </div>

        <Tabs defaultValue="kpi" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="kpi">بطاقات KPI</TabsTrigger>
            <TabsTrigger value="tables">الجداول</TabsTrigger>
            <TabsTrigger value="responsive">التوافق</TabsTrigger>
            <TabsTrigger value="tokens">Design Tokens</TabsTrigger>
          </TabsList>

          {/* KPI Cards Preview */}
          <TabsContent value="kpi" className="space-y-6">
            <PreviewContainer
              title="بطاقات KPI الموحدة"
              description="مقارنة بين التصميم القديم والجديد"
            >
              <BeforeAfter
                label="بطاقة KPI - Default"
                before={
                  <StatsCard
                    title="إجمالي المستفيدين"
                    value="156"
                    icon={Users}
                    trend="+5% عن الشهر السابق"
                  />
                }
                after={
                  <UnifiedKPICard
                    title="إجمالي المستفيدين"
                    value="156"
                    icon={Users}
                    trend="+5% عن الشهر السابق"
                    variant="default"
                  />
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UnifiedKPICard
                  title="المستفيدين النشطين"
                  value="156"
                  icon={Users}
                  trend="+5%"
                  variant="default"
                />
                <UnifiedKPICard
                  title="التوزيعات الشهرية"
                  value="450,000 ر.س"
                  icon={DollarSign}
                  trend="+12%"
                  variant="success"
                />
                <UnifiedKPICard
                  title="الطلبات المعلقة"
                  value="8"
                  icon={AlertCircle}
                  trend="-3"
                  variant="warning"
                />
                <UnifiedKPICard
                  title="العقارات"
                  value="24"
                  icon={Building2}
                  trend="ثابت"
                  variant="default"
                />
              </div>
            </PreviewContainer>

            <PreviewContainer
              title="حالة التحميل"
              description="عرض الـ Skeleton عند تحميل البيانات"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <UnifiedKPICard
                  title="جاري التحميل"
                  value="0"
                  icon={Package}
                  loading={true}
                />
                <UnifiedKPICard
                  title="جاري التحميل"
                  value="0"
                  icon={Package}
                  loading={true}
                />
              </div>
            </PreviewContainer>
          </TabsContent>

          {/* Tables Preview */}
          <TabsContent value="tables" className="space-y-6">
            <PreviewContainer
              title="الجداول الموحدة"
              description="جداول بيانات بتصميم متسق"
            >
              <UnifiedDataTable
                title="المستفيدين"
                columns={[
                  { key: "full_name", label: "الاسم" },
                  { key: "national_id", label: "رقم الهوية" },
                  { 
                    key: "status", 
                    label: "الحالة",
                    render: (value) => (
                      <Badge variant={value === "نشط" ? "default" : "secondary"}>
                        {value}
                      </Badge>
                    )
                  },
                  { 
                    key: "total_received", 
                    label: "الإجمالي المستلم",
                    render: (value) => `${value.toLocaleString()} ر.س`
                  },
                ]}
                data={mockData.beneficiaries}
              />
            </PreviewContainer>

            <PreviewContainer
              title="العقارات"
              description="جدول العقارات مع بيانات مخصصة"
            >
              <UnifiedDataTable
                title="قائمة العقارات"
                columns={[
                  { key: "property_name", label: "اسم العقار" },
                  { key: "property_type", label: "النوع" },
                  { key: "location", label: "الموقع" },
                  { 
                    key: "annual_revenue", 
                    label: "العائد السنوي",
                    render: (value) => `${value.toLocaleString()} ر.س`
                  },
                  { 
                    key: "status", 
                    label: "الحالة",
                    align: "center",
                    render: (value) => (
                      <Badge variant={value === "مؤجر" ? "default" : "secondary"}>
                        {value}
                      </Badge>
                    )
                  },
                ]}
                data={mockData.properties}
              />
            </PreviewContainer>

            <PreviewContainer
              title="حالات خاصة"
              description="جدول فارغ وحالة التحميل"
            >
              <div className="space-y-4">
                <UnifiedDataTable
                  title="جدول فارغ"
                  columns={[
                    { key: "name", label: "الاسم" },
                    { key: "value", label: "القيمة" },
                  ]}
                  data={[]}
                  emptyMessage="لا توجد بيانات للعرض"
                />

                <UnifiedDataTable
                  title="جاري التحميل"
                  columns={[
                    { key: "name", label: "الاسم" },
                    { key: "value", label: "القيمة" },
                  ]}
                  data={[]}
                  loading={true}
                />
              </div>
            </PreviewContainer>
          </TabsContent>

          {/* Responsive Preview */}
          <TabsContent value="responsive" className="space-y-6">
            <PreviewContainer
              title="التوافق مع الأجهزة المختلفة"
              description="اختبار المكونات على أحجام شاشات مختلفة"
            >
              <DevicePreview>
                <div className="p-6 space-y-4">
                  <h2 className="text-xl font-bold">لوحة التحكم</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <UnifiedKPICard
                      title="المستفيدين"
                      value="156"
                      icon={Users}
                      variant="default"
                    />
                    <UnifiedKPICard
                      title="التوزيعات"
                      value="450K"
                      icon={DollarSign}
                      variant="success"
                    />
                  </div>
                  <UnifiedDataTable
                    columns={[
                      { key: "full_name", label: "الاسم" },
                      { key: "status", label: "الحالة" },
                    ]}
                    data={mockData.beneficiaries.slice(0, 3)}
                  />
                </div>
              </DevicePreview>
            </PreviewContainer>
          </TabsContent>

          {/* Design Tokens */}
          <TabsContent value="tokens" className="space-y-6">
            <PreviewContainer
              title="Design Tokens"
              description="المسافات والأحجام المعتمدة في النظام"
            >
              <div className="space-y-8">
                {/* Spacing */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">المسافات (Spacing)</h3>
                  <div className="space-y-2">
                    {['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'].map((size) => (
                      <div key={size} className="flex items-center gap-4">
                        <span className="w-20 text-sm font-mono">{size}</span>
                        <div 
                          className="h-8 bg-primary rounded"
                          style={{ width: `var(--spacing-${size}, 1rem)` }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Typography */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">أحجام النصوص (Typography)</h3>
                  <div className="space-y-2">
                    {['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'].map((size) => (
                      <div key={size} className="flex items-center gap-4">
                        <span className="w-20 text-sm font-mono">{size}</span>
                        <span className={`text-${size}`}>النص التجريبي - Sample Text</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Breakpoints */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">نقاط التوقف (Breakpoints)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { name: 'xs', value: '320px' },
                      { name: 'sm', value: '640px' },
                      { name: 'md', value: '768px' },
                      { name: 'lg', value: '1024px' },
                      { name: 'xl', value: '1280px' },
                      { name: '2xl', value: '1536px' },
                    ].map((bp) => (
                      <div key={bp.name} className="flex items-center justify-between p-3 border rounded">
                        <span className="font-mono font-semibold">{bp.name}</span>
                        <span className="text-muted-foreground">{bp.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PreviewContainer>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedPageContainer>
  );
}

export default function DesignPreview() {
  return (
    <MockDataProvider>
      <DesignPreviewContent />
    </MockDataProvider>
  );
}
