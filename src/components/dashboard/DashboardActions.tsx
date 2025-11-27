import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, FileText, Users, Home } from "lucide-react";

interface QuickAction {
  label: string;
  icon: typeof Plus;
  onClick: () => void;
  variant?: "default" | "outline" | "secondary";
}

interface DashboardActionsProps {
  actions: QuickAction[];
}

/**
 * مكون الإجراءات السريعة في لوحة التحكم
 * يعرض أزرار للإجراءات الشائعة
 */
export function DashboardActions({ actions }: DashboardActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>إجراءات سريعة</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant={action.variant || "outline"}
                className="w-full justify-start"
                onClick={action.onClick}
              >
                <Icon className="h-4 w-4 ml-2" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
