import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContractFormData } from "./useContractForm";
import { Property } from "@/hooks/useProperties";

interface Props {
  formData: ContractFormData;
  onUpdate: (updates: Partial<ContractFormData>) => void;
  properties: Property[] | undefined;
}

export function ContractTenantFields({ formData, onUpdate, properties }: Props) {
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

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>رقم الجوال *</Label>
          <Input
            value={formData.tenant_phone}
            onChange={(e) => onUpdate({ tenant_phone: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>البريد الإلكتروني</Label>
          <Input
            type="email"
            value={formData.tenant_email}
            onChange={(e) => onUpdate({ tenant_email: e.target.value })}
          />
        </div>
      </div>
    </>
  );
}
