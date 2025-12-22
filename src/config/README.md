# 📁 Config Directory / مجلد الإعدادات

هذا المجلد يحتوي على إعدادات التطبيق المركزية.

## 📂 الهيكل

```
src/config/
├── index.ts           # تصدير مركزي
└── permissions.ts     # خريطة الصلاحيات والأدوار
```

## 📋 المحتويات

### 🔐 permissions.ts

#### الأدوار المتوفرة
```typescript
type UserRole = 
  | 'nazer'       // الناظر
  | 'admin'       // مدير النظام
  | 'accountant'  // المحاسب
  | 'cashier'     // أمين الصندوق
  | 'archivist'   // الأرشيفي
  | 'employee'    // الموظف
  | 'beneficiary' // المستفيد
```

#### خريطة الصلاحيات
```typescript
ROLE_PERMISSIONS = {
  nazer: [
    'view_dashboard',
    'manage_beneficiaries',
    'approve_distributions',
    'view_financial_reports',
    'manage_users',
    // ... صلاحيات كاملة
  ],
  
  admin: [
    'view_dashboard',
    'manage_users',
    'manage_settings',
    'view_audit_logs',
    // ...
  ],
  
  accountant: [
    'view_dashboard',
    'manage_journal_entries',
    'manage_bank_accounts',
    'view_financial_reports',
    // ...
  ],
  
  // ... باقي الأدوار
}
```

#### الدوال المتوفرة
```typescript
// فحص صلاحية محددة
checkPermission(role: UserRole, permission: string): boolean

// جلب كل صلاحيات دور
getRolePermissions(role: UserRole): string[]

// فحص عدة صلاحيات
hasAnyPermission(role: UserRole, permissions: string[]): boolean
hasAllPermissions(role: UserRole, permissions: string[]): boolean
```

## 🔄 طريقة الاستخدام

### استيراد الإعدادات
```typescript
import { 
  ROLE_PERMISSIONS, 
  checkPermission, 
  getRolePermissions 
} from '@/config';
```

### فحص الصلاحيات
```typescript
// فحص صلاحية واحدة
if (checkPermission(userRole, 'approve_distributions')) {
  // السماح بالموافقة على التوزيعات
}

// جلب كل الصلاحيات
const permissions = getRolePermissions('accountant');
```

### في المكونات
```typescript
import { useAuth } from '@/hooks';
import { checkPermission } from '@/config';

function ApprovalButton() {
  const { userRole } = useAuth();
  
  if (!checkPermission(userRole, 'approve_distributions')) {
    return null;
  }
  
  return <Button>موافقة</Button>;
}
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.1.0
