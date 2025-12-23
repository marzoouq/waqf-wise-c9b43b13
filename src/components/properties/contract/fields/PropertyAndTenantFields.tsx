import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Property } from "@/hooks/property/useProperties";
import { useTenants } from "@/hooks/property/useTenants";
import { TenantDialog } from "@/components/tenants/TenantDialog";
import { UserPlus, Search } from "lucide-react";
import type { TenantInsert } from "@/types/tenants";
import type { ContractFormValues } from "../contractSchema";

interface Props {
  form: UseFormReturn<ContractFormValues>;
  properties: Property[] | undefined;
  isEditing: boolean;
}

export function PropertyAndTenantFields({ form, properties, isEditing }: Props) {
  const { tenants, addTenant, isAdding } = useTenants();
  const [showTenantDialog, setShowTenantDialog] = useState(false);
  const [searchMode, setSearchMode] = useState<'select' | 'manual'>('select');

  // عند اختيار مستأجر من القائمة
  const handleTenantSelect = (tenantId: string) => {
    const selectedTenant = tenants.find(t => t.id === tenantId);
    if (selectedTenant) {
      form.setValue('tenant_id', tenantId);
      form.setValue('tenant_name', selectedTenant.full_name);
      form.setValue('tenant_id_number', selectedTenant.id_number);
      form.setValue('tenant_phone', selectedTenant.phone || '');
      form.setValue('tenant_email', selectedTenant.email || '');
    }
  };

  // إضافة مستأجر جديد
  const handleAddTenant = async (data: TenantInsert) => {
    const newTenant = await addTenant(data);
    if (newTenant) {
      form.setValue('tenant_id', newTenant.id);
      form.setValue('tenant_name', newTenant.full_name);
      form.setValue('tenant_id_number', newTenant.id_number);
      form.setValue('tenant_phone', newTenant.phone || '');
      form.setValue('tenant_email', newTenant.email || '');
    }
  };

  const tenantName = form.watch('tenant_name');
  const tenantIdNumber = form.watch('tenant_id_number');

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="property_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>العقار *</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={isEditing}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العقار" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contract_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>نوع العقد *</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="إيجار">إيجار</SelectItem>
                  <SelectItem value="بيع">بيع</SelectItem>
                  <SelectItem value="صيانة">صيانة</SelectItem>
                  <SelectItem value="خدمات">خدمات</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* اختيار المستأجر */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>المستأجر *</Label>
          <div className="flex flex-wrap gap-2">
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
            value={form.watch('tenant_id') || ''}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tenant_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم المستأجر *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tenant_id_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم الهوية *</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
      </div>

      {/* عرض بيانات المستأجر المحدد */}
      {tenantName && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-muted/50 rounded-lg">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">اسم المستأجر</Label>
            <p className="text-sm font-medium">{tenantName}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">رقم الهوية</Label>
            <p className="text-sm font-medium font-mono">{tenantIdNumber}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="tenant_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الجوال *</FormLabel>
              <FormControl>
                <Input {...field} dir="ltr" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tenant_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl>
                <Input type="email" {...field} dir="ltr" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
