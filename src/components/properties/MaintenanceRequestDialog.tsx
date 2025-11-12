import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMaintenanceRequests, MaintenanceRequest } from "@/hooks/useMaintenanceRequests";
import { useProperties } from "@/hooks/useProperties";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request?: MaintenanceRequest | null;
}

export const MaintenanceRequestDialog = ({ open, onOpenChange, request }: Props) => {
  const { addRequest, updateRequest } = useMaintenanceRequests();
  const { properties } = useProperties();

  const [formData, setFormData] = useState({
    property_id: "",
    title: "",
    description: "",
    priority: "عادية",
    category: "أخرى",
    status: "جديد",
    requested_by: "",
    requested_date: new Date().toISOString().split('T')[0],
    scheduled_date: "",
    estimated_cost: "",
    assigned_to: "",
    vendor_name: "",
    notes: "",
  });

  useEffect(() => {
    if (request) {
      setFormData({
        property_id: request.property_id,
        title: request.title,
        description: request.description,
        priority: request.priority,
        category: request.category,
        status: request.status,
        requested_by: request.requested_by,
        requested_date: request.requested_date,
        scheduled_date: request.scheduled_date || "",
        estimated_cost: request.estimated_cost?.toString() || "",
        assigned_to: request.assigned_to || "",
        vendor_name: request.vendor_name || "",
        notes: request.notes || "",
      });
    }
  }, [request]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const requestData = {
      ...formData,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : undefined,
    };

    if (request) {
      updateRequest.mutate({ id: request.id, ...requestData });
    } else {
      addRequest.mutate(requestData);
    }
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      property_id: "",
      title: "",
      description: "",
      priority: "عادية",
      category: "أخرى",
      status: "جديد",
      requested_by: "",
      requested_date: new Date().toISOString().split('T')[0],
      scheduled_date: "",
      estimated_cost: "",
      assigned_to: "",
      vendor_name: "",
      notes: "",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{request ? "تعديل طلب صيانة" : "إضافة طلب صيانة"}</DialogTitle>
          <DialogDescription>
            {request ? "تعديل بيانات طلب الصيانة" : "أدخل بيانات طلب الصيانة"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>العقار *</Label>
              <Select
                value={formData.property_id}
                onValueChange={(value) => setFormData({ ...formData, property_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر العقار" />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الفئة *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="كهرباء">كهرباء</SelectItem>
                  <SelectItem value="سباكة">سباكة</SelectItem>
                  <SelectItem value="تكييف">تكييف</SelectItem>
                  <SelectItem value="نظافة">نظافة</SelectItem>
                  <SelectItem value="أمن">أمن</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>العنوان *</Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>الوصف *</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="منخفضة">منخفضة</SelectItem>
                  <SelectItem value="عادية">عادية</SelectItem>
                  <SelectItem value="عالية">عالية</SelectItem>
                  <SelectItem value="عاجلة">عاجلة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="جديد">جديد</SelectItem>
                  <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  <SelectItem value="معتمد">معتمد</SelectItem>
                  <SelectItem value="قيد التنفيذ">قيد التنفيذ</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="ملغي">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>التكلفة المتوقعة</Label>
              <Input
                type="number"
                step="0.01"
                value={formData.estimated_cost}
                onChange={(e) => setFormData({ ...formData, estimated_cost: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>مقدم الطلب *</Label>
              <Input
                value={formData.requested_by}
                onChange={(e) => setFormData({ ...formData, requested_by: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>تاريخ الطلب</Label>
              <Input
                type="date"
                value={formData.requested_date}
                onChange={(e) => setFormData({ ...formData, requested_date: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المسؤول</Label>
              <Input
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>اسم المقاول</Label>
              <Input
                value={formData.vendor_name}
                onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>تاريخ الجدولة</Label>
            <Input
              type="date"
              value={formData.scheduled_date}
              onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit">
              {request ? "تحديث" : "إضافة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};