import { Users, UserCheck, UserX, Home } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface BeneficiariesStatsProps {
  total: number;
  active: number;
  suspended: number;
  families: number;
}

export function BeneficiariesStats({ total, active, suspended, families }: BeneficiariesStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-primary">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
            إجمالي المستفيدين
          </CardTitle>
          <div className="p-2 bg-primary/10 rounded-lg">
            <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-primary">{total}</div>
          <p className="text-xs text-muted-foreground mt-1">جميع الحسابات</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-success">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
            المستفيدين النشطين
          </CardTitle>
          <div className="p-2 bg-success/10 rounded-lg">
            <UserCheck className="h-4 w-4 md:h-5 md:w-5 text-success" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-success">{active}</div>
          <p className="text-xs text-muted-foreground mt-1">حسابات نشطة</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-warning">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
            المعلقين
          </CardTitle>
          <div className="p-2 bg-warning/10 rounded-lg">
            <UserX className="h-4 w-4 md:h-5 md:w-5 text-warning" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-warning">{suspended}</div>
          <p className="text-xs text-muted-foreground mt-1">حسابات معلقة</p>
        </CardContent>
      </Card>
      
      <Card className="shadow-soft hover:shadow-medium transition-all duration-300 border-l-4 border-l-accent">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
            العائلات
          </CardTitle>
          <div className="p-2 bg-accent/10 rounded-lg">
            <Home className="h-4 w-4 md:h-5 md:w-5 text-accent" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl md:text-3xl font-bold text-accent">{families}</div>
          <p className="text-xs text-muted-foreground mt-1">عائلات مسجلة</p>
        </CardContent>
      </Card>
    </div>
  );
}
