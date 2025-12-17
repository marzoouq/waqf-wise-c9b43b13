import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ContractFormData } from "./useContractForm";
import { Property } from "@/hooks/property/useProperties";
import { useTenants } from "@/hooks/property/useTenants";
import { TenantDialog } from "@/components/tenants/TenantDialog";
import { UserPlus, Search } from "lucide-react";
import type { TenantInsert } from "@/types/tenants";

interface Props {
  formData: ContractFormData;
  onUpdate: (updates: Partial<ContractFormData>) => void;
  properties: Property[] | undefined;
}

export function ContractTenantFields({ formData, onUpdate, properties }: Props) {
  const { tenants, addTenant, isAdding } = useTenants();
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [searchMode, setSearchMode] = useState<'select' | 'manual'>('select');

  // عند اختيار مستأجر من القائمة، تعبئة الحقول تلقائياً
  const handleTenantSelect = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      onUpdate({
        tenant_id: tenantId,
        tenant_name: selectedTenant.full_name,
        tenant_id_number: selectedTenant.id_number,
        tenant_phone: selectedTenant.phone || '',
        tenant_email: selectedTenant.email || '',
      });
    }
  };

  // إضافة مستأجر جديد
  const handleAddTenant = async (data: TenantInsert) => {
    const newTenant = await addTenant(data);
    if (newTenant) {
      onUpdate({
        tenant_id: newTenant.id,
        tenant_name: newTenant.full_name,
        tenant_id_number: newTenant.id_number,
        tenant_phone: newTenant.phone || '',
        tenant_email: newTenant.email || '',
      });
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>العقار *</Label>
          <Select
            value={formData.property_id}
            onValueChange={(value) => onUpdate({ property_id: value })}
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
          <Label>نوع العقد *</Label>
          <Select
            value={formData.contract_type}
            onValueChange={(value) => onUpdate({ contract_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="إيجار">إيجار</SelectItem>
              <SelectItem value="بيع">بيع</SelectItem>
              <SelectItem value="صيانة">صيانة</SelectItem>
              <SelectItem value="خدمات">خدمات</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* اختيار المستأجر */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>المستأجر *</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={searchMode === 'select' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('select')}
            >
              <Search className="h-4 w-4 ms-1" />
              اختيار من القائمة
            </Button>
            <Button
              type="button"
              variant={searchMode === 'manual' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSearchMode('manual')}
            >
              إدخال يدوي
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowTenantDialog(true)}
            >
              <UserPlus className="h-4 w-4 ms-1" />
              مستأجر جديد
            </Button>
          </div>
        </div>

        {searchMode === 'select' ? (
          <Select
            value={formData.tenant_id || ''}
            onValueChange={handleTenantSelect}
          >
            <SelectTrigger>
              <SelectValue placeholder="اختر المستأجر" />
            </SelectTrigger>
            <SelectContent>
              {tenants.map((tenant) => (
                <SelectItem key={tenant.id} value={tenant.id}>
                  {tenant.full_name} - {tenant.id_number}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم المستأجر *</Label>
              <Input
                value={formData.tenant_name}
                onChange={(e) => onUpdate({ tenant_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهوية *</Label>
              <Input
                value={formData.tenant_id_number}
                onChange={(e) => onUpdate({ tenant_id_number: e.target.value })}
                required
              />
            </div>
          </div>
        )}
      </div>

      {/* عرض بيانات المستأجر المحدد */}
      {formData.tenant_name && (
        <div className="grid grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">اسم المستأجر</Label>
            <p className="text-sm font-medium">{formData.tenant_name}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">رقم الهوية</Label>
            <p className="text-sm font-medium font-mono">{formData.tenant_id_number}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>رقم الجوال *</Label>
          <Input
            value={formData.tenant_phone}
            onChange={(e) => onUpdate({ tenant_phone: e.target.value })}
            required
            dir="ltr"
          />
        </div>

        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            value={formData.tenant_email}
            onChange={(e) => onUpdate({ tenant_email: e.target.value })}
            dir="ltr"
          />
        </div>
      </div>

      {/* نافذة إضافة مستأجر جديد */}
      <TenantDialog
        open={showTenantDialog}
        onOpenChange={setShowTenantDialog}
        onSubmit={handleAddTenant}
        isLoading={isAdding}
      />
    </>
  );
}
