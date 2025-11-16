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
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${color}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl sm:text-3xl md:text-4xl font-bold ${color}`}>
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
