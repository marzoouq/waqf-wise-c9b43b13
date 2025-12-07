import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { LoadingState } from "@/components/shared/LoadingState";
import { Settings, ArrowLeft } from "lucide-react";
import { 
  SettingsCategoryCard, 
  SettingsQuickActions, 
  useSettingsCategories 
} from "./settings";

export function AdminSettingsSection() {
  const navigate = useNavigate();
  const { categories, isLoading } = useSettingsCategories();

  if (isLoading) {
    return <LoadingState message="جاري تحميل الإعدادات..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">إعدادات النظام المتقدمة</CardTitle>
              <CardDescription className="mt-2">
                إدارة شاملة لجميع إعدادات النظام والتفضيلات
              </CardDescription>
            </div>
            <Button onClick={() => navigate("/settings")} className="gap-2">
              <Settings className="h-4 w-4" />
              فتح جميع الإعدادات
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Settings Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <SettingsCategoryCard
            key={category.title}
            title={category.title}
            description={category.description}
            icon={category.icon}
            color={category.color}
            settings={category.settings}
            onClick={category.action}
          />
        ))}
      </div>

      {/* Quick Actions */}
      <SettingsQuickActions />
    </div>
  );
}
