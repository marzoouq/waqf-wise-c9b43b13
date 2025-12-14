/**
 * بطاقة فئة الإعدادات
 * مكون قابل لإعادة الاستخدام لعرض فئة من إعدادات الإظهار/الإخفاء
 * 
 * @version 2.8.91
 */
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Setting {
  key: string;
  label: string;
  description?: string;
}

interface SettingsCategoryCardProps {
  id: string;
  title: string;
  icon: React.ElementType;
  iconColor: string;
  settings: Setting[];
  isExpanded: boolean;
  onToggle: () => void;
  getSettingValue: (key: string) => boolean;
  onSettingChange: (key: string, value: boolean) => void;
  onBulkAction: (categoryId: string, enable: boolean) => void;
  isChanged: (key: string) => boolean;
}

export function SettingsCategoryCard({
  id,
  title,
  icon: Icon,
  iconColor,
  settings,
  isExpanded,
  onToggle,
  getSettingValue,
  onSettingChange,
  onBulkAction,
  isChanged,
}: SettingsCategoryCardProps) {
  const enabledCount = settings.filter(s => getSettingValue(s.key)).length;

  return (
    <Collapsible open={isExpanded} onOpenChange={onToggle}>
      <Card className="overflow-hidden">
        <CollapsibleTrigger asChild>
          <CardHeader className="pb-2 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon className={cn("h-5 w-5", iconColor)} />
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {enabledCount}/{settings.length}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {/* أزرار سريعة للفئة */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBulkAction(id, true);
                  }}
                  title="تفعيل الكل"
                >
                  <CheckCircle2 className="h-3 w-3 text-[hsl(var(--status-success))]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBulkAction(id, false);
                  }}
                  title="إلغاء الكل"
                >
                  <XCircle className="h-3 w-3 text-destructive" />
                </Button>
                <ChevronDown 
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "rotate-180"
                  )} 
                />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="p-3 grid gap-2 sm:grid-cols-2">
            {settings.map((setting) => (
              <div
                key={setting.key}
                className={cn(
                  "flex items-center justify-between p-2 rounded-md border",
                  isChanged(setting.key) && "bg-primary/5 border-primary/30"
                )}
              >
                <div className="flex-1 min-w-0">
                  <Label 
                    htmlFor={setting.key}
                    className="text-sm cursor-pointer"
                  >
                    {setting.label}
                  </Label>
                  {setting.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {setting.description}
                    </p>
                  )}
                </div>
                <Switch
                  id={setting.key}
                  checked={getSettingValue(setting.key)}
                  onCheckedChange={(value) => onSettingChange(setting.key, value)}
                  className="shrink-0 me-2"
                />
              </div>
            ))}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
