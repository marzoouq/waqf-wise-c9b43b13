import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import type { PropertyPerformance } from "@/types/dashboard";
import { ChartSkeleton } from "@/components/dashboard/ChartSkeleton";

export default function PropertiesPerformanceChart() {
  const [data, setData] = useState<PropertyPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPropertiesData();

    const channel = supabase
      .channel('properties-performance')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_payments' }, fetchPropertiesData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contracts' }, fetchPropertiesData)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPropertiesData = async () => {
    setIsLoading(true);

    // جلب العقود النشطة مع الدفعات (محسّن)
    const { data: contractsData } = await supabase
      .from('contracts')
      .select(`
        id,
        properties(name),
        rental_payments(amount_paid, status)
      `)
      .eq('status', 'نشط')
      .limit(6);  // فقط أول 6 عقارات

    const propertyStats: { [key: string]: { revenue: number, paid: number, pending: number } } = {};

    if (contractsData) {
      contractsData.forEach(contract => {
        const propertyName = contract.properties?.name || 'غير محدد';
        
        if (!propertyStats[propertyName]) {
          propertyStats[propertyName] = { revenue: 0, paid: 0, pending: 0 };
        }

        // حساب الإيرادات من الدفعات
        if (contract.rental_payments) {
          interface RentalPayment {
            amount_paid: number;
            status: string;
          }
          
          contract.rental_payments.forEach((payment: RentalPayment) => {
            propertyStats[propertyName].revenue += payment.amount_paid || 0;
            
            if (payment.status === 'مدفوع') {
              propertyStats[propertyName].paid += payment.amount_paid || 0;
            } else if (payment.status === 'معلق' || payment.status === 'متأخر') {
              propertyStats[propertyName].pending += payment.amount_paid || 0;
            }
          });
        }
      });
    }

    const chartData = Object.entries(propertyStats)
      .map(([name, stats]) => ({
        name,
        'الإيرادات الكلية': stats.revenue,
        'المدفوع': stats.paid,
        'المعلق': stats.pending
      }))
      .slice(0, 6); // عرض أول 6 عقارات

    setData(chartData);
    setIsLoading(false);
  };

  if (isLoading) {
    return <ChartSkeleton title="أداء العقارات" />;
  }

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>أداء العقارات</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">لا توجد بيانات عقارات</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>أداء العقارات (أعلى 6 عقارات)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
            />
            <Legend />
            <Bar dataKey="الإيرادات الكلية" fill="#8b5cf6" />
            <Bar dataKey="المدفوع" fill="#10b981" />
            <Bar dataKey="المعلق" fill="#f59e0b" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
