# 🧭 المرحلة الأولى — الفحص الجنائي للقائمة الجانبية (Batch 1)

**تاريخ الفحص:** 2026-01-21  
**النطاق:** AppSidebar (MainLayout) + BeneficiarySidebar + مرجع التنقل السفلي للجوال

> الهدف من هذه الدفعة: جرد عناصر القائمة الجانبية وربطها بالمسارات والأدوار مع أول قائمة مخالفات (P0/P1) على مستوى الملاحة فقط.

---

## 1️⃣ مصادر تعريف القائمة الجانبية (Centralization Check)

| المصدر | الملف | الملاحظات |
| --- | --- | --- |
| القائمة الجانبية الرئيسية | `src/components/layout/AppSidebar.tsx` | تعريف مباشر داخل الملف (`primaryMenuItems`, `moreMenuGroups`). |
| قائمة المستفيد | `src/components/beneficiary/config/sidebarConfig.ts` + `BeneficiarySidebar.tsx` | تعريف مركزي للمستفيد مع `visibilityKey`. |
| التنقل السفلي للجوال | `src/config/navigation/*` + `BottomNavigation.tsx` | تعريف حسب الدور (غير مرتبط مباشرة بـ AppSidebar). |

**الخلاصة:** التعريف **مبعثر عبر 3 مصادر** (AppSidebar + Beneficiary Config + Navigation Config). ✅ قابل للتدقيق لكنه **ليس مصدرًا موحدًا**.

---

## 2️⃣ مصفوفة القائمة الجانبية الرئيسية (AppSidebar)

### 2.1 الأقسام الرئيسية (Primary)

| العنصر | الدور | Route | ملف المسار | ملاحظات |
| --- | --- | --- | --- | --- |
| لوحة التحكم | all | `/dashboard` | `src/routes/dashboardRoutes.tsx` | مرجع عام لكل الأدوار. |
| نقطة البيع | nazer/accountant/cashier | `/pos` | `src/routes/adminRoutes.tsx` | محمي بدور. |
| العقارات | admin/accountant/nazer | `/properties` | `src/routes/coreRoutes.tsx` | — |
| المستأجرون | admin/accountant/nazer/cashier | `/tenants` | `src/routes/coreRoutes.tsx` | — |
| المستفيدون | admin/accountant/nazer | `/beneficiaries` | `src/routes/coreRoutes.tsx` | — |
| المدفوعات | admin/accountant/cashier/nazer | `/payments` | `src/routes/coreRoutes.tsx` | — |
| التقارير | admin/accountant/nazer | `/reports` | `src/routes/coreRoutes.tsx` | — |

### 2.2 المجموعات الموسعة (المزيد)

| المجموعة | الدور | العنصر | Route | ملف المسار | ملاحظات |
| --- | --- | --- | --- | --- | --- |
| الوقف والأموال | admin/accountant/nazer | أقلام الوقف | `/waqf-units` | `coreRoutes.tsx` | — |
| الوقف والأموال | admin/accountant/nazer | الأموال والتوزيعات | `/funds` | `coreRoutes.tsx` | — |
| الوقف والأموال | admin/accountant/nazer | القروض | `/loans` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | المحاسبة | `/accounting` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | السنوات المالية | `/fiscal-years` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | الميزانيات | `/budgets` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | سندات الدفع | `/payment-vouchers` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | الفواتير | `/invoices` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | التحويلات البنكية | `/bank-transfers` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | جميع المعاملات | `/all-transactions` | `coreRoutes.tsx` | — |
| المحاسبة | admin/accountant/nazer | الموافقات | `/approvals` | `coreRoutes.tsx` | — |
| المستفيدين | admin/accountant/nazer | العائلات | `/families` | `coreRoutes.tsx` | — |
| المستفيدين | admin/accountant/nazer | الطلبات | `/requests` | `coreRoutes.tsx` | — |
| المستفيدين | admin/accountant/nazer | المساعدات الطارئة | `/emergency-aid` | `coreRoutes.tsx` | — |
| الأرشيف والحوكمة | admin/nazer/archivist/waqf_heir | الأرشيف | `/archive` | `coreRoutes.tsx` | — |
| الأرشيف والحوكمة | admin/nazer/archivist/waqf_heir | مجالس الحوكمة | `/governance/boards` | `coreRoutes.tsx` | — |
| الأرشيف والحوكمة | admin/nazer/archivist/waqf_heir | السياسات | `/governance/policies` | `coreRoutes.tsx` | — |
| الأرشيف والحوكمة | admin/nazer/archivist/waqf_heir | القرارات والتصويت | `/governance/decisions` | `coreRoutes.tsx` | — |
| الأرشيف والحوكمة | admin/nazer/archivist/waqf_heir | الدليل الإرشادي | `/governance/guide` | `coreRoutes.tsx` | — |
| الذكاء الاصطناعي | admin/nazer | المساعد الذكي | `/chatbot` | `coreRoutes.tsx` | — |
| الذكاء الاصطناعي | admin/nazer | الرؤى الذكية | `/ai-insights` | `adminRoutes.tsx` | — |
| الذكاء الاصطناعي | admin/nazer | الفحص الذكي | `/ai-audit` | `adminRoutes.tsx` | — |
| الدعم والمساعدة | all | الرسائل | `/messages` | `coreRoutes.tsx` | — |
| الدعم والمساعدة | all | تذاكر الدعم | `/support` | `coreRoutes.tsx` | — |
| الدعم والمساعدة | all | قاعدة المعرفة | `/knowledge-base` | `coreRoutes.tsx` | — |
| إدارة النظام | admin/nazer | المستخدمون | `/users` | `adminRoutes.tsx` | — |
| إدارة النظام | admin/nazer | الإشعارات | `/notifications` | `coreRoutes.tsx` | — |
| إدارة النظام | admin/nazer | لوحة المراقبة | `/system-monitoring` | `adminRoutes.tsx` | — |
| إدارة النظام | admin/nazer | الإعدادات | `/settings` | `coreRoutes.tsx` | — |

---

## 3️⃣ مصفوفة بوابة المستفيد (BeneficiarySidebar)

> جميع العناصر أدناه تبويب داخل `/beneficiary-portal` باستثناء الدعم الفني.

| العنصر | tab/href | visibilityKey | Route/الصفحة | ملاحظات |
| --- | --- | --- | --- | --- |
| نظرة عامة | `overview` | `show_overview` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| الملف الشخصي | `profile` | `show_profile` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| الطلبات | `requests` | `show_requests` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| التوزيعات والأرصدة | `distributions` | `show_distributions` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| العقارات | `properties` | `show_properties` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| المستندات | `documents` | `show_documents` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| العائلة | `family` | `show_family_tree` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| التقارير والإفصاحات | `reports` | `show_financial_reports` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| الحوكمة | `governance` | `show_governance` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| القروض | `loans` | `show_own_loans` | `/beneficiary-portal` (Tab) | تبويب داخلي. |
| الدعم الفني | `/beneficiary-support` | — | `beneficiaryRoutes.tsx` | مسار مستقل. |

---

## 4️⃣ المخالفات (P0/P1) — مستوى الملاحة فقط

> تركيز هذه الدفعة على الملاحة وليس الأزرار/الخدمات.

### P0 (حرج)
- **لا يوجد** داخل عناصر AppSidebar نفسها.

### P1 (مرتفع)
1. **عدم تطابق مسار التنقل السفلي للمشرف**: `adminNavigationItems` يستخدم `/security-dashboard` بينما المسار الفعلي هو `/security`.
2. **مسارات مطابقة قديمة**: `adminNavigationItems` يشير إلى `/roles-management` بينما المسار الفعلي `/settings/roles`.
3. **مطابقة مسار قديم للناظر**: `nazerNavigationItems` يستخدم `/governance-decisions` بينما المسار الفعلي `/governance/decisions`.
4. **حالة التفعيل في التنقل السفلي للمستفيد**: `BottomNavigation` يعتمد على `location.pathname` فقط، مما يجعل تبويبات `?tab=` في `beneficiaryNavigationItems` لا تُفعّل بصريًا (نشط فقط عنصر الرئيسية).

---

## 5️⃣ ملخص التنفيذ الفعلي (Batch 1)

- ✅ تفريغ كامل لعناصر القائمة الجانبية الرئيسية مع ربط المسارات والأدوار.
- ✅ تفريغ عناصر بوابة المستفيد مع مفاتيح الرؤية (visibility keys).
- ✅ تحديد أول قائمة مخالفات (P0/P1) على مستوى الملاحة فقط.

---

## 6️⃣ الخطوة التالية (Batch 2 المقترحة)

- اختيار **أول 3 عناصر ذات مخاطرة أعلى** (حسب الدور والصلاحيات).
- الغوص في الصفحة + الأزرار + الـ Hooks + الـ Services لكل عنصر.
- توثيق الربط مع جداول DB + سياسات RLS + Audit.

