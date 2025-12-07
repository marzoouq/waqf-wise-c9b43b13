import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Shield, Database, Settings } from "lucide-react";

export function SettingsQuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "إدارة المستخدمين", icon: Users, path: "/users" },
    { label: "لوحة الأمان", icon: Shield, path: "/security" },
    { label: "مراقبة الأداء", icon: Database, path: "/performance" },
    { label: "سجلات النظام", icon: Settings, path: "/audit-logs" },
  ];

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
                key={action.path}
                variant="outline"
                className="justify-start gap-2"
                onClick={() => navigate(action.path)}
              >
                <Icon className="h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
