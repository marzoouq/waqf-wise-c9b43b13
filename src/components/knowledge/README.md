# 📁 Knowledge Components / مكونات قاعدة المعرفة

هذا المجلد يحتوي على مكونات قاعدة المعرفة والمساعدة.

## 📂 الهيكل

```
src/components/knowledge/
├── index.ts                  # تصدير مركزي
├── KnowledgeArticlesTab.tsx  # تبويب المقالات
├── KnowledgeFAQsTab.tsx      # تبويب الأسئلة الشائعة
├── KnowledgeVideosTab.tsx    # تبويب الفيديوهات
└── KnowledgeDownloadsTab.tsx # تبويب التنزيلات
```

## 📋 المكونات

### KnowledgeArticlesTab
عرض المقالات التعليمية والإرشادية.

```typescript
import { KnowledgeArticlesTab } from '@/components/knowledge';

<KnowledgeArticlesTab 
  articles={articles}
  onSelect={handleSelect}
  searchQuery={query}
/>
```

### KnowledgeFAQsTab
عرض الأسئلة الشائعة مع إمكانية البحث.

```typescript
import { KnowledgeFAQsTab } from '@/components/knowledge';

<KnowledgeFAQsTab 
  faqs={faqs}
  searchQuery={query}
  category={selectedCategory}
/>
```

### KnowledgeVideosTab
عرض الفيديوهات التعليمية.

```typescript
import { KnowledgeVideosTab } from '@/components/knowledge';

<KnowledgeVideosTab 
  videos={videos}
  onPlay={handlePlay}
/>
```

### KnowledgeDownloadsTab
عرض الملفات القابلة للتنزيل.

```typescript
import { KnowledgeDownloadsTab } from '@/components/knowledge';

<KnowledgeDownloadsTab 
  files={downloadableFiles}
  onDownload={handleDownload}
/>
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.0.0
