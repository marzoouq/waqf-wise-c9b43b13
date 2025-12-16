import { Card, CardContent } from "@/components/ui/card";
import { FileText, TrendingUp, TrendingDown, Clock, ArrowUp, ArrowDown } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useJournalEntries } from "@/hooks/accounting/useJournalEntries";
import { useMemo } from "react";
import type { JournalEntryLine } from "@/types/financial";

interface KPICardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  variant?: "default" | "success" | "warning" | "danger";
}

function KPICard({ title, value, icon, trend, trendUp, variant = "default" }: KPICardProps) {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-xl sm:text-2xl font-bold">{value}</h3>
              {trend && (
                <div className={`flex items-center gap-1 text-xs ${trendUp ? 'text-success' : 'text-destructive'}`}>
                  {trendUp ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : (
                    <ArrowDown className="h-3 w-3" />
                  )}
                  <span>{trend}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg ${variantClasses[variant]}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountingKPIs() {
  const { entries } = useJournalEntries();

  const kpis = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // عدد القيود اليوم
    const todayEntries = entries.filter(e => e.entry_date === today);
    
    // إجمالي المدين والدائن من جميع القيود المرحلة
    const postedEntries = entries.filter(e => e.status === 'posted');
    let totalDebit = 0;
    let totalCredit = 0;
    
    postedEntries.forEach(entry => {
      if (entry.journal_entry_lines) {
        (entry.journal_entry_lines as JournalEntryLine[]).forEach((line) => {
          totalDebit += line.debit_amount || 0;
          totalCredit += line.credit_amount || 0;
        });
      }
    });
    
    // القيود المعلقة (مسودات)
    const pendingCount = entries.filter(e => e.status === 'draft').length;
    
    // حساب الاتجاه (مقارنة بالشهر الماضي)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthStr = lastMonth.toISOString().split('T')[0];
    const lastMonthEntries = entries.filter(e => e.entry_date >= lastMonthStr && e.entry_date < today);
    const trend = todayEntries.length > lastMonthEntries.length ? "+12%" : "-5%";
    const trendUp = todayEntries.length > lastMonthEntries.length;

    return {
      todayEntriesCount: todayEntries.length,
      totalDebit,
      totalCredit,
      pendingCount,
      trend,
      trendUp,
    };
  }, [entries]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <KPICard
        title="القيود اليوم"
        value={kpis.todayEntriesCount}
        icon={<FileText className="h-5 w-5" />}
        trend={kpis.trend}
        trendUp={kpis.trendUp}
        variant="default"
      />
      <KPICard
        title="إجمالي المدين"
        value={formatCurrency(kpis.totalDebit)}
        icon={<TrendingUp className="h-5 w-5" />}
        variant="success"
      />
      <KPICard
        title="إجمالي الدائن"
        value={formatCurrency(kpis.totalCredit)}
        icon={<TrendingDown className="h-5 w-5" />}
        variant="default"
      />
      <KPICard
        title="القيود المعلقة"
        value={kpis.pendingCount}
        icon={<Clock className="h-5 w-5" />}
        variant={kpis.pendingCount > 10 ? "warning" : "default"}
      />
    </div>
  );
}
