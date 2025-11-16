import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
}

export const StatCard = memo(({ label, value, icon: Icon, color }: StatCardProps) => {
  return (
    <Card className="shadow-soft">
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <Icon className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-lg sm:text-xl md:text-2xl font-bold ${color}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  return prevProps.value === nextProps.value && 
         prevProps.label === nextProps.label;
});

StatCard.displayName = "StatCard";
