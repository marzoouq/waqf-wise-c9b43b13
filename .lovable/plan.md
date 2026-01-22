

# خطة تنفيذ التوصيات الثلاثة لـ BankReconciliationDialog

## التحقق المنهجي المكتمل

### الأدلة من الكود الفعلي:

| التوصية | الملفات المرجعية | النمط المستخدم |
|---------|-----------------|---------------|
| Toast | 72 ملف يستخدمه | `useToast` من `@/hooks/ui/use-toast` |
| Empty State | `ResponsiveTable.tsx` السطر 29-35 | `if (data.length === 0) return <div>...</div>` |
| Skeleton | 83 ملف يستخدمه | `Skeleton` من `@/components/ui/skeleton` |

---

## التعديل 1: استبدال alert() بـ toast

### الكود الحالي (السطر 38-40):
```typescript
if (newStatement.opening_balance === 0 || newStatement.closing_balance === 0) {
  alert("يرجى إدخال الرصيد الافتتاحي والختامي");
  return;
}
```

### الكود الجديد:
```typescript
import { useToast } from "@/hooks/ui/use-toast";

// داخل المكون
const { toast } = useToast();

// في handleCreateStatement
if (newStatement.opening_balance === 0 || newStatement.closing_balance === 0) {
  toast({
    title: "تنبيه",
    description: "يرجى إدخال الرصيد الافتتاحي والختامي",
    variant: "destructive",
  });
  return;
}
```

---

## التعديل 2: إضافة Empty State للجدول

### الكود الحالي (السطر 130-156):
```typescript
<TableBody>
  {statements.map((statement) => (
    <TableRow key={statement.id}>
      ...
    </TableRow>
  ))}
</TableBody>
```

### الكود الجديد:
```typescript
<TableBody>
  {statements.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-10 w-10 opacity-50" />
          <span>لا توجد كشوف حساب سابقة</span>
        </div>
      </TableCell>
    </TableRow>
  ) : (
    statements.map((statement) => (
      <TableRow key={statement.id}>
        ...
      </TableRow>
    ))
  )}
</TableBody>
```

---

## التعديل 3: إضافة Loading Skeleton

### الكود الحالي (السطر 66-81):
```typescript
<Select
  value={newStatement.bank_account_id}
  onValueChange={(value) => setNewStatement({ ...newStatement, bank_account_id: value })}
  disabled={loadingBankAccounts}
>
  ...
</Select>
```

### الكود الجديد:
```typescript
import { Skeleton } from "@/components/ui/skeleton";

// في JSX
{loadingBankAccounts ? (
  <Skeleton className="h-10 w-full" />
) : (
  <Select
    value={newStatement.bank_account_id}
    onValueChange={(value) => setNewStatement({ ...newStatement, bank_account_id: value })}
  >
    ...
  </Select>
)}
```

---

## الملف النهائي بعد التعديلات

### الـ Imports الجديدة:
```typescript
import { useToast } from "@/hooks/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText } from "lucide-react";  // إضافة للـ Empty State icon
```

---

## ملخص التعديلات

| الموقع | التعديل | السطور المتأثرة |
|--------|---------|----------------|
| Imports | إضافة `useToast`, `Skeleton`, `FileText` | 1-13 |
| داخل المكون | إضافة `const { toast } = useToast()` | بعد السطر 22 |
| handleCreateStatement | استبدال `alert()` بـ `toast()` | 38-40 |
| Select للحسابات | إضافة Skeleton loading | 64-82 |
| TableBody | إضافة Empty State | 130-156 |

---

## الوقت المقدر

| المهمة | الوقت |
|--------|-------|
| استبدال alert بـ toast | 2 دقيقة |
| إضافة Empty State | 3 دقائق |
| إضافة Loading Skeleton | 2 دقائق |
| **الإجمالي** | **~7 دقائق** |

