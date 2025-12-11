/**
 * رسم بياني لاستخدام المساحة حسب التصنيف
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { HardDrive } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ArchiveService } from "@/services/archive.service";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function StorageUsageChart() {
  const { data: storageData, isLoading } = useQuery({
    queryKey: ["storage-usage-chart"],
    queryFn: () => ArchiveService.getStorageUsageByCategory(),
    staleTime: 5 * 60 * 1000,
  });

  const totalSize = storageData?.reduce((sum, item) => sum + item.value, 0) || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            توزيع المساحة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          توزيع المساحة
          <span className="text-sm font-normal text-muted-foreground mr-auto">
            {totalSize.toFixed(2)} MB
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {storageData && storageData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={storageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value} MB`}
                  labelLine={false}
                >
                  {storageData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value} MB`}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              لا توجد بيانات
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
