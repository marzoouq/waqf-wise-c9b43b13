# 📚 مرجع API - منصة إدارة الوقف

## 🪝 Hooks Reference

### المصادقة والصلاحيات

#### `useAuth`
```typescript
const { user, session, loading, signIn, signUp, signOut } = useAuth();
```
| العنصر | النوع | الوصف |
|--------|-------|-------|
| `user` | `User \| null` | المستخدم الحالي |
| `session` | `Session \| null` | الجلسة الحالية |
| `loading` | `boolean` | حالة التحميل |
| `signIn` | `(email, password) => Promise` | تسجيل الدخول |
| `signUp` | `(email, password) => Promise` | إنشاء حساب |
| `signOut` | `() => Promise` | تسجيل الخروج |

#### `useUserRole`
```typescript
const { roles, hasRole, isAdmin, isNazer, loading } = useUserRole();
```
| العنصر | النوع | الوصف |
|--------|-------|-------|
| `roles` | `string[]` | أدوار المستخدم |
| `hasRole` | `(role: string) => boolean` | التحقق من دور |
| `isAdmin` | `boolean` | هل مدير؟ |
| `isNazer` | `boolean` | هل ناظر؟ |

#### `usePermissions`
```typescript
const { permissions, hasPermission, canAccess } = usePermissions();
```

---

### إدارة المستفيدين

#### `useBeneficiaries`
```typescript
const { 
  beneficiaries, 
  isLoading, 
  createBeneficiary, 
  updateBeneficiary, 
  deleteBeneficiary 
} = useBeneficiaries();
```

#### `useBeneficiaryProfile`
```typescript
const { profile, updateProfile, isLoading } = useBeneficiaryProfile(id);
```

#### `useFamilies`
```typescript
const { families, createFamily, addMember, removeMember } = useFamilies();
```

#### `useBeneficiaryAttachments`
```typescript
const { 
  attachments, 
  uploadAttachment, 
  deleteAttachment 
} = useBeneficiaryAttachments(beneficiaryId);
```

---

### المحاسبة

#### `useAccounts`
```typescript
const { accounts, createAccount, updateAccount, deleteAccount } = useAccounts();
```

#### `useJournalEntries`
```typescript
const { 
  entries, 
  createEntry, 
  postEntry, 
  reverseEntry 
} = useJournalEntries();
```

#### `useBudgets`
```typescript
const { budgets, createBudget, updateBudget, getBudgetStatus } = useBudgets();
```

#### `useBankAccounts`
```typescript
const { 
  bankAccounts, 
  createBankAccount, 
  getBalance, 
  reconcile 
} = useBankAccounts();
```

#### `useBankReconciliation`
```typescript
const { 
  reconciliations, 
  matchTransaction, 
  createAdjustment 
} = useBankReconciliation();
```

---

### التوزيعات

#### `useDistributions`
```typescript
const { 
  distributions, 
  createDistribution, 
  approveDistribution, 
  executeDistribution 
} = useDistributions();
```

#### `useDistributionEngine`
```typescript
const { 
  simulate, 
  calculate, 
  applyDeductions 
} = useDistributionEngine();
```

#### `usePaymentVouchers`
```typescript
const { 
  vouchers, 
  createVoucher, 
  printVoucher, 
  cancelVoucher 
} = usePaymentVouchers();
```

---

### العقارات

#### `useProperties`
```typescript
const { 
  properties, 
  createProperty, 
  updateProperty, 
  getPropertyStats 
} = useProperties();
```

#### `useContracts`
```typescript
const { 
  contracts, 
  createContract, 
  renewContract, 
  terminateContract 
} = useContracts();
```

#### `useMaintenanceRequests`
```typescript
const { 
  requests, 
  createRequest, 
  assignRequest, 
  completeRequest 
} = useMaintenanceRequests();
```

---

### الطلبات والموافقات

#### `useRequests`
```typescript
const { 
  requests, 
  createRequest, 
  updateStatus, 
  assignRequest 
} = useRequests();
```

#### `useApprovals`
```typescript
const { 
  pendingApprovals, 
  approve, 
  reject, 
  escalate 
} = useApprovals();
```

#### `useApprovalWorkflows`
```typescript
const { 
  workflows, 
  createWorkflow, 
  getWorkflowSteps 
} = useApprovalWorkflows();
```

---

### الإشعارات

#### `useNotifications`
```typescript
const { 
  notifications, 
  unreadCount, 
  markAsRead, 
  markAllAsRead 
} = useNotifications();
```

#### `useNotificationSystem`
```typescript
const { 
  send, 
  sendBulk, 
  scheduleNotification 
} = useNotificationSystem();
```

---

### التقارير

#### `useReports`
```typescript
const { 
  reports, 
  generateReport, 
  exportToPDF, 
  exportToExcel 
} = useReports();
```

#### `useCustomReports`
```typescript
const { 
  templates, 
  createTemplate, 
  runReport 
} = useCustomReports();
```

#### `useScheduledReports`
```typescript
const { 
  schedules, 
  createSchedule, 
  pauseSchedule 
} = useScheduledReports();
```

---

## 🔧 Services Reference

### BeneficiaryService
```typescript
import { beneficiaryService } from '@/services';

// إنشاء مستفيد
await beneficiaryService.create(data);

// تحديث مستفيد
await beneficiaryService.update(id, data);

// حذف مستفيد
await beneficiaryService.delete(id);

// البحث
await beneficiaryService.search(filters);
```

### DistributionService
```typescript
import { distributionService } from '@/services';

// محاكاة التوزيع
const simulation = await distributionService.simulate(fundId, amount);

// تنفيذ التوزيع
await distributionService.execute(distributionId);

// إنشاء سندات الصرف
await distributionService.generateVouchers(distributionId);
```

### PaymentService
```typescript
import { paymentService } from '@/services';

// معالجة الدفع
await paymentService.process(paymentData);

// إنشاء ملف تحويل بنكي
await paymentService.generateBankFile(payments);
```

### NotificationService
```typescript
import { notificationService } from '@/services';

// إرسال إشعار
await notificationService.send(userId, message, type);

// إرسال جماعي
await notificationService.sendBulk(userIds, message);
```

### ApprovalService
```typescript
import { approvalService } from '@/services';

// الموافقة
await approvalService.approve(entityId, entityType, notes);

// الرفض
await approvalService.reject(entityId, entityType, reason);
```

---

## 🗄️ Database Tables

### الجداول الرئيسية

| الجدول | الوصف |
|--------|-------|
| `beneficiaries` | بيانات المستفيدين |
| `families` | بيانات العائلات |
| `accounts` | شجرة الحسابات |
| `journal_entries` | القيود المحاسبية |
| `distributions` | التوزيعات |
| `payment_vouchers` | سندات الصرف |
| `properties` | العقارات |
| `contracts` | العقود |
| `beneficiary_requests` | طلبات المستفيدين |
| `notifications` | الإشعارات |
| `user_roles` | أدوار المستخدمين |

---

## 🔐 RLS Policies

### سياسات الأمان الافتراضية

```sql
-- المستفيدين: يمكن للمستخدم رؤية بياناته فقط
CREATE POLICY "beneficiary_select" ON beneficiaries
  FOR SELECT USING (user_id = auth.uid() OR has_role('admin'));

-- القيود المحاسبية: المحاسب والمدير فقط
CREATE POLICY "journal_entries_select" ON journal_entries
  FOR SELECT USING (has_role('accountant') OR has_role('admin'));
```

---

**آخر تحديث**: 2025-11-27
