# 📁 Requests Components / مكونات الطلبات

هذا المجلد يحتوي على مكونات إدارة الطلبات.

## 📂 الهيكل

```
src/components/requests/
├── index.ts                  # تصدير مركزي
├── RequestsDesktopView.tsx   # عرض سطح المكتب
├── RequestsMobileView.tsx    # عرض الجوال
└── RequestsDialogs.tsx       # الحوارات
```

## 📋 المكونات

### RequestsDesktopView
عرض الطلبات لشاشات سطح المكتب مع جدول تفصيلي.

```typescript
import { RequestsDesktopView } from '@/components/requests';

<RequestsDesktopView 
  requests={requests}
  onView={handleView}
  onApprove={handleApprove}
  onReject={handleReject}
/>
```

### RequestsMobileView
عرض الطلبات للجوال باستخدام بطاقات.

```typescript
import { RequestsMobileView } from '@/components/requests';

<RequestsMobileView 
  requests={requests}
  onView={handleView}
  onApprove={handleApprove}
/>
```

### RequestsDialogs
حوارات إنشاء وتعديل وعرض الطلبات.

```typescript
import { RequestsDialogs } from '@/components/requests';

<RequestsDialogs 
  isOpen={isOpen}
  onClose={onClose}
  request={selectedRequest}
  mode="view" // "create" | "edit" | "view"
/>
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.0.0
