# 📁 Services Directory / مجلد الخدمات

طبقة الخدمات (Services Layer) التي تفصل منطق الأعمال عن الـ UI.

## 📂 الهيكل

```
src/services/
├── index.ts                    # تصدير مركزي
├── beneficiary.service.ts      # خدمة المستفيدين
├── property.service.ts         # خدمة العقارات
├── distribution.service.ts     # خدمة التوزيعات
├── accounting.service.ts       # خدمة المحاسبة
├── notification.service.ts     # خدمة الإشعارات
├── report.service.ts           # خدمة التقارير
├── request.service.ts          # خدمة الطلبات
└── voucher.service.ts          # خدمة السندات
```

## 📋 الخدمات المتوفرة

### 👥 BeneficiaryService
```typescript
import { BeneficiaryService } from '@/services';

// الوظائف
BeneficiaryService.getAll(filters?)           // جلب مع الفلاتر
BeneficiaryService.getById(id)                // جلب واحد
BeneficiaryService.getByNationalId(id)        // جلب بالهوية
BeneficiaryService.create(data)               // إضافة
BeneficiaryService.update(id, data)           // تحديث
BeneficiaryService.delete(id)                 // حذف
BeneficiaryService.updateStatus(id, status)   // تغيير الحالة
BeneficiaryService.verify(id, verifiedBy)     // التحقق
BeneficiaryService.getStats()                 // الإحصائيات
BeneficiaryService.getFamilyMembers(id)       // أفراد العائلة
BeneficiaryService.advancedSearch(params)     // بحث متقدم
```

### 🏢 PropertyService
```typescript
import { PropertyService } from '@/services';

PropertyService.getAll(filters?)              // جلب العقارات
PropertyService.getById(id)                   // جلب واحد
PropertyService.create(data)                  // إضافة
PropertyService.update(id, data)              // تحديث
PropertyService.delete(id)                    // حذف
PropertyService.getStats()                    // إحصائيات
PropertyService.updateOccupancy(id, status)   // تحديث الإشغال
PropertyService.getByType(type)               // جلب حسب النوع
PropertyService.getVacant()                   // العقارات الشاغرة
PropertyService.calculateExpectedRevenue()    // حساب الإيراد
```

### 📊 DistributionService
```typescript
import { DistributionService } from '@/services';

DistributionService.getAll(status?)           // جلب التوزيعات
DistributionService.getById(id)               // جلب واحد
DistributionService.create(data)              // إنشاء
DistributionService.update(id, data)          // تحديث
DistributionService.delete(id)                // حذف (مسودات فقط)
DistributionService.approve(id, approvedBy)   // موافقة
DistributionService.execute(id)               // تنفيذ
DistributionService.getDetails(id)            // التفاصيل
DistributionService.simulate(params)          // محاكاة
DistributionService.generateReport(id)        // تقرير
```

### 💰 AccountingService
```typescript
import { AccountingService } from '@/services';

AccountingService.getAccounts(parentId?)      // شجرة الحسابات
AccountingService.getJournalEntries(filters)  // القيود
AccountingService.createJournalEntry(data)    // إنشاء قيد
AccountingService.postJournalEntry(id)        // ترحيل
AccountingService.getTrialBalance(params)     // ميزان المراجعة
AccountingService.getIncomeStatement(params)  // قائمة الدخل
AccountingService.getBalanceSheet(params)     // الميزانية
AccountingService.reconcileBank(params)       // تسوية بنكية
```

### 🔔 NotificationService
```typescript
import { NotificationService } from '@/services';

NotificationService.send(notification)        // إرسال إشعار
NotificationService.sendBulk(notifications)   // إرسال متعدد
NotificationService.markAsRead(id)            // قراءة
NotificationService.markAllAsRead(userId)     // قراءة الكل
NotificationService.getUnreadCount(userId)    // عدد غير المقروءة
NotificationService.getSettings(userId)       // الإعدادات
```

### 📄 ReportService
```typescript
import { ReportService } from '@/services';

ReportService.generate(type, params)          // توليد تقرير
ReportService.schedule(config)                // جدولة
ReportService.export(reportId, format)        // تصدير
ReportService.getHistory(filters)             // السجل
```

### 📝 RequestService
```typescript
import { RequestService } from '@/services';

RequestService.submit(data)                   // تقديم طلب
RequestService.approve(id, notes)             // موافقة
RequestService.reject(id, reason)             // رفض
RequestService.assign(id, assigneeId)         // تعيين
RequestService.getByStatus(status)            // حسب الحالة
RequestService.getStats()                     // إحصائيات
```

### 🧾 VoucherService
```typescript
import { VoucherService } from '@/services';

VoucherService.create(data)                   // إنشاء سند
VoucherService.approve(id)                    // موافقة
VoucherService.print(id)                      // طباعة
VoucherService.generatePDF(id)                // PDF
VoucherService.getByType(type)                // حسب النوع
```

## 🔄 أمثلة الاستخدام

### في Hook
```typescript
import { BeneficiaryService } from '@/services';
import { useQuery } from '@tanstack/react-query';

export function useBeneficiaryStats() {
  return useQuery({
    queryKey: ['beneficiary-stats'],
    queryFn: () => BeneficiaryService.getStats(),
  });
}
```

### في Component
```typescript
import { NotificationService } from '@/services';

const handleSendNotification = async () => {
  await NotificationService.send({
    userId: user.id,
    title: 'إشعار جديد',
    message: 'تم معالجة طلبك بنجاح',
  });
};
```

---

**آخر تحديث:** 2025-11-29
