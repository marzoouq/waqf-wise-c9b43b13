import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { LoadingState } from "@/components/shared/LoadingState";

interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(142, 76%, 36%)',
  'hsl(47, 96%, 53%)',
  'hsl(280, 65%, 60%)',
];

export function DistributionPieChart() {
  const [data, setData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDistributions = async () => {
      const { data: latestDistribution, error: distError } = await supabase
        .from("distributions")
        .select("id, total_amount")
        .eq("status", "معتمد")
        .order("distribution_date", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (distError || !latestDistribution) {
        setLoading(false);
        return;
      }

      const { data: details, error: detailsError } = await supabase
        .from("distribution_details")
        .select("allocated_amount, beneficiary_type")
        .eq("distribution_id", latestDistribution.id);

      if (!detailsError && details && details.length > 0) {
        const typeData: { [key: string]: number } = {};
        
        details.forEach((detail) => {
          const type = detail.beneficiary_type || 'أخرى';
          if (!typeData[type]) {
            typeData[type] = 0;
          }
          typeData[type] += Number(detail.allocated_amount || 0);
        });

        const total = Object.values(typeData).reduce((sum, val) => sum + val, 0);

        if (total > 0) {
          const chartData: ChartDataItem[] = Object.entries(typeData).map(([name, value]) => ({
            name,
            value: Math.round(value),
            percentage: Math.round((value / total) * 100),
          }));

          setData(chartData);
        } else {
          setData([]);
        }
      } else {
        setData([]);
      }
      setLoading(false);
    };

    fetchDistributions();
  }, []);

  if (loading) return <LoadingState message="جاري تحميل البيانات..." />;

  if (data.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        <p>لا توجد بيانات توزيع لعرضها</p>
      </Card>
    );
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${value.toLocaleString('ar-SA')} ر.س`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
