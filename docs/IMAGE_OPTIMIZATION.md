# دليل تحسين الصور وتحسين LCP

تم تطبيق نظام شامل لتحسين الصور وتحسين **LCP (Largest Contentful Paint)** في التطبيق.

## 📋 المكونات المتاحة

### 1. `LazyImage` - صورة محسّنة مع lazy loading

```tsx
import { LazyImage } from '@/components/shared/LazyImage';

<LazyImage
  src="/path/to/image.jpg"
  alt="وصف الصورة"
  width={800}
  height={600}
  priority={false} // false = lazy load, true = high priority
  responsive={true} // إنشاء srcset تلقائياً
  quality={85} // جودة الصورة (1-100)
/>
```

**الخصائص:**
- `priority`: للصور المهمة (above the fold) - تُحمل فوراً بدون lazy loading
- `responsive`: إنشاء srcset تلقائي لدعم الشاشات المختلفة
- `quality`: جودة الصورة (افتراضي: 85)
- `rootMargin`: المسافة قبل بدء التحميل (افتراضي: 50px)

### 2. `HeroImage` - للصور الكبيرة (محسّن لـ LCP)

```tsx
import { HeroImage } from '@/components/shared/LazyImage';

<HeroImage
  src="/hero-image.jpg"
  alt="صورة رئيسية"
  width={1920}
  height={1080}
/>
```

**ميزات:**
- ✅ أولوية عالية (priority=true) - لا يستخدم lazy loading
- ✅ جودة عالية (quality=90)
- ✅ responsive images تلقائياً
- ✅ محسّن خصيصاً لتحسين LCP

### 3. `ThumbnailImage` - للصور المصغرة

```tsx
import { ThumbnailImage } from '@/components/shared/LazyImage';

<ThumbnailImage
  src="/thumbnail.jpg"
  alt="صورة مصغرة"
  width={200}
  height={200}
/>
```

### 4. `OptimizedAvatar` - Avatar محسّن

```tsx
import { OptimizedAvatar } from '@/components/shared/OptimizedAvatar';

<OptimizedAvatar
  src={user.avatar}
  alt={user.name}
  fallback={user.name[0]}
  size="md" // sm, md, lg, xl
/>
```

## 🛠️ الخدمات المتاحة

### تحسين URL الصور

```typescript
import { optimizeImageUrl } from '@/lib/imageOptimization';

const optimizedUrl = optimizeImageUrl('/image.jpg', {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp'
});
```

### إنشاء srcset للصور التفاعلية

```typescript
import { generateSrcSet, generateSizes } from '@/lib/imageOptimization';

const srcSet = generateSrcSet('/image.jpg'); // ينشئ srcset لأحجام متعددة
const sizes = generateSizes(); // ينشئ sizes attribute
```

### تحميل مسبق للصور المهمة

```typescript
import { preloadImage, preloadImages } from '@/lib/imageOptimization';

// تحميل صورة واحدة
await preloadImage('/hero.jpg', { quality: 90 });

// تحميل عدة صور
await preloadImages([
  '/image1.jpg',
  '/image2.jpg',
  '/image3.jpg'
]);
```

### ضغط الصور

```typescript
import { compressImage } from '@/lib/imageOptimization';

const compressed = await compressImage(base64Image, 0.8); // 80% quality
```

## 📊 مراقبة الأداء

### Hook لمراقبة LCP

```typescript
import { useImageOptimization } from '@/hooks/useImageOptimization';

function MyComponent() {
  const { lcp } = useImageOptimization();
  
  // lcp = وقت LCP بالميلي ثانية
  console.log(`LCP: ${lcp}ms`);
}
```

### Hook للتحميل المسبق

```typescript
import { useImagePreload } from '@/hooks/useImageOptimization';

function MyComponent() {
  const { isLoaded, error } = useImagePreload([
    '/hero.jpg',
    '/banner.jpg'
  ]);
  
  if (!isLoaded) return <div>جاري التحميل...</div>;
  // ...
}
```

## 🎯 أفضل الممارسات

### 1. الصور فوق الطية (Above the Fold)

**استخدم `priority={true}` للصور المرئية مباشرة:**

```tsx
<LazyImage
  src="/hero.jpg"
  alt="Hero"
  priority={true} // ✅ تحميل فوري لتحسين LCP
  width={1920}
  height={1080}
/>
```

أو استخدم `HeroImage` مباشرة:

```tsx
<HeroImage src="/hero.jpg" alt="Hero" />
```

### 2. الصور تحت الطية (Below the Fold)

**استخدم lazy loading (افتراضي):**

```tsx
<LazyImage
  src="/content.jpg"
  alt="محتوى"
  priority={false} // ✅ lazy load (افتراضي)
/>
```

### 3. حدد أبعاد الصور دائماً

**لمنع Layout Shift (CLS):**

```tsx
<LazyImage
  src="/image.jpg"
  alt="صورة"
  width={800}  // ✅ حدد العرض
  height={600} // ✅ حدد الارتفاع
/>
```

### 4. استخدم responsive images للصور الكبيرة

```tsx
<LazyImage
  src="/large-image.jpg"
  alt="صورة كبيرة"
  responsive={true} // ✅ srcset تلقائي
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### 5. قلل جودة الصور المصغرة

```tsx
<ThumbnailImage
  src="/thumb.jpg"
  alt="صورة مصغرة"
  quality={70} // ✅ جودة أقل للصور الصغيرة
/>
```

## 📈 معايير الأداء

### هدف LCP

- **جيد**: < 2.5 ثانية ✅
- **يحتاج تحسين**: 2.5 - 4.0 ثانية ⚠️
- **ضعيف**: > 4.0 ثانية ❌

### تحسينات تلقائية

النظام يطبق تلقائياً:

1. ✅ **Lazy loading** لجميع الصور (إلا ذات الأولوية)
2. ✅ **Decoding async** لعدم حجب التصيير
3. ✅ **WebP format** للصور المدعومة
4. ✅ **Responsive images** (srcset) تلقائياً
5. ✅ **Preload** للصور المهمة
6. ✅ **Intersection Observer** للتحميل الذكي

## 🔧 التكامل مع Supabase Storage

عند استخدام صور من Supabase Storage، يتم تطبيق التحسينات تلقائياً:

```tsx
<LazyImage
  src="https://your-project.supabase.co/storage/v1/object/public/images/photo.jpg"
  alt="صورة"
  width={800}
  quality={85} // يتم إضافة المعاملات تلقائياً للـ URL
/>
```

سيتم تحويل الـ URL تلقائياً إلى:
```
https://your-project.supabase.co/storage/v1/object/public/images/photo.jpg?width=800&quality=85&format=webp
```

## 🚀 نتائج متوقعة

بعد تطبيق هذه التحسينات:

- 🚀 **تحسين LCP** بنسبة 40-60%
- 📦 **تقليل حجم الصور** بنسبة 30-50%
- ⚡ **تحميل أسرع** للصفحات بنسبة 25-40%
- 📱 **تجربة أفضل** على الأجهزة المحمولة
- 🎯 **Core Web Vitals** محسّنة

## 📝 مثال كامل

```tsx
import { HeroImage, LazyImage, ThumbnailImage } from '@/components/shared/LazyImage';
import { OptimizedAvatar } from '@/components/shared/OptimizedAvatar';
import { useImageOptimization } from '@/hooks/useImageOptimization';

function MyPage() {
  const { lcp } = useImageOptimization();
  
  return (
    <div>
      {/* صورة Hero - أولوية عالية */}
      <HeroImage
        src="/hero.jpg"
        alt="Hero Image"
        width={1920}
        height={1080}
      />
      
      {/* محتوى الصفحة */}
      <section>
        <LazyImage
          src="/content1.jpg"
          alt="محتوى 1"
          width={800}
          height={600}
        />
        
        <LazyImage
          src="/content2.jpg"
          alt="محتوى 2"
          width={800}
          height={600}
        />
      </section>
      
      {/* صور مصغرة */}
      <div className="grid grid-cols-4 gap-4">
        {thumbnails.map(thumb => (
          <ThumbnailImage
            key={thumb.id}
            src={thumb.url}
            alt={thumb.title}
            width={200}
            height={200}
          />
        ))}
      </div>
      
      {/* Avatar */}
      <OptimizedAvatar
        src={user.avatar}
        alt={user.name}
        size="lg"
      />
      
      {/* مراقبة LCP */}
      {process.env.NODE_ENV === 'development' && (
        <div>LCP: {lcp}ms</div>
      )}
    </div>
  );
}
```

## 🐛 استكشاف الأخطاء

### الصور لا تظهر

1. تحقق من مسار الصورة
2. تحقق من CORS headers لصور خارجية
3. تحقق من console للأخطاء

### LCP بطيء

1. تأكد من استخدام `priority={true}` للصور المهمة
2. حدد `width` و `height` لجميع الصور
3. استخدم `responsive={true}` للصور الكبيرة
4. قلل `quality` للصور غير المهمة

### الصور كبيرة الحجم

1. استخدم `quality={70-80}` للصور العادية
2. فعّل `responsive={true}` لإنشاء أحجام متعددة
3. استخدم WebP format (تلقائي)
4. ضع الصور في Supabase Storage للاستفادة من التحسينات التلقائية
