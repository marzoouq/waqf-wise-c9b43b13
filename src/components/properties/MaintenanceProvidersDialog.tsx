import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useMaintenanceProviders } from "@/hooks/property/useMaintenanceProviders";
import { Plus, Star, Phone, Mail, MapPin } from "lucide-react";
import { toast } from "sonner";

interface MaintenanceProvidersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MaintenanceProvidersDialog({ open, onOpenChange }: MaintenanceProvidersDialogProps) {
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    provider_name: "",
    contact_person: "",
    phone: "",
    email: "",
    address: "",
    specialization: [] as string[],
    notes: ""
  });

  // استخدام hook موحد بدلاً من useQuery/useMutation مباشرة
  const { providers, isLoading, addProvider } = useMaintenanceProviders();

  const handleSubmit = () => {
    if (!formData.provider_name || !formData.phone) {
      toast.error("يرجى إدخال الاسم ورقم الهاتف");
      return;
    }
    addProvider({
      provider_name: formData.provider_name,
      contact_person: formData.contact_person || undefined,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      specialization: formData.specialization,
      notes: formData.notes || undefined,
      rating: 0,
      total_jobs: 0,
      active_jobs: 0,
      is_active: true,
    });
    setIsAddingNew(false);
    setFormData({
      provider_name: "",
      contact_person: "",
      phone: "",
      email: "",
      address: "",
      specialization: [],
      notes: ""
    });
  };

  const specializations = ["سباكة", "كهرباء", "تكييف", "نجارة", "دهان", "تنظيف", "أخرى"];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>مقدمي خدمات الصيانة</span>
            <Button onClick={() => setIsAddingNew(!isAddingNew)} size="sm">
              <Plus className="h-4 w-4 ms-2" />
              إضافة مقدم خدمة
            </Button>
          </DialogTitle>
        </DialogHeader>

        {isAddingNew && (
          <div className="border rounded-lg p-4 space-y-4 bg-muted/50">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>اسم مقدم الخدمة *</Label>
                <Input
                  value={formData.provider_name}
                  onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                  placeholder="شركة الصيانة المثالية"
                />
              </div>
              <div>
                <Label>الشخص المسؤول</Label>
                <Input
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  placeholder="أحمد محمد"
                />
              </div>
              <div>
                <Label>رقم الهاتف *</Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="0501234567"
                />
              </div>
              <div>
                <Label>البريد الإلكتروني</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="info@example.com"
                />
              </div>
            </div>
            <div>
              <Label>العنوان</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="الرياض، حي النخيل"
              />
            </div>
            <div>
              <Label>التخصصات</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {specializations.map((spec) => (
                  <Badge
                    key={spec}
                    variant={formData.specialization.includes(spec) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => {
                      if (formData.specialization.includes(spec)) {
                        setFormData({
                          ...formData,
                          specialization: formData.specialization.filter(s => s !== spec)
                        });
                      } else {
                        setFormData({
                          ...formData,
                          specialization: [...formData.specialization, spec]
                        });
                      }
                    }}
                  >
                    {spec}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label>ملاحظات</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أي ملاحظات إضافية..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingNew(false)}>
                إلغاء
              </Button>
              <Button onClick={handleSubmit}>
                حفظ
              </Button>
            </div>
          </div>
        )}

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>مقدم الخدمة</TableHead>
                <TableHead>التواصل</TableHead>
                <TableHead>التخصصات</TableHead>
                <TableHead>التقييم</TableHead>
                <TableHead>عدد الأعمال</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">جاري التحميل...</TableCell>
                </TableRow>
              ) : providers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    لا يوجد مقدمي خدمة مسجلين
                  </TableCell>
                </TableRow>
              ) : (
                providers.map((provider) => (
                  <TableRow key={provider.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{provider.provider_name}</div>
                        {provider.contact_person && (
                          <div className="text-sm text-muted-foreground">{provider.contact_person}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3" />
                          {provider.phone}
                        </div>
                        {provider.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {provider.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {provider.specialization?.map((spec: string) => (
                          <Badge key={spec} variant="secondary" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-medium">{provider.rating || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-medium">{provider.total_jobs || 0}</div>
                        <div className="text-xs text-muted-foreground">أعمال منجزة</div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}