# 📋 مكونات الموافقات (Approval Components)

## المكونات الموجودة

### `ApprovalWorkflowBuilder` (في `/accounting`)
**الهدف**: عرض وإدارة مسارات الموافقات المحفوظة في قاعدة البيانات

**الاستخدام**:
```tsx
import { ApprovalWorkflowBuilder } from '@/components/accounting/ApprovalWorkflowBuilder';

<ApprovalWorkflowBuilder />
```

**المميزات**:
- ✅ يقرأ البيانات من Supabase (`approval_workflows`)
- ✅ يعرض المسارات النشطة والمعطلة
- ✅ مرتبط بنظام المحاسبة
- ✅ يستخدم `useApprovalWorkflows` hook

**موقع الاستخدام**: 
- صفحة المحاسبة المتقدمة (`AdvancedAccountingTab`)

---

**آخر تحديث:** 2025-12-22 | **الإصدار:** 3.0.0
