/**
 * Create Maintenance Request Dialog
 * نموذج إنشاء طلب صيانة شامل
 * @version 1.0.0
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Camera, 
  Upload, 
  X, 
  Wrench, 
  MapPin, 
  Calendar, 
  Clock, 
  Phone, 
  Mail, 
  AlertTriangle,
  CheckCircle2
} from "lucide-react";
import { useCreateTenantRequest } from "@/hooks/tenant-portal/useTenantPortal";
import { TenantContract } from "@/services/tenant-portal.service";
import { toast } from "sonner";

const maintenanceSchema = z.object({
  title: z.string().min(5, "العنوان يجب أن يكون 5 أحرف على الأقل"),
  description: z.string().min(20, "الوصف يجب أن يكون 20 حرف على الأقل"),
  category: z.string().min(1, "اختر فئة الصيانة"),
  priority: z.string().min(1, "اختر الأولوية"),
  location_in_unit: z.string().optional(),
  preferred_date: z.string().optional(),
  preferred_time_slot: z.string().optional(),
  contact_preference: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email().optional().or(z.literal("")),
  is_urgent: z.boolean().default(false),
  tenant_notes: z.string().optional(),
});

type MaintenanceFormData = z.infer<typeof maintenanceSchema>;

interface CreateMaintenanceRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contracts: TenantContract[];
}

const MAINTENANCE_CATEGORIES = [
  { value: "كهرباء", label: "كهرباء", icon: "⚡" },
  { value: "سباكة", label: "سباكة", icon: "🔧" },
  { value: "تكييف", label: "تكييف وتبريد", icon: "❄️" },
  { value: "أجهزة", label: "أجهزة منزلية", icon: "📺" },
  { value: "أبواب_نوافذ", label: "أبواب ونوافذ", icon: "🚪" },
  { value: "دهانات", label: "دهانات وتشطيبات", icon: "🎨" },
  { value: "مفاتيح", label: "مفاتيح وأقفال", icon: "🔑" },
  { value: "تسربات", label: "تسربات مياه", icon: "💧" },
  { value: "صرف", label: "صرف صحي", icon: "🚿" },
  { value: "أخرى", label: "أخرى", icon: "📋" },
];

const PRIORITY_OPTIONS = [
  { value: "منخفضة", label: "منخفضة", color: "bg-green-100 text-green-800" },
  { value: "متوسطة", label: "متوسطة", color: "bg-yellow-100 text-yellow-800" },
  { value: "عالية", label: "عالية", color: "bg-orange-100 text-orange-800" },
  { value: "طارئة", label: "طارئة", color: "bg-red-100 text-red-800" },
];

const LOCATION_OPTIONS = [
  "غرفة المعيشة",
  "المطبخ",
  "الحمام الرئيسي",
  "حمام الضيوف",
  "غرفة النوم الرئيسية",
  "غرفة النوم الثانية",
  "غرفة النوم الثالثة",
  "الصالة",
  "المدخل",
  "الشرفة/البلكونة",
  "المستودع",
  "موقف السيارات",
  "السطح",
  "الحديقة",
  "أخرى",
];

const TIME_SLOTS = [
  { value: "morning", label: "صباحاً (8ص - 12م)" },
  { value: "afternoon", label: "ظهراً (12م - 4م)" },
  { value: "evening", label: "مساءً (4م - 8م)" },
  { value: "anytime", label: "أي وقت" },
];

const CONTACT_PREFERENCES = [
  { value: "phone", label: "اتصال هاتفي", icon: Phone },
  { value: "whatsapp", label: "واتساب", icon: Phone },
  { value: "email", label: "بريد إلكتروني", icon: Mail },
];

export function CreateMaintenanceRequestDialog({
  open,
  onOpenChange,
  contracts,
}: CreateMaintenanceRequestDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedContract, setSelectedContract] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { mutate: createRequest, isPending } = useCreateTenantRequest();

  const form = useForm<MaintenanceFormData>({
    resolver: zodResolver(maintenanceSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "متوسطة",
      location_in_unit: "",
      preferred_date: "",
      preferred_time_slot: "anytime",
      contact_preference: "phone",
      contact_phone: "",
      contact_email: "",
      is_urgent: false,
      tenant_notes: "",
    },
  });

  const selectedContractData = contracts.find(c => c.contract_id === selectedContract);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      // Convert to base64 for now (in production, upload to storage)
      const newImages: string[] = [];
      for (const file of Array.from(files)) {
        if (images.length + newImages.length >= 5) {
          toast.warning("الحد الأقصى 5 صور");
          break;
        }
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newImages.push(base64);
      }
      setImages([...images, ...newImages]);
    } catch (error) {
      toast.error("فشل في رفع الصور");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const onSubmit = (data: MaintenanceFormData) => {
    if (!selectedContract) {
      toast.error("اختر الوحدة");
      return;
    }

    const contract = contracts.find(c => c.contract_id === selectedContract);
    if (!contract) return;

    createRequest({
      propertyId: contract.property_id,
      unitId: contract.unit_id || undefined,
      title: data.title,
      description: data.description,
      category: data.category,
      priority: data.priority,
      locationInUnit: data.location_in_unit || undefined,
      images: images.length > 0 ? images : undefined,
      preferredDate: data.preferred_date || undefined,
      preferredTimeSlot: data.preferred_time_slot || undefined,
      contactPreference: data.contact_preference as "phone" | "email" | "whatsapp" | undefined,
      contactPhone: data.contact_phone || undefined,
      contactEmail: data.contact_email || undefined,
      isUrgent: data.is_urgent,
      tenantNotes: data.tenant_notes || undefined,
    }, {
      onSuccess: () => {
        toast.success("تم إرسال طلب الصيانة بنجاح");
        onOpenChange(false);
        form.reset();
        setImages([]);
        setSelectedContract("");
        setStep(1);
      },
      onError: (error) => {
        toast.error(error.message || "فشل في إرسال الطلب");
      },
    });
  };

  const isUrgent = form.watch("is_urgent");
  const selectedCategory = form.watch("category");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" />
            طلب صيانة جديد
          </DialogTitle>
          <DialogDescription>
            أدخل تفاصيل طلب الصيانة
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 py-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > s ? <CheckCircle2 className="h-4 w-4" /> : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-1 rounded ${step > s ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Contract Selection */}
              <div className="space-y-2">
                <Label>الوحدة السكنية *</Label>
                <Select value={selectedContract} onValueChange={setSelectedContract}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الوحدة" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.contract_id} value={contract.contract_id}>
                        {contract.property_name} - {contract.unit_name || "الوحدة الرئيسية"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label>نوع الصيانة *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {MAINTENANCE_CATEGORIES.map((cat) => (
                    <Button
                      key={cat.value}
                      type="button"
                      variant={selectedCategory === cat.value ? "default" : "outline"}
                      className="justify-start gap-2 h-auto py-3"
                      onClick={() => form.setValue("category", cat.value)}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </Button>
                  ))}
                </div>
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">عنوان المشكلة *</Label>
                <Input
                  id="title"
                  placeholder="مثال: تسريب مياه في الحمام"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">وصف تفصيلي للمشكلة *</Label>
                <Textarea
                  id="description"
                  placeholder="اشرح المشكلة بالتفصيل: متى بدأت؟ ما هي الأعراض؟ هل هناك أضرار؟"
                  rows={4}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label>الأولوية *</Label>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_OPTIONS.map((p) => (
                    <Badge
                      key={p.value}
                      className={`cursor-pointer px-4 py-2 ${
                        form.watch("priority") === p.value
                          ? p.color
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                      onClick={() => form.setValue("priority", p.value)}
                    >
                      {p.label}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Urgent Toggle */}
              <Card className={isUrgent ? "border-red-300 bg-red-50" : ""}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className={`h-5 w-5 ${isUrgent ? "text-red-600" : "text-muted-foreground"}`} />
                      <div>
                        <p className="font-medium">حالة طارئة</p>
                        <p className="text-sm text-muted-foreground">
                          تسريب مياه كبير، انقطاع كهرباء، إلخ
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={isUrgent}
                      onCheckedChange={(checked) => form.setValue("is_urgent", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Location & Images */}
          {step === 2 && (
            <div className="space-y-4">
              {/* Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  موقع المشكلة في الوحدة
                </Label>
                <Select
                  value={form.watch("location_in_unit")}
                  onValueChange={(v) => form.setValue("location_in_unit", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الموقع" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Images */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  صور المشكلة (اختياري - حد أقصى 5 صور)
                </Label>
                
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border">
                      <img src={img} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => removeImage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={uploading}
                      />
                      {uploading ? (
                        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground mb-1" />
                          <span className="text-xs text-muted-foreground">إضافة صورة</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
              </div>

              {/* Additional Notes */}
              <div className="space-y-2">
                <Label htmlFor="tenant_notes">ملاحظات إضافية</Label>
                <Textarea
                  id="tenant_notes"
                  placeholder="أي معلومات إضافية تريد إضافتها..."
                  rows={3}
                  {...form.register("tenant_notes")}
                />
              </div>
            </div>
          )}

          {/* Step 3: Scheduling & Contact */}
          {step === 3 && (
            <div className="space-y-4">
              {/* Preferred Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  التاريخ المفضل للزيارة
                </Label>
                <Input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  {...form.register("preferred_date")}
                />
              </div>

              {/* Preferred Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  الوقت المفضل
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <Button
                      key={slot.value}
                      type="button"
                      variant={form.watch("preferred_time_slot") === slot.value ? "default" : "outline"}
                      className="justify-center"
                      onClick={() => form.setValue("preferred_time_slot", slot.value)}
                    >
                      {slot.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact Preference */}
              <div className="space-y-2">
                <Label>طريقة التواصل المفضلة</Label>
                <div className="flex flex-wrap gap-2">
                  {CONTACT_PREFERENCES.map((pref) => (
                    <Button
                      key={pref.value}
                      type="button"
                      variant={form.watch("contact_preference") === pref.value ? "default" : "outline"}
                      className="gap-2"
                      onClick={() => form.setValue("contact_preference", pref.value)}
                    >
                      <pref.icon className="h-4 w-4" />
                      {pref.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <Label htmlFor="contact_phone">رقم الهاتف للتواصل</Label>
                <Input
                  id="contact_phone"
                  type="tel"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                  {...form.register("contact_phone")}
                />
              </div>

              {/* Contact Email */}
              <div className="space-y-2">
                <Label htmlFor="contact_email">البريد الإلكتروني (اختياري)</Label>
                <Input
                  id="contact_email"
                  type="email"
                  placeholder="email@example.com"
                  dir="ltr"
                  {...form.register("contact_email")}
                />
              </div>

              {/* Summary Card */}
              <Card className="bg-muted/50">
                <CardContent className="py-4 space-y-2">
                  <p className="font-medium">ملخص الطلب:</p>
                  <div className="text-sm space-y-1">
                    <p><strong>الوحدة:</strong> {selectedContractData?.property_name}</p>
                    <p><strong>النوع:</strong> {form.watch("category")}</p>
                    <p><strong>العنوان:</strong> {form.watch("title")}</p>
                    <p><strong>الأولوية:</strong> {form.watch("priority")}</p>
                    {isUrgent && (
                      <Badge variant="destructive" className="mt-2">حالة طارئة</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4 border-t">
            {step > 1 ? (
              <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>
                السابق
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                إلغاء
              </Button>
            )}
            
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (step === 1) {
                    if (!selectedContract) {
                      toast.error("اختر الوحدة");
                      return;
                    }
                    const categoryValid = form.getValues("category");
                    const titleValid = form.getValues("title").length >= 5;
                    const descValid = form.getValues("description").length >= 20;
                    if (!categoryValid || !titleValid || !descValid) {
                      form.trigger(["category", "title", "description"]);
                      return;
                    }
                  }
                  setStep(step + 1);
                }}
              >
                التالي
              </Button>
            ) : (
              <Button type="submit" disabled={isPending}>
                {isPending ? "جاري الإرسال..." : "إرسال الطلب"}
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
