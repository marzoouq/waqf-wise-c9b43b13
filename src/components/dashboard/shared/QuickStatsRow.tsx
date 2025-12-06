import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface QuickStat {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

interface QuickStatsRowProps {
  stats: QuickStat[];
  className?: string;
}

const colorStyles = {
  primary: "text-primary bg-primary/10",
  success: "text-[hsl(var(--chart-2))] bg-[hsl(var(--chart-2))]/10",
  warning: "text-[hsl(var(--chart-4))] bg-[hsl(var(--chart-4))]/10",
  danger: "text-destructive bg-destructive/10",
  info: "text-[hsl(var(--chart-1))] bg-[hsl(var(--chart-1))]/10",
};

export function QuickStatsRow({ stats, className }: QuickStatsRowProps) {
  return (
    <div className={cn(
      "flex flex-wrap gap-4 p-4 bg-muted/30 rounded-lg border",
      className
    )}>
      {stats.map((stat, index) => (
        <div key={index} className="flex items-center gap-3 flex-1 min-w-[140px]">
          <div className={cn(
            "p-2 rounded-full",
            colorStyles[stat.color || "primary"]
          )}>
            <stat.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
