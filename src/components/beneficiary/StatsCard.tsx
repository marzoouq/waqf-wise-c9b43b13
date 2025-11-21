import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  colorClass?: string;
}

export function StatsCard({ title, value, icon: Icon, trend, colorClass = "text-primary" }: StatsCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border-l-4" 
          style={{ borderLeftColor: `hsl(var(--primary))` }}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1 flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="space-y-1">
              <p className="text-2xl md:text-3xl font-bold">{value}</p>
              {trend && (
                <p className="text-xs text-muted-foreground">{trend}</p>
              )}
            </div>
          </div>
          <div className={cn(
            "h-14 w-14 rounded-full flex items-center justify-center",
            "bg-gradient-to-br from-primary/20 to-primary/5"
          )}>
            <Icon className={cn("h-7 w-7", colorClass)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
