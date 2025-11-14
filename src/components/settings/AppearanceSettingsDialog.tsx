import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Monitor, Sun, Moon } from "lucide-react";

interface AppearanceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppearanceSettingsDialog({
  open,
  onOpenChange,
}: AppearanceSettingsDialogProps) {
  const { toast } = useToast();
  const [theme, setTheme] = useState("system");
  const [accentColor, setAccentColor] = useState("blue");

  const handleThemeChange = (value: string) => {
    setTheme(value);
    
    // تطبيق الثيم
    if (value === "dark") {
      document.documentElement.classList.add("dark");
    } else if (value === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      // system
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      if (isDark) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }

    toast({
      title: "تم تحديث المظهر",
      description: "تم تغيير سمة التطبيق بنجاح",
    });
  };

  const handleAccentColorChange = (color: string) => {
    setAccentColor(color);
    toast({
      title: "تم تحديث اللون",
      description: "تم تغيير لون التمييز بنجاح",
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
