import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface SettingItem {
  label: string;
  value: string;
}

interface SettingsCategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  settings: SettingItem[];
  onClick: () => void;
}

export function SettingsCategoryCard({
  title,
  description,
  icon: Icon,
  color,
  settings,
  onClick,
}: SettingsCategoryCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-all duration-200 group"
      onClick={onClick}
    >
      <CardHeader>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${color} flex-shrink-0`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base group-hover:text-primary transition-colors">
              {title}
            </CardTitle>
            <CardDescription className="text-xs mt-1">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {settings.map((setting, idx) => (
            <div key={idx} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{setting.label}</span>
              <span className="font-medium">{setting.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
