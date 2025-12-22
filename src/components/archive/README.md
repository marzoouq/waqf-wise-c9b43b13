# 📁 Archive Components / مكونات الأرشيف

هذا المجلد يحتوي على مكونات نظام الأرشفة الإلكترونية.

## 📂 الهيكل

```
src/components/archive/
├── index.ts                  # تصدير مركزي
├── ArchiveFoldersTab.tsx     # تبويب المجلدات
├── ArchiveDocumentsTab.tsx   # تبويب المستندات
└── ArchiveDialogs.tsx        # حوارات الأرشيف
```

## 📋 المكونات

### ArchiveFoldersTab
إدارة شجرة المجلدات في الأرشيف.

```typescript
import { ArchiveFoldersTab } from '@/components/archive';

<ArchiveFoldersTab 
  folders={folders}
  onSelect={handleSelect}
  onCreateFolder={handleCreate}
  onDeleteFolder={handleDelete}
/>
```

### ArchiveDocumentsTab
عرض وإدارة المستندات داخل المجلدات.

```typescript
import { ArchiveDocumentsTab } from '@/components/archive';

<ArchiveDocumentsTab 
  documents={documents}
  selectedFolder={folderId}
  onUpload={handleUpload}
  onDelete={handleDelete}
  onView={handleView}
/>
```

### ArchiveDialogs
حوارات رفع المستندات وإنشاء المجلدات.

```typescript
import { ArchiveDialogs } from '@/components/archive';

<ArchiveDialogs 
  isOpen={isOpen}
  onClose={onClose}
  mode="upload" // "upload" | "folder" | "view"
  currentFolder={folderId}
/>
```

---

**آخر تحديث:** 2025-12-22
**الإصدار:** 3.0.0
