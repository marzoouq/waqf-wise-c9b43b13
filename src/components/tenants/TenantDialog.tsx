import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Tenant, TenantInsert } from '@/types/tenants';

interface TenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
  onSubmit: (data: TenantInsert) => Promise<void>;
  isLoading?: boolean;
}

export function TenantDialog({
  open,
  onOpenChange,
  tenant,
  onSubmit,
  isLoading,
}: TenantDialogProps) {
  const [formData, setFormData] = useState<TenantInsert>({
    full_name: '',
    id_type: 'national_id',
    id_number: '',
    tax_number: '',
    commercial_register: '',
    national_address: '',
    phone: '',
    email: '',
    city: '',
    address: '',
    tenant_type: 'individual',
    status: 'active',
    notes: '',
  });

  useEffect(() => {
    if (tenant) {
      setFormData({
        full_name: tenant.full_name,
        id_type: tenant.id_type,
        id_number: tenant.id_number,
        tax_number: tenant.tax_number || '',
        commercial_register: tenant.commercial_register || '',
        national_address: tenant.national_address || '',
        phone: tenant.phone || '',
        email: tenant.email || '',
        city: tenant.city || '',
        address: tenant.address || '',
        tenant_type: tenant.tenant_type,
        status: tenant.status,
        notes: tenant.notes || '',
      });
    } else {
      setFormData({
        full_name: '',
        id_type: 'national_id',
        id_number: '',
        tax_number: '',
        commercial_register: '',
        national_address: '',
        phone: '',
        email: '',
        city: '',
        address: '',
        tenant_type: 'individual',
        status: 'active',
        notes: '',
      });
    }
  }, [tenant, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {tenant ? 'تعديل بيانات المستأجر' : 'إضافة مستأجر جديد'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* الاسم الكامل */}
            <div className="col-span-2">
              <Label htmlFor="full_name">الاسم الكامل *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) =>
                  setFormData({ ...formData, full_name: e.target.value })
                }
                required
              />
            </div>

            {/* نوع المستأجر */}
            <div>
              <Label htmlFor="tenant_type">نوع المستأجر</Label>
              <Select
                value={formData.tenant_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, tenant_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">فرد</SelectItem>
                  <SelectItem value="company">شركة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* نوع الهوية */}
            <div>
              <Label htmlFor="id_type">نوع الهوية</Label>
              <Select
                value={formData.id_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, id_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="national_id">هوية وطنية</SelectItem>
                  <SelectItem value="iqama">إقامة</SelectItem>
                  <SelectItem value="commercial_register">سجل تجاري</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* رقم الهوية */}
            <div>
              <Label htmlFor="id_number">رقم الهوية *</Label>
              <Input
                id="id_number"
                value={formData.id_number}
                onChange={(e) =>
                  setFormData({ ...formData, id_number: e.target.value })
                }
                required
              />
            </div>

            {/* الرقم الضريبي */}
            <div>
              <Label htmlFor="tax_number">الرقم الضريبي</Label>
              <Input
                id="tax_number"
                value={formData.tax_number}
                onChange={(e) =>
                  setFormData({ ...formData, tax_number: e.target.value })
                }
                placeholder="300000000000003"
              />
            </div>

            {/* السجل التجاري */}
            <div>
              <Label htmlFor="commercial_register">السجل التجاري</Label>
              <Input
                id="commercial_register"
                value={formData.commercial_register}
                onChange={(e) =>
                  setFormData({ ...formData, commercial_register: e.target.value })
                }
              />
            </div>

            {/* الجوال */}
            <div>
              <Label htmlFor="phone">رقم الجوال</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                dir="ltr"
              />
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                dir="ltr"
              />
            </div>

            {/* المدينة */}
            <div>
              <Label htmlFor="city">المدينة</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
              />
            </div>

            {/* الحالة */}
            <div>
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="blacklisted">محظور</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* العنوان الوطني */}
            <div className="col-span-2">
              <Label htmlFor="national_address">العنوان الوطني</Label>
              <Input
                id="national_address"
                value={formData.national_address}
                onChange={(e) =>
                  setFormData({ ...formData, national_address: e.target.value })
                }
                placeholder="AAAA1234 - حي - مدينة"
              />
            </div>

            {/* العنوان التفصيلي */}
            <div className="col-span-2">
              <Label htmlFor="address">العنوان التفصيلي</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                rows={2}
              />
            </div>

            {/* ملاحظات */}
            <div className="col-span-2">
              <Label htmlFor="notes">ملاحظات</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              {tenant ? 'حفظ التعديلات' : 'إضافة المستأجر'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
