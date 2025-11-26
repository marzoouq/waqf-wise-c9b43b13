# نظام معالجة الأخطاء الموحد

## نظرة عامة

تم تطوير نظام موحد لمعالجة الأخطاء عبر جميع صفحات المنصة لضمان تجربة مستخدم متسقة وموثوقة.

## المكونات الأساسية

### 1. نظام Logging المركزي

**الموقع:** `src/lib/logger.ts`

```typescript
import { logger } from '@/lib/logger';

// تسجيل خطأ
logger.error(error, {
  context: 'اسم الوظيفة أو المكون',
  userId: 'معرف المستخدم',
  severity: 'high',
  metadata: { /* بيانات إضافية */ }
});

// تسجيل تحذير
logger.warn('رسالة التحذير', {
  context: 'السياق',
  severity: 'medium'
});

// تسجيل معلومات
logger.info('رسالة معلوماتية');

// تسجيل debug
logger.debug('رسالة debug', additionalData);
```

**المميزات:**
- مستويات logging متعددة (error, warn, info, debug)
- تسجيل تلقائي في البيئة التطويرية
- إمكانية الإرسال للسيرفر في الإنتاج
- دعم metadata إضافية
- تكامل مع نظام تتبع الأخطاء

### 2. معالج الأخطاء الموحد

**الموقع:** `src/lib/errors/handler.ts`

```typescript
import { handleMutationError, handleQueryError } from '@/lib/errors/handler';

// في mutations
const mutation = useMutation({
  mutationFn: async (data) => {
    // الكود
  },
  onError: (error) => {
    const toast = handleMutationError(error, {
      context: 'createBeneficiary',
      severity: 'high'
    });
    // عرض toast تلقائي
  }
});

// في queries
const { error } = useQuery({
  queryKey: ['data'],
  queryFn: async () => {
    // الكود
  },
  onError: (error) => {
    handleQueryError(error, {
      context: 'fetchData',
      severity: 'medium'
    });
  }
});
```

### 3. نظام الأخطاء المتقدم

**الموقع:** `src/lib/errors/index.ts`

```typescript
import { handleError, createMutationErrorHandler, logError } from '@/lib/errors';

// معالجة خطأ مع toast
handleError(error, {
  context: { operation: 'اسم العملية' },
  showToast: true,
  toastTitle: 'عنوان مخصص',
  severity: 'high'
});

// إنشاء معالج لـ mutation
const errorHandler = createMutationErrorHandler({
  context: 'createData',
  severity: 'high',
  showToast: true
});

// استخدام في mutation
useMutation({
  mutationFn: createData,
  onError: errorHandler
});

// تسجيل خطأ يدوياً
logError('رسالة الخطأ', 'high', {
  userId: 'xxx',
  action: 'specific-action'
});
```

## أفضل الممارسات

### 1. في React Query Hooks

```typescript
export function useCustomData() {
  const { toast } = useToast();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["custom-data"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("table")
          .select("*");
        
        if (error) {
          console.error('Error fetching data:', error);
          throw error;
        }
        return data || [];
      } catch (error) {
        console.error('Error in query:', error);
        throw error;
      }
    },
    retry: 2, // محاولتان إضافيتان
  });

  const createMutation = useMutation({
    mutationFn: async (newData) => {
      try {
        const { data, error } = await supabase
          .from("table")
          .insert([newData])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating:', error);
          throw error;
        }
        return data;
      } catch (error) {
        console.error('Error in mutation:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-data"] });
      toast({
        title: "نجح الحفظ",
        description: "تم حفظ البيانات بنجاح",
      });
    },
    onError: (error) => {
      console.error('Mutation error:', error);
      toast({
        title: "خطأ في الحفظ",
        description: "حدث خطأ، يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    },
  });

  return {
    data,
    isLoading,
    error,
    createData: createMutation.mutateAsync,
  };
}
```

### 2. في مكونات الصفحات

```typescript
export default function CustomPage() {
  const { data, isLoading, error, createData } = useCustomData();

  // معالجة حالة التحميل
  if (isLoading) {
    return <LoadingState />;
  }

  // معالجة حالة الخطأ
  if (error) {
    return (
      <EnhancedEmptyState
        title="حدث خطأ في تحميل البيانات"
        description="نعتذر عن هذا الخلل التقني"
        action={{
          label: "إعادة المحاولة",
          onClick: () => window.location.reload()
        }}
      />
    );
  }

  // معالجة حالة عدم وجود بيانات
  if (data.length === 0) {
    return <EmptyState />;
  }

  // عرض البيانات
  return (
    <div>
      {/* محتوى الصفحة */}
    </div>
  );
}
```

### 3. معالجة الأخطاء في Edge Functions

```typescript
// في edge function
try {
  const { data, error } = await supabase
    .from('table')
    .select('*');

  if (error) {
    console.error('Database error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: 'حدث خطأ في قاعدة البيانات'
      }),
      { status: 500 }
    );
  }

  return new Response(
    JSON.stringify({ success: true, data }),
    { status: 200 }
  );
} catch (error) {
  console.error('Unexpected error:', error);
  return new Response(
    JSON.stringify({
      success: false,
      error: 'حدث خطأ غير متوقع'
    }),
    { status: 500 }
  );
}
```

## مستويات الخطورة

| المستوى | الوصف | الاستخدام |
|---------|--------|-----------|
| `low` | أخطاء غير حرجة | تحذيرات، معلومات إضافية |
| `medium` | أخطاء متوسطة | فشل عمليات غير حرجة |
| `high` | أخطاء حرجة | فشل عمليات مهمة |
| `critical` | أخطاء خطيرة جداً | أعطال النظام، فقدان بيانات |

## التكامل مع Sentry

```typescript
// في src/lib/errors/tracker.ts
import * as Sentry from '@sentry/react';

class ErrorTracker {
  logError(message: string, severity: ErrorSeverity, metadata?: Record<string, unknown>) {
    // التسجيل المحلي
    console.error(`[${severity.toUpperCase()}]`, message, metadata);

    // إرسال لـ Sentry في الإنتاج
    if (!IS_DEV && severity !== 'low') {
      Sentry.captureMessage(message, {
        level: this.mapSeverityToSentryLevel(severity),
        extra: metadata,
      });
    }
  }
}
```

## الإشعارات للمطورين

تم تطوير نظام إشعارات تلقائي للمطورين عبر `useErrorNotifications`:

```typescript
// في Developer Tools
import { useErrorNotifications } from '@/hooks/developer/useErrorNotifications';

function DeveloperTools() {
  // تفعيل الإشعارات التلقائية
  useErrorNotifications(true);
  
  return (
    // محتوى أدوات المطورين
  );
}
```

**المميزات:**
- إشعارات فورية للأخطاء الحرجة
- تحديث كل 10 ثواني
- اشتراكات realtime للأخطاء الجديدة
- عدم تكرار الإشعارات

## الاختبار

### اختبار معالجة الأخطاء

```typescript
// مثال على اختبار
describe('Error Handling', () => {
  it('should handle database errors gracefully', async () => {
    // محاكاة خطأ
    const mockError = new Error('Database connection failed');
    
    // اختبار المعالجة
    const result = handleMutationError(mockError, {
      context: 'test',
      severity: 'high'
    });
    
    expect(result).toHaveProperty('title');
    expect(result).toHaveProperty('description');
    expect(result.variant).toBe('destructive');
  });
});
```

## الصيانة والمراقبة

### 1. مراجعة دورية للـ Logs

```sql
-- استعلام لمراجعة الأخطاء الأخيرة
SELECT 
  error_type,
  error_message,
  severity,
  COUNT(*) as count,
  MAX(created_at) as last_occurrence
FROM system_error_logs
WHERE created_at > NOW() - INTERVAL '24 hours'
GROUP BY error_type, error_message, severity
ORDER BY count DESC, severity DESC;
```

### 2. تنظيف الـ Logs القديمة

```sql
-- حذف logs أقدم من 90 يوم
DELETE FROM system_error_logs
WHERE created_at < NOW() - INTERVAL '90 days';
```

### 3. تحليل الأنماط

```typescript
// في Developer Tools
async function analyzeErrorPatterns() {
  const { data } = await supabase
    .from('system_error_logs')
    .select('*')
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });
  
  // تحليل الأنماط المتكررة
  const patterns = analyzePatterns(data);
  
  return patterns;
}
```

## الخلاصة

نظام معالجة الأخطاء الموحد يوفر:
- ✅ تجربة مستخدم متسقة
- ✅ تسجيل شامل للأخطاء
- ✅ إشعارات فورية للمطورين
- ✅ تكامل مع أدوات المراقبة
- ✅ سهولة الصيانة والتطوير
- ✅ أمان وموثوقية عالية

## الخطوات التالية

1. توسيع نظام الإشعارات ليشمل قنوات إضافية (Slack, Email)
2. إضافة لوحة تحكم تحليلية للأخطاء
3. تطوير نظام تصنيف تلقائي للأخطاء
4. تحسين آليات الاسترجاع التلقائي (Auto-recovery)
