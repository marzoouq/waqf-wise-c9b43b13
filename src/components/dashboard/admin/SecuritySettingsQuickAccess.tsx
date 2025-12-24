/**
 * Security Settings Quick Access - الوصول السريع لإعدادات الأمان
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Settings2, 
  Shield, 
  Key, 
  Lock,
  FileText,
  AlertTriangle,
  ExternalLink,
  Fingerprint
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface QuickSettingItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  link?: string;
}

const quickSettings: QuickSettingItem[] = [
  {
    id: "2fa",
    icon: <Fingerprint className="h-5 w-5 text-purple-500" />,
    title: "المصادقة الثنائية",
    description: "تفعيل التحقق بخطوتين للحسابات الإدارية",
    link: "/settings",
  },
  {
    id: "password-policy",
    icon: <Key className="h-5 w-5 text-blue-500" />,
    title: "سياسة كلمات المرور",
    description: "تحديد متطلبات قوة كلمة المرور",
    link: "/settings",
  },
  {
    id: "session",
    icon: <Lock className="h-5 w-5 text-orange-500" />,
    title: "إعدادات الجلسات",
    description: "مدة انتهاء الجلسة وتسجيل الخروج التلقائي",
    link: "/settings",
  },
  {
    id: "audit",
    icon: <FileText className="h-5 w-5 text-green-500" />,
    title: "سجلات التدقيق",
    description: "عرض جميع العمليات والتغييرات",
    link: "/audit-logs",
  },
];

export function SecuritySettingsQuickAccess() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5 text-primary" />
          إعدادات الأمان السريعة
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/security-dashboard")}
          className="gap-2"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">لوحة الأمان</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {quickSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                {setting.icon}
                <div>
                  <div className="font-medium text-sm">{setting.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {setting.description}
                  </div>
                </div>
              </div>
              {setting.link && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => navigate(setting.link!)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* تنبيه أمني */}
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <div className="font-medium text-sm text-yellow-700">
                نصيحة أمنية
              </div>
              <div className="text-xs text-yellow-600 mt-1">
                يُنصح بتفعيل المصادقة الثنائية لجميع الحسابات الإدارية وتغيير كلمات المرور بشكل دوري.
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
