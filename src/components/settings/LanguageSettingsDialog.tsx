import { useState } from "react";
import { ResponsiveDialog } from "@/components/shared/ResponsiveDialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "lucide-react";

interface LanguageSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LanguageSettingsDialog({
  open,
  onOpenChange,
}: LanguageSettingsDialogProps) {
  const { toast } = useToast();
  const [language, setLanguage] = useState("ar");
  const [timezone, setTimezone] = useState("Asia/Riyadh");
  const [dateFormat, setDateFormat] = useState("dd/MM/yyyy");

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    toast({
      title: "تم تحديث اللغة",
      description: "تم تغيير لغة التطبيق بنجاح",
    });
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    toast({
      title: "تم تحديث المنطقة الزمنية",
      description: "تم تغيير المنطقة الزمنية بنجاح",
    });
  };

  const handleDateFormatChange = (value: string) => {
    setDateFormat(value);
    toast({
      title: "تم تحديث صيغة التاريخ",
      description: "تم تغيير صيغة التاريخ بنجاح",
    });
  };

  const languages = [
    { value: "ar", label: "العربية", nativeName: "العربية" },
    { value: "en", label: "English", nativeName: "English" },
  ];

  const timezones = [
    { value: "Asia/Riyadh", label: "توقيت الرياض (UTC+3)" },
    { value: "Asia/Dubai", label: "توقيت دبي (UTC+4)" },
    { value: "Asia/Kuwait", label: "توقيت الكويت (UTC+3)" },
    { value: "Asia/Qatar", label: "توقيت قطر (UTC+3)" },
    { value: "Asia/Bahrain", label: "توقيت البحرين (UTC+3)" },
    { value: "Africa/Cairo", label: "توقيت القاهرة (UTC+2)" },
  ];

  const dateFormats = [
    { value: "dd/MM/yyyy", label: "31/12/2024", example: "يوم/شهر/سنة" },
    { value: "MM/dd/yyyy", label: "12/31/2024", example: "شهر/يوم/سنة" },
    { value: "yyyy-MM-dd", label: "2024-12-31", example: "سنة-شهر-يوم" },
    { value: "dd-MM-yyyy", label: "31-12-2024", example: "يوم-شهر-سنة" },
  ];

  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      title="اللغة والمنطقة"
      description="إعدادات اللغة والمنطقة الزمنية والتنسيقات"
      size="lg"
    >
      <div className="space-y-6">
          {/* اختيار اللغة */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">لغة التطبيق</h3>
              
              <RadioGroup value={language} onValueChange={handleLanguageChange}>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <Label
                      key={lang.value}
                      htmlFor={`lang-${lang.value}`}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        language === lang.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem value={lang.value} id={`lang-${lang.value}`} />
                      <div className="flex-1">
                        <div className="font-medium">{lang.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {lang.nativeName}
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* المنطقة الزمنية */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">المنطقة الزمنية</h3>
              
              <Select value={timezone} onValueChange={handleTimezoneChange}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر المنطقة الزمنية" />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <p className="text-sm text-muted-foreground mt-2">
                الوقت الحالي: {new Date().toLocaleString("ar-SA", { timeZone: timezone })}
              </p>
            </CardContent>
          </Card>

          {/* صيغة التاريخ */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">صيغة التاريخ</h3>
              
              <RadioGroup value={dateFormat} onValueChange={handleDateFormatChange}>
                <div className="space-y-3">
                  {dateFormats.map((format) => (
                    <Label
                      key={format.value}
                      htmlFor={`format-${format.value}`}
                      className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                        dateFormat === format.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <RadioGroupItem
                        value={format.value}
                        id={`format-${format.value}`}
                      />
                      <div className="flex-1">
                        <div className="font-medium">{format.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {format.example}
                        </div>
                      </div>
                    </Label>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* صيغة الأرقام */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">صيغة الأرقام</h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">فاصل الآلاف:</span>
                  <span className="font-medium">,</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">فاصل الكسور العشرية:</span>
                  <span className="font-medium">.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">مثال:</span>
                  <span className="font-medium">1,234,567.89</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    </ResponsiveDialog>
  );
}
