# أمثلة عملية على تحسين الصور

## 1. صفحة Landing Page

```tsx
import { HeroImage, LazyImage } from '@/components/shared/LazyImage';

function LandingPage() {
  return (
    <div>
      {/* Hero Section - أولوية عالية */}
      <section className="relative h-screen">
        <HeroImage
          src="/hero-bg.jpg"
          alt="صورة رئيسية"
          width={1920}
          height={1080}
          className="absolute inset-0 object-cover"
        />
        <div className="relative z-10">
          <h1>مرحباً بكم</h1>
        </div>
      </section>

      {/* Features Section - lazy load */}
      <section className="py-16">
        <div className="grid grid-cols-3 gap-8">
          <div>
            <LazyImage
              src="/feature-1.jpg"
              alt="ميزة 1"
              width={400}
              height={300}
              responsive={true}
            />
            <h3>ميزة 1</h3>
          </div>
          
          <div>
            <LazyImage
              src="/feature-2.jpg"
              alt="ميزة 2"
              width={400}
              height={300}
              responsive={true}
            />
            <h3>ميزة 2</h3>
          </div>
          
          <div>
            <LazyImage
              src="/feature-3.jpg"
              alt="ميزة 3"
              width={400}
              height={300}
              responsive={true}
            />
            <h3>ميزة 3</h3>
          </div>
        </div>
      </section>
    </div>
  );
}
```

## 2. معرض الصور (Gallery)

```tsx
import { ThumbnailImage, LazyImage } from '@/components/shared/LazyImage';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useState } from 'react';

function ImageGallery({ images }) {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <>
      {/* شبكة الصور المصغرة */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((img) => (
          <button
            key={img.id}
            onClick={() => setSelectedImage(img)}
            className="relative aspect-square overflow-hidden rounded-lg hover:opacity-80 transition"
          >
            <ThumbnailImage
              src={img.thumbnail}
              alt={img.title}
              width={200}
              height={200}
              quality={70} // جودة أقل للصور المصغرة
            />
          </button>
        ))}
      </div>

      {/* معاينة بالحجم الكامل */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          {selectedImage && (
            <LazyImage
              src={selectedImage.full}
              alt={selectedImage.title}
              width={1200}
              height={800}
              priority={true} // تحميل فوري عند الفتح
              quality={90} // جودة عالية للمعاينة
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
```

## 3. قائمة المستفيدين مع صور

```tsx
import { OptimizedAvatar } from '@/components/shared/OptimizedAvatar';
import { LazyImage } from '@/components/shared/LazyImage';

function BeneficiaryList({ beneficiaries }) {
  return (
    <div className="space-y-4">
      {beneficiaries.map((beneficiary) => (
        <div key={beneficiary.id} className="flex items-center gap-4 p-4 border rounded">
          {/* صورة المستفيد - Avatar محسّن */}
          <OptimizedAvatar
            src={beneficiary.avatar}
            alt={beneficiary.full_name}
            fallback={beneficiary.full_name[0]}
            size="lg"
          />

          <div className="flex-1">
            <h3>{beneficiary.full_name}</h3>
            <p className="text-sm text-muted-foreground">{beneficiary.national_id}</p>
          </div>

          {/* مستندات المستفيد */}
          {beneficiary.documents?.length > 0 && (
            <div className="flex gap-2">
              {beneficiary.documents.slice(0, 3).map((doc) => (
                <LazyImage
                  key={doc.id}
                  src={doc.thumbnail}
                  alt={doc.name}
                  width={60}
                  height={60}
                  className="rounded border"
                  quality={60}
                />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 4. صفحة تفاصيل عقار

```tsx
import { HeroImage, ThumbnailImage, LazyImage } from '@/components/shared/LazyImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function PropertyDetails({ property }) {
  return (
    <div className="space-y-8">
      {/* صورة العقار الرئيسية - أولوية عالية */}
      <HeroImage
        src={property.mainImage}
        alt={property.name}
        width={1200}
        height={600}
        className="rounded-lg"
      />

      {/* معلومات العقار */}
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h1>{property.name}</h1>
          <p>{property.description}</p>
        </div>

        {/* صور إضافية */}
        <Tabs defaultValue="photos">
          <TabsList>
            <TabsTrigger value="photos">الصور</TabsTrigger>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
          </TabsList>

          <TabsContent value="photos" className="grid grid-cols-3 gap-2">
            {property.images.map((img) => (
              <ThumbnailImage
                key={img.id}
                src={img.url}
                alt={img.title}
                width={200}
                height={200}
                className="rounded"
              />
            ))}
          </TabsContent>

          <TabsContent value="documents" className="space-y-2">
            {property.documents.map((doc) => (
              <div key={doc.id} className="flex items-center gap-4 p-4 border rounded">
                <LazyImage
                  src={doc.preview}
                  alt={doc.name}
                  width={80}
                  height={80}
                  className="rounded"
                  quality={60}
                />
                <div>
                  <h4>{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">{doc.type}</p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

## 5. استخدام التحميل المسبق

```tsx
import { useImagePreload } from '@/hooks/useImageOptimization';
import { HeroImage } from '@/components/shared/LazyImage';

function HomePage() {
  // تحميل مسبق للصور المهمة
  const { isLoaded } = useImagePreload([
    '/hero-1.jpg',
    '/hero-2.jpg',
    '/hero-3.jpg',
  ]);

  if (!isLoaded) {
    return <div className="h-screen flex items-center justify-center">
      <div className="animate-pulse">جاري التحميل...</div>
    </div>;
  }

  return (
    <div>
      <HeroImage src="/hero-1.jpg" alt="Hero 1" width={1920} height={1080} />
      {/* باقي المحتوى */}
    </div>
  );
}
```

## 6. مكون Card مع صورة محسّنة

```tsx
import { LazyImage } from '@/components/shared/LazyImage';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function PropertyCard({ property }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-video">
        <LazyImage
          src={property.image}
          alt={property.name}
          width={400}
          height={300}
          className="object-cover"
          responsive={true}
        />
        {property.isFeatured && (
          <div className="absolute top-2 right-2 bg-primary text-white px-3 py-1 rounded">
            مميز
          </div>
        )}
      </div>
      
      <CardHeader>
        <h3>{property.name}</h3>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground">{property.location}</p>
        <p className="text-lg font-bold mt-2">{property.price} ريال</p>
      </CardContent>
    </Card>
  );
}
```

## 7. صور متعددة الأحجام (Responsive)

```tsx
import { LazyImage } from '@/components/shared/LazyImage';

function ResponsiveImageExample() {
  return (
    <LazyImage
      src="/banner.jpg"
      alt="Banner"
      width={1920}
      height={400}
      responsive={true}
      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px"
      // srcset سيتم إنشاؤه تلقائياً:
      // /banner.jpg?width=320 320w,
      // /banner.jpg?width=640 640w,
      // /banner.jpg?width=768 768w,
      // /banner.jpg?width=1024 1024w,
      // /banner.jpg?width=1280 1280w,
      // /banner.jpg?width=1536 1536w
    />
  );
}
```

## 8. صور من Supabase Storage

```tsx
import { LazyImage } from '@/components/shared/LazyImage';

function SupabaseImageExample() {
  const imageUrl = 'https://xxx.supabase.co/storage/v1/object/public/images/photo.jpg';

  return (
    <LazyImage
      src={imageUrl}
      alt="صورة من Supabase"
      width={800}
      height={600}
      quality={85}
      responsive={true}
      // سيتم تحويل URL تلقائياً إلى:
      // https://xxx.supabase.co/storage/v1/object/public/images/photo.jpg?width=800&quality=85&format=webp
    />
  );
}
```

## 9. مراقبة LCP في المكون

```tsx
import { useImageOptimization } from '@/hooks/useImageOptimization';
import { HeroImage } from '@/components/shared/LazyImage';
import { useEffect } from 'react';

function MonitoredPage() {
  const { lcp } = useImageOptimization();

  useEffect(() => {
    if (lcp) {
      console.log(`📊 LCP for this page: ${lcp}ms`);
      
      // إرسال إلى نظام المراقبة
      if (window.gtag) {
        window.gtag('event', 'web_vitals', {
          name: 'LCP',
          value: Math.round(lcp),
          event_category: 'Performance'
        });
      }
    }
  }, [lcp]);

  return (
    <div>
      <HeroImage 
        src="/hero.jpg" 
        alt="Hero" 
        width={1920} 
        height={1080} 
      />
      {/* المحتوى */}
    </div>
  );
}
```

## 10. ضغط صورة قبل الرفع

```tsx
import { compressImage } from '@/lib/imageOptimization';
import { useState } from 'react';

function ImageUploader() {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // قراءة الملف كـ base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      
      // ضغط الصورة قبل المعاينة
      const compressed = await compressImage(base64, 0.8);
      setPreview(compressed);
      
      // رفع الصورة المضغوطة
      await uploadImage(compressed);
    };
    
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      {preview && (
        <div className="mt-4">
          <img src={preview} alt="Preview" className="max-w-md rounded" />
        </div>
      )}
    </div>
  );
}
```

## نصائح إضافية

### 1. استخدم priority للصور المهمة فقط
```tsx
// ❌ خطأ - جميع الصور بأولوية عالية
{images.map(img => <LazyImage src={img} alt="" priority={true} />)}

// ✅ صحيح - فقط الصورة الأولى
<LazyImage src={images[0]} alt="" priority={true} />
{images.slice(1).map(img => <LazyImage src={img} alt="" />)}
```

### 2. حدد الأبعاد دائماً
```tsx
// ❌ خطأ - بدون أبعاد (يسبب CLS)
<LazyImage src="/image.jpg" alt="" />

// ✅ صحيح - مع أبعاد محددة
<LazyImage src="/image.jpg" alt="" width={800} height={600} />
```

### 3. استخدم الجودة المناسبة
```tsx
// للصور الكبيرة المهمة
<HeroImage src="/hero.jpg" alt="" quality={90} />

// للصور العادية
<LazyImage src="/content.jpg" alt="" quality={85} />

// للصور المصغرة
<ThumbnailImage src="/thumb.jpg" alt="" quality={70} />
```

### 4. استفد من التخزين المؤقت
```tsx
// الصور المحسّنة تُخزن مؤقتاً تلقائياً
<LazyImage src="/logo.jpg" alt="Logo" />
// نفس الصورة ستُحمل من الذاكرة المؤقتة
<LazyImage src="/logo.jpg" alt="Logo" />
```
