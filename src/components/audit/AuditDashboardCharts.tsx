import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { 
  useDailyActivityData, 
  useCategoryData, 
  useHourlyActivityData 
} from "@/hooks/system/useAuditChartData";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, PieChart as PieChartIcon, Clock } from "lucide-react";

export function AuditDashboardCharts() {
  const { data: dailyData, isLoading: dailyLoading } = useDailyActivityData(7);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryData();
  const { data: hourlyData, isLoading: hourlyLoading } = useHourlyActivityData();

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {/* النشاط اليومي */}
      <Card className="lg:col-span-2 xl:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            النشاط اليومي (آخر 7 أيام)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dailyLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorInsert" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUpdate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorDelete" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="dateLabel" 
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  tick={{ fontSize: 11 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="insert" 
                  name="إضافة"
                  stroke="#10B981" 
                  fill="url(#colorInsert)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="update" 
                  name="تعديل"
                  stroke="#3B82F6" 
                  fill="url(#colorUpdate)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="delete" 
                  name="حذف"
                  stroke="#EF4444" 
                  fill="url(#colorDelete)"
                  strokeWidth={2}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value) => <span style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* توزيع الفئات */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-primary" />
            توزيع الفئات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {categoryLoading ? (
            <Skeleton className="h-[200px] w-full" />
          ) : categoryData && categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={categoryData as unknown as Array<{ [key: string]: unknown }>}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="count"
                  nameKey="categoryLabel"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  formatter={(value: number, name: string) => [`${value} عملية`, name]}
                />
                <Legend 
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  formatter={(value) => <span className="text-xs" style={{ color: 'hsl(var(--foreground))' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
              لا توجد بيانات
            </div>
          )}
        </CardContent>
      </Card>

      {/* النشاط بالساعة */}
      <Card className="xl:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            النشاط حسب الساعة (آخر 24 ساعة)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {hourlyLoading ? (
            <Skeleton className="h-[150px] w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="hourLabel" 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                  interval={2}
                />
                <YAxis 
                  tick={{ fontSize: 10 }}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    direction: 'rtl'
                  }}
                  formatter={(value: number) => [`${value} عملية`, 'العمليات']}
                  labelFormatter={(label) => `الساعة ${label}`}
                />
                <Bar 
                  dataKey="count" 
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
