import { useState, useEffect } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Sun, Moon } from "lucide-react";

interface AppearanceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ألوان التمييز بـ HSL
const accentColors: Record<string, { primary: string; primaryForeground: string }> = {
  blue: { primary: "217 91% 60%", primaryForeground: "0 0% 100%" },
  green: { primary: "142 76% 36%", primaryForeground: "0 0% 100%" },
  purple: { primary: "271 91% 65%", primaryForeground: "0 0% 100%" },
  orange: { primary: "24 95% 53%", primaryForeground: "0 0% 100%" },
  red: { primary: "0 72% 51%", primaryForeground: "0 0% 100%" },
  teal: { primary: "173 80% 40%", primaryForeground: "0 0% 100%" },
};

const applyAccentColor = (colorName: string) => {
  const colors = accentColors[colorName];
  if (colors) {
    document.documentElement.style.setProperty("--primary", colors.primary);
    document.documentElement.style.setProperty("--primary-foreground", colors.primaryForeground);
  }
};

const applyTheme = (themeName: string) => {
  if (themeName === "dark") {
    document.documentElement.classList.add("dark");
  } else if (themeName === "light") {
    document.documentElement.classList.remove("dark");
  } else {
    const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }
};

// تطبيق الإعدادات المحفوظة عند تحميل الصفحة
export const initializeAppearanceSettings = () => {
  const savedTheme = localStorage.getItem("app-theme") || "system";
  const savedAccentColor = localStorage.getItem("app-accent-color") || "blue";
  
  applyTheme(savedTheme);
  applyAccentColor(savedAccentColor);
};

export function AppearanceSettingsDialog({
  open,
  onOpenChange,
}: AppearanceSettingsDialogProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "system");
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem("app-accent-color") || "blue");

  useEffect(() => {
    // تطبيق الإعدادات عند فتح الحوار
    applyTheme(theme);
    applyAccentColor(accentColor);
  }, []);

  const handleThemeChange = (value: string) => {
    setTheme(value);
    localStorage.setItem("app-theme", value);
    applyTheme(value);

    toast({
      title: "تم تحديث المظهر",
      description: "تم تغيير سمة التطبيق وحفظها بنجاح",
    });
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    localStorage.setItem("app-accent-color", color);
    applyAccentColor(color);
    
    toast({
      title: "تم تحديث اللون",
      description: "تم تغيير لون التمييز وحفظه بنجاح",
    });
  };

  const themeOptions = [
    { value: "light", label: "فاتح", icon: Sun, description: "مظهر فاتح للتطبيق" },
    { value: "dark", label: "داكن", icon: Moon, description: "مظهر داكن للتطبيق" },
    { value: "system", label: "النظام", icon: Monitor, description: "يتبع إعدادات النظام" },
  ];

  const colorOptions = [
    { value: "blue", label: "أزرق", color: "bg-blue-500" },
    { value: "green", label: "أخضر", color: "bg-green-500" },
    { value: "purple", label: "بنفسجي", color: "bg-purple-500" },
    { value: "orange", label: "برتقالي", color: "bg-orange-500" },
    { value: "red", label: "أحمر", color: "bg-red-500" },
    { value: "teal", label: "فيروزي", color: "bg-teal-500" },
  ];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="المظهر والثيم"
      description="تخصيص ألوان وسمة التطبيق"
      size="lg"
    >
      <div className="space-y-6">
          {/* اختيار الثيم */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">سمة التطبيق</h3>
              
              <RadioGroup value={theme} onValueChange={handleThemeChange}>
                <div className="grid grid-cols-1 gap-4">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <Label
                        key={option.value}
                        htmlFor={option.value}
                        className={`flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                          theme === option.value
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} />
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </Label>
                    );
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* لون التمييز */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">لون التمييز</h3>
              
              <RadioGroup value={accentColor} onValueChange={handleAccentColorChange}>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {colorOptions.map((option) => (
                    <Label
                      key={option.value}
                      htmlFor={`color-${option.value}`}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                        accentColor === option.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={`color-${option.value}`}
                      />
                      <div className={`w-6 h-6 rounded-full ${option.color}`} />
                      <span className="font-medium">{option.label}</span>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* معاينة */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">معاينة</h3>
              <div className="space-y-3 p-4 rounded-lg bg-muted">
                <div className="flex items-center gap-2">
                  <div className="w-full h-2 bg-primary rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 h-16 bg-card rounded border" />
                  <div className="flex-1 h-16 bg-card rounded border" />
                </div>
                <div className="h-12 bg-primary text-primary-foreground rounded flex items-center justify-center font-medium">
                  زر تجريبي
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </ResponsiveDialog>
  );
}
