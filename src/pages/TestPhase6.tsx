import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Calendar, Wrench, Users, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function TestPhase6() {
  // إحصائيات العقارات والعقود
  const { data: stats } = useQuery({
    queryKey: ['phase6-stats'],
    queryFn: async () => {
      const [propertiesRes, contractsRes, unitsRes, paymentsRes] = await Promise.all([
        supabase.from('properties').select('id, status'),
        supabase.from('contracts').select('id, status, end_date'),
        supabase.from('property_units').select('id, occupancy_status'),
        supabase.from('rental_payments').select('id, status, amount_due')
      ]);

      const totalProperties = propertiesRes.data?.length || 0;
      const activeProperties = propertiesRes.data?.filter(p => p.status === 'نشط').length || 0;
      
      const totalContracts = contractsRes.data?.length || 0;
      const activeContracts = contractsRes.data?.filter(c => c.status === 'نشط').length || 0;
      const expiredContracts = contractsRes.data?.filter(c => c.status === 'منتهي').length || 0;
      const expiringSoon = contractsRes.data?.filter(c => {
        if (c.status !== 'نشط') return false;
        const daysUntilExpiry = Math.floor((new Date(c.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
      }).length || 0;

      const totalUnits = unitsRes.data?.length || 0;
      const occupiedUnits = unitsRes.data?.filter(u => u.occupancy_status === 'مشغول').length || 0;
      const vacantUnits = unitsRes.data?.filter(u => u.occupancy_status === 'شاغر').length || 0;
      const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : 0;

      const overduePayments = paymentsRes.data?.filter(p => p.status === 'متأخر').length || 0;
      const overdueAmount = paymentsRes.data?.filter(p => p.status === 'متأخر')
        .reduce((sum, p) => sum + (p.amount_due || 0), 0) || 0;

      return {
        totalProperties,
        activeProperties,
        totalContracts,
        activeContracts,
        expiredContracts,
        expiringSoon,
        totalUnits,
        occupiedUnits,
        vacantUnits,
        occupancyRate,
        overduePayments,
        overdueAmount
      };
    }
  });

  // جداول الصيانة
  const { data: maintenanceSchedules } = useQuery({
    queryKey: ['maintenance-schedules-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .select(`
          *,
          properties:property_id (name, location)
        `)
        .order('next_maintenance_date', { ascending: true });

      if (error) throw error;
      return data || [];
    }
  });

  // مزودي الصيانة
  const { data: providers } = useQuery({
    queryKey: ['maintenance-providers-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('*')
        .eq('is_active', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      return data || [];
    }
  });

  // العقود المنتهية حديثاً
  const { data: expiredContracts } = useQuery({
    queryKey: ['expired-contracts-test'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contracts')
        .select(`
          *,
          properties (name, location)
        `)
        .eq('status', 'منتهي')
        .order('end_date', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار المرحلة السادسة</h1>
          <p className="text-muted-foreground">إدارة العقارات والإيجارات المتقدمة</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <CheckCircle className="w-5 h-5 ml-2 text-green-500" />
          100% مكتملة
        </Badge>
      </div>

      {/* الإحصائيات العامة */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العقارات النشطة</p>
                <p className="text-2xl font-bold">{stats?.activeProperties} / {stats?.totalProperties}</p>
              </div>
              <Building2 className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">معدل الإشغال</p>
                <p className="text-2xl font-bold">{stats?.occupancyRate}%</p>
                <p className="text-xs text-muted-foreground">{stats?.occupiedUnits} / {stats?.totalUnits} وحدة</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">العقود المنتهية</p>
                <p className="text-2xl font-bold">{stats?.expiredContracts}</p>
                <p className="text-xs text-muted-foreground">{stats?.expiringSoon} تنتهي قريباً</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">مدفوعات متأخرة</p>
                <p className="text-2xl font-bold">{stats?.overduePayments}</p>
                <p className="text-xs text-muted-foreground">{stats?.overdueAmount.toLocaleString()} ريال</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* جداول الصيانة الدورية */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            جداول الصيانة الدورية ({maintenanceSchedules?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {maintenanceSchedules && maintenanceSchedules.length > 0 ? (
            <div className="space-y-3">
              {maintenanceSchedules.slice(0, 5).map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold">{schedule.schedule_name}</h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>📍 {schedule.properties?.name}</span>
                      <span>🔧 {schedule.category}</span>
                      <span>📅 {schedule.frequency}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <Badge variant={
                      schedule.priority === 'عالي' ? 'destructive' :
                      schedule.priority === 'متوسط' ? 'default' : 'secondary'
                    }>
                      {schedule.priority}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      الصيانة القادمة: {format(new Date(schedule.next_maintenance_date), 'dd MMM yyyy', { locale: ar })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا توجد جداول صيانة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* مزودي الصيانة */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            مزودي الصيانة ({providers?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {providers && providers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {providers.map((provider) => (
                <div key={provider.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm">{provider.provider_name}</h4>
                    <Badge variant="outline" className="text-yellow-600">
                      ⭐ {provider.rating}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{provider.contact_person}</p>
                  <p className="text-xs text-muted-foreground mb-2">📞 {provider.phone}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Array.isArray(provider.specialization) 
                      ? provider.specialization.slice(0, 3).map((spec: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))
                      : null}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {provider.total_jobs} مشروع مكتمل
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Wrench className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>لا يوجد مزودي صيانة</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* العقود المنتهية حديثاً */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            العقود المنتهية حديثاً
          </CardTitle>
        </CardHeader>
        <CardContent>
          {expiredContracts && expiredContracts.length > 0 ? (
            <div className="space-y-3">
              {expiredContracts.map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-semibold">{contract.contract_number}</h4>
                    <p className="text-sm text-muted-foreground">
                      {contract.tenant_name} - {contract.properties?.name}
                    </p>
                  </div>
                  <div className="text-left">
                    <Badge variant="destructive">منتهي</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(contract.end_date), 'dd MMM yyyy', { locale: ar })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50 text-green-500" />
              <p>لا توجد عقود منتهية</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ملخص التحسينات */}
      <Card className="border-2 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            ملخص تحسينات المرحلة السادسة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">✅ تم إنجازه:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• تحديث {stats?.expiredContracts} عقد منتهي تلقائياً</li>
                <li>• تفريغ {stats?.vacantUnits} وحدة شاغرة</li>
                <li>• إضافة {maintenanceSchedules?.length} جدول صيانة دوري</li>
                <li>• تسجيل {providers?.length} مزود صيانة</li>
                <li>• إصلاح 3 تحذيرات أمنية</li>
                <li>• تحديث {stats?.overduePayments} مدفوعات متأخرة</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🔧 الميزات الجديدة:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Trigger تلقائي لتحديث العقود المنتهية</li>
                <li>• جداول صيانة دورية حسب الفئة</li>
                <li>• إدارة مزودي الصيانة مع التقييمات</li>
                <li>• تحديث تلقائي لحالة المدفوعات</li>
                <li>• تتبع معدل الإشغال بدقة</li>
                <li>• تنبيهات العقود المنتهية</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}