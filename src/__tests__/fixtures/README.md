# 🎭 Fixtures - البيانات الوهمية

## ملفات Fixtures المطلوبة

### المستفيدين
- `beneficiaries.ts` - بيانات المستفيدين
- `families.ts` - بيانات العائلات

### المالية
- `distributions.ts` - بيانات التوزيعات
- `journal-entries.ts` - القيود المحاسبية
- `payments.ts` - المدفوعات
- `loans.ts` - القروض
- `accounts.ts` - الحسابات

### العقارات
- `properties.ts` - العقارات
- `contracts.ts` - العقود
- `rental-payments.ts` - دفعات الإيجار

### المستخدمين
- `users.ts` - المستخدمين والأدوار

## مثال على Fixture

```typescript
import { Beneficiary } from '@/types/database';

export const mockBeneficiary = (overrides?: Partial<Beneficiary>): Beneficiary => ({
  id: 'test-id',
  full_name: 'مستفيد اختبار',
  national_id: '1234567890',
  phone: '0501234567',
  category: 'أسر منتجة',
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const mockBeneficiaries = (count: number = 5): Beneficiary[] => {
  return Array.from({ length: count }, (_, i) => 
    mockBeneficiary({ 
      id: `test-id-${i}`,
      full_name: `مستفيد ${i + 1}` 
    })
  );
};
```
