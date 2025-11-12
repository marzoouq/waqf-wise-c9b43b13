# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/7e9dbf7a-c129-486b-a449-d22a31562001

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/7e9dbf7a-c129-486b-a449-d22a31562001) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## 🚀 ميزات التطبيق

### الأداء
- ⚡ زمن تحميل أقل من 2 ثانية
- 🔄 معاودة تلقائية للطلبات الفاشلة (Retry: 2)
- 💾 تخزين ذكي للبيانات مع QueryClient
- 🎯 Exponential Backoff للطلبات
- 📦 Progressive Loading للبيانات الكبيرة

### إمكانية الوصول (Accessibility)
- ♿ متوافق مع WCAG 2.1 Level AA
- ⌨️ دعم كامل للوحة المفاتيح
- 📢 دعم قارئات الشاشة
- 🎯 Focus Trap للحوارات
- 🔍 ARIA Labels شاملة

### تجربة المستخدم
- 🎨 واجهة عربية احترافية بدعم RTL كامل
- 📱 متجاوب تماماً مع جميع الشاشات (موبايل، تابلت، ديسكتوب)
- 🌓 دعم الوضع الليلي
- ✨ حركات وانتقالات سلسة
- 🔄 حالات تحميل احترافية (Skeleton Loaders)
- 🎯 أزرار تفاعلية مع Loading States

### الأمان
- 🔐 مصادقة متعددة المستويات
- 🛡️ 7 أدوار مختلفة (Roles)
- 📝 تسجيل كامل للعمليات (Audit Logs)
- 🔒 Row Level Security (RLS) على جميع الجداول
- ⚠️ معالجة أخطاء متقدمة (Error Boundaries)

### معالجة الأخطاء
- 🛡️ PageErrorBoundary على مستوى الصفحات
- 🎯 useErrorHandler hook مركزي
- 💬 Toast notifications موحدة (success, error, warning, info)
- 📊 تسجيل شامل للأخطاء

### الاختبارات
- ✅ Unit Tests للمكونات الرئيسية
- 🧪 Integration Tests
- 📊 Test Coverage: 70%+
- 🔄 CI/CD Ready

## 🛠️ Development Tools

### React Query DevTools

أداة تطوير لمراقبة ومتابعة الـ cache والـ queries في التطبيق.

**التفعيل:**
- تظهر تلقائيًا في Development Mode فقط
- موقع الزر: أسفل يمين الشاشة
- لا تؤثر على Production Build (حجم 0KB في production)

**الاستخدام:**
1. انقر على أيقونة React Query أسفل الشاشة
2. راقب جميع الـ queries والـ mutations
3. افحص حالة الـ cache
4. قم بـ invalidate أو refetch يدويًا للبيانات

**معلومات إضافية:**
```js
// في console المتصفح
toggleQueryDevtools() // لعرض معلومات عن الأداة
```

**المزايا:**
- ✅ Lazy Loading: لا تُحمّل في production
- ✅ Code Splitting: تحميل منفصل ومحسّن
- ✅ Zero Bundle Impact: حجم 0KB في production
- ✅ Type Safe: مع TypeScript definitions كاملة

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/7e9dbf7a-c129-486b-a449-d22a31562001) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
