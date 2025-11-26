-- Populate initial project documentation phases

-- المراحل الوظيفية الأساسية (Core Functional Phases) - 22 مرحلة
INSERT INTO project_documentation (category, phase_number, phase_name, description, status, completion_percentage, tasks, deliverables) VALUES

-- Phase 1: نظام المستخدمين والأدوار (RBAC)
('core', 1, 'نظام المستخدمين والأدوار (RBAC)', 'نظام شامل لإدارة المستخدمين والصلاحيات مع 6 أدوار أساسية', 'completed', 100, 
'[
  {"id": "1", "name": "إنشاء جداول roles و profiles و user_permissions", "completed": true},
  {"id": "2", "name": "تطبيق AuthContext و useAuth hook", "completed": true},
  {"id": "3", "name": "صفحات Login و Signup و ProtectedRoute", "completed": true},
  {"id": "4", "name": "نظام التحقق من الصلاحيات hasPermission و isRole", "completed": true},
  {"id": "5", "name": "17 صلاحية محددة للنظام", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "6 أدوار: nazer, admin, accountant, disbursement_officer, archivist, beneficiary", "delivered": true},
  {"id": "2", "name": "نظام مصادقة كامل مع حماية المسارات", "delivered": true},
  {"id": "3", "name": "واجهة إدارة الصلاحيات", "delivered": true}
]'::jsonb),

-- Phase 2: إدارة المستفيدين المتقدمة
('core', 2, 'إدارة المستفيدين المتقدمة', 'نظام شامل لإدارة المستفيدين مع البحث المتقدم والفلترة وربط العائلات', 'completed', 100,
'[
  {"id": "1", "name": "جداول beneficiaries و families و beneficiary_activity_log", "completed": true},
  {"id": "2", "name": "نظام البحث المتقدم مع 10+ فلاتر", "completed": true},
  {"id": "3", "name": "ربط أفراد العائلة الهرمي", "completed": true},
  {"id": "4", "name": "سجل النشاط الكامل للمستفيدين", "completed": true},
  {"id": "5", "name": "التحقق والتصنيف التلقائي", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Beneficiaries مع جدول تفاعلي", "delivered": true},
  {"id": "2", "name": "صفحة ملف المستفيد BeneficiaryProfile", "delivered": true},
  {"id": "3", "name": "نظام العائلات Families", "delivered": true}
]'::jsonb),

-- Phase 3: المحاسبة المتكاملة
('core', 3, 'المحاسبة المتكاملة', 'نظام محاسبي متكامل مع شجرة حسابات وقيود تلقائية', 'completed', 100,
'[
  {"id": "1", "name": "جداول accounts و journal_entries و bank_accounts", "completed": true},
  {"id": "2", "name": "شجرة الحسابات من 5 مستويات", "completed": true},
  {"id": "3", "name": "القيود التلقائية لجميع العمليات", "completed": true},
  {"id": "4", "name": "التسوية البنكية", "completed": true},
  {"id": "5", "name": "15+ تقرير محاسبي", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Accounting الرئيسية", "delivered": true},
  {"id": "2", "name": "نظام القيود اليومية", "delivered": true},
  {"id": "3", "name": "التقارير المالية الشاملة", "delivered": true}
]'::jsonb),

-- Phase 4: إدارة العقارات
('core', 4, 'إدارة العقارات والوحدات', 'نظام متكامل لإدارة العقارات والوحدات والعقود', 'completed', 100,
'[
  {"id": "1", "name": "جداول properties و property_units و contracts", "completed": true},
  {"id": "2", "name": "ربط الوحدات بالعقود تلقائياً", "completed": true},
  {"id": "3", "name": "حساب نسبة الإشغال", "completed": true},
  {"id": "4", "name": "تتبع الإيرادات", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Properties", "delivered": true},
  {"id": "2", "name": "إدارة العقود", "delivered": true},
  {"id": "3", "name": "تقارير العوائد العقارية", "delivered": true}
]'::jsonb),

-- Phase 5: نظام التوزيعات والموافقات
('core', 5, 'نظام التوزيعات والموافقات', 'نظام متكامل لتوزيع غلة الوقف مع مسار موافقات من 3 مستويات', 'completed', 95,
'[
  {"id": "1", "name": "جداول distributions و distribution_approvals", "completed": true},
  {"id": "2", "name": "محاكاة التوزيع", "completed": true},
  {"id": "3", "name": "مسار موافقات 3 مستويات", "completed": true},
  {"id": "4", "name": "إنشاء سندات صرف تلقائية", "completed": true},
  {"id": "5", "name": "التكامل البنكي (قيد التطوير)", "completed": false}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Funds", "delivered": true},
  {"id": "2", "name": "نظام الموافقات Approvals", "delivered": true},
  {"id": "3", "name": "سندات الصرف Payment Vouchers", "delivered": true}
]'::jsonb),

-- Phase 6: الأرشفة الإلكترونية
('core', 6, 'الأرشفة الإلكترونية', 'نظام أرشفة متقدم مع تصنيف وبحث ذكي', 'completed', 90,
'[
  {"id": "1", "name": "جدول documents مع metadata", "completed": true},
  {"id": "2", "name": "شجرة أرشفة متعددة المستويات", "completed": true},
  {"id": "3", "name": "صلاحيات وصول دقيقة", "completed": true},
  {"id": "4", "name": "ربط المرفقات بالمعاملات", "completed": true},
  {"id": "5", "name": "OCR للنص الكامل (مخطط)", "completed": false}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Archive", "delivered": true},
  {"id": "2", "name": "نظام التصنيف والبحث", "delivered": true}
]'::jsonb),

-- Phase 7: بوابة المستفيدين
('core', 7, 'بوابة المستفيدين', 'واجهة مستقلة للمستفيدين لمتابعة حساباتهم وتقديم الطلبات', 'completed', 85,
'[
  {"id": "1", "name": "لوحة تحكم المستفيد", "completed": true},
  {"id": "2", "name": "عرض الحالة المالية", "completed": true},
  {"id": "3", "name": "تقديم الطلبات", "completed": true},
  {"id": "4", "name": "رفع المستندات", "completed": true},
  {"id": "5", "name": "نظام الرسائل الداخلية", "completed": false}
]'::jsonb,
'[
  {"id": "1", "name": "BeneficiaryDashboard", "delivered": true},
  {"id": "2", "name": "BeneficiaryPortal", "delivered": true},
  {"id": "3", "name": "صفحة الطلبات", "delivered": true}
]'::jsonb),

-- Phase 8: نظام الطلبات
('core', 8, 'نظام الطلبات المتقدم', 'إدارة شاملة لطلبات المستفيدين مع SLA وتصعيد تلقائي', 'completed', 95,
'[
  {"id": "1", "name": "جداول beneficiary_requests و request_types", "completed": true},
  {"id": "2", "name": "مسارات معالجة ذكية", "completed": true},
  {"id": "3", "name": "SLA وتنبيهات التأخير", "completed": true},
  {"id": "4", "name": "قوالب قرارات", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Requests", "delivered": true},
  {"id": "2", "name": "إدارة أنواع الطلبات", "delivered": true},
  {"id": "3", "name": "لوحة معالجة الطلبات", "delivered": true}
]'::jsonb),

-- Phase 9: إدارة القروض
('core', 9, 'إدارة القروض والفزعات', 'نظام شامل للقروض مع جداول السداد والخصم التلقائي', 'completed', 90,
'[
  {"id": "1", "name": "جداول loans و loan_installments", "completed": true},
  {"id": "2", "name": "حساب الأقساط التلقائي", "completed": true},
  {"id": "3", "name": "الخصم التلقائي من التوزيعات", "completed": true},
  {"id": "4", "name": "تقرير أعمار الديون", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Loans", "delivered": true},
  {"id": "2", "name": "LoansManagement", "delivered": true},
  {"id": "3", "name": "EmergencyAidManagement", "delivered": true}
]'::jsonb),

-- Phase 10: نظام الإشعارات
('core', 10, 'نظام الإشعارات المتقدم', 'إشعارات متعددة القنوات مع قوالب قابلة للتخصيص', 'completed', 85,
'[
  {"id": "1", "name": "جدول notifications", "completed": true},
  {"id": "2", "name": "قنوات متعددة (داخلي، Email، SMS، Push)", "completed": false},
  {"id": "3", "name": "قوالب قابلة للتخصيص", "completed": true},
  {"id": "4", "name": "تنبيهات ذات أولوية", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Notifications", "delivered": true},
  {"id": "2", "name": "NotificationSettings", "delivered": true}
]'::jsonb),

-- Phase 11: التقارير المتقدمة
('core', 11, 'التقارير والذكاء التجاري', 'نظام تقارير شامل مع لوحات تحكم تفاعلية', 'completed', 80,
'[
  {"id": "1", "name": "15+ تقرير محاسبي", "completed": true},
  {"id": "2", "name": "تقارير المستفيدين والعائلات", "completed": true},
  {"id": "3", "name": "تقارير العقارات والعوائد", "completed": true},
  {"id": "4", "name": "تقارير مخصصة", "completed": false}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Reports", "delivered": true},
  {"id": "2", "name": "CustomReports", "delivered": true}
]'::jsonb),

-- Phase 12: إدارة الصيانة
('core', 12, 'إدارة الصيانة والأصول', 'نظام صيانة دورية مع تتبع التكاليف', 'completed', 75,
'[
  {"id": "1", "name": "جدول maintenance_schedules", "completed": true},
  {"id": "2", "name": "جداول صيانة دورية", "completed": true},
  {"id": "3", "name": "تقارير تكاليف الصيانة", "completed": true},
  {"id": "4", "name": "ربط بمصاريف الصيانة", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "نظام الصيانة الدورية", "delivered": true},
  {"id": "2", "name": "تقارير الصيانة", "delivered": true}
]'::jsonb),

-- Phase 13: الميزانيات
('core', 13, 'إدارة الميزانيات', 'نظام ميزانيات سنوية مع تتبع التنفيذ', 'completed', 85,
'[
  {"id": "1", "name": "جداول budgets و budget_items", "completed": true},
  {"id": "2", "name": "إنشاء ميزانية من السنة السابقة", "completed": true},
  {"id": "3", "name": "تتبع التنفيذ الفعلي", "completed": true},
  {"id": "4", "name": "تقارير المقارنة", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Budgets", "delivered": true}
]'::jsonb),

-- Phase 14: الإفصاح السنوي
('core', 14, 'الإفصاح السنوي', 'نظام إفصاح سنوي تلقائي للشفافية', 'completed', 90,
'[
  {"id": "1", "name": "جدول annual_disclosures", "completed": true},
  {"id": "2", "name": "حساب تلقائي من المحاسبة", "completed": true},
  {"id": "3", "name": "تقرير شامل للعائلة", "completed": true},
  {"id": "4", "name": "نشر الإفصاح", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "نظام الإفصاح التلقائي", "delivered": true}
]'::jsonb),

-- Phase 15: الحوكمة
('core', 15, 'نظام الحوكمة والقرارات', 'نظام متكامل لتوثيق القرارات والاجتماعات', 'completed', 80,
'[
  {"id": "1", "name": "جداول governance_decisions و meetings", "completed": true},
  {"id": "2", "name": "توثيق القرارات", "completed": true},
  {"id": "3", "name": "إدارة الاجتماعات", "completed": true},
  {"id": "4", "name": "تتبع التنفيذ", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "GovernanceDecisions", "delivered": true},
  {"id": "2", "name": "DecisionDetails", "delivered": true}
]'::jsonb),

-- Phase 16-22: المراحل المتبقية
('core', 16, 'الفواتير وسندات القبض', 'نظام فواتير إلكترونية مع QR Code', 'completed', 85,
'[
  {"id": "1", "name": "جداول invoices و payments", "completed": true},
  {"id": "2", "name": "توليد QR Code", "completed": true},
  {"id": "3", "name": "التوافق مع ZATCA", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "صفحة Invoices", "delivered": true}
]'::jsonb),

('core', 17, 'سجلات التدقيق', 'تسجيل كامل لجميع العمليات', 'completed', 90,
'[
  {"id": "1", "name": "جدول audit_logs", "completed": true},
  {"id": "2", "name": "تتبع التغييرات", "completed": true},
  {"id": "3", "name": "تقارير التدقيق", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "AuditLogs", "delivered": true}
]'::jsonb),

('core', 18, 'الدعم الفني', 'نظام تذاكر دعم فني متكامل', 'completed', 85,
'[
  {"id": "1", "name": "جدول support_tickets", "completed": true},
  {"id": "2", "name": "تعيين تلقائي", "completed": true},
  {"id": "3", "name": "SLA tracking", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "Support", "delivered": true},
  {"id": "2", "name": "SupportManagement", "delivered": true}
]'::jsonb),

('core', 19, 'المراقبة والأخطاء', 'مراقبة النظام وإدارة الأخطاء', 'completed', 80,
'[
  {"id": "1", "name": "SystemMonitoring", "completed": true},
  {"id": "2", "name": "SystemErrorLogs", "completed": true},
  {"id": "3", "name": "Auto healing", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "SystemMonitoring", "delivered": true},
  {"id": "2", "name": "SystemErrorLogs", "delivered": true}
]'::jsonb),

('core', 20, 'الرسائل الداخلية', 'نظام مراسلات داخلية', 'completed', 75,
'[
  {"id": "1", "name": "جدول messages", "completed": true},
  {"id": "2", "name": "واجهة المراسلات", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "Messages", "delivered": true}
]'::jsonb),

('core', 21, 'إعدادات الشفافية', 'التحكم في مستوى الشفافية', 'completed', 90,
'[
  {"id": "1", "name": "جدول beneficiary_visibility_settings", "completed": true},
  {"id": "2", "name": "إعدادات تفصيلية", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "TransparencySettings", "delivered": true}
]'::jsonb),

('core', 22, 'قاعدة المعرفة', 'نظام معرفة داخلي', 'completed', 70,
'[
  {"id": "1", "name": "جدول knowledge_base", "completed": true},
  {"id": "2", "name": "واجهة البحث", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "KnowledgeBase", "delivered": true}
]'::jsonb);

-- مراحل التصميم (Design Phases)
INSERT INTO project_documentation (category, phase_number, phase_name, description, status, completion_percentage, tasks, deliverables) VALUES

('design', 1, 'نظام التصميم الموحد', 'إنشاء نظام تصميم موحد في index.css و tailwind.config.ts', 'completed', 100,
'[
  {"id": "1", "name": "تعريف متغيرات CSS الأساسية", "completed": true},
  {"id": "2", "name": "ألوان semantic tokens", "completed": true},
  {"id": "3", "name": "Typography system", "completed": true},
  {"id": "4", "name": "Spacing scale", "completed": true}
]'::jsonb,
'[
  {"id": "1", "name": "ملف index.css موحد", "delivered": true},
  {"id": "2", "name": "تكوين Tailwind محدث", "delivered": true}
]'::jsonb),

('design', 2, 'المكونات الموحدة', 'إنشاء مكونات واجهة موحدة', 'in_progress', 85,
'[
  {"id": "1", "name": "UnifiedKPICard", "completed": true},
  {"id": "2", "name": "UnifiedStatsGrid", "completed": true},
  {"id": "3", "name": "UnifiedSectionHeader", "completed": true},
  {"id": "4", "name": "UnifiedButton variants", "completed": true},
  {"id": "5", "name": "UnifiedTable", "completed": false}
]'::jsonb,
'[
  {"id": "1", "name": "مجلد unified components", "delivered": true}
]'::jsonb),

('design', 3, 'تحسين لوحات التحكم', 'توحيد تصميم جميع لوحات التحكم', 'in_progress', 70,
'[
  {"id": "1", "name": "NazerDashboard", "completed": true},
  {"id": "2", "name": "AdminDashboard", "completed": false},
  {"id": "3", "name": "AccountantDashboard", "completed": false},
  {"id": "4", "name": "BeneficiaryDashboard", "completed": false}
]'::jsonb,
'[]'::jsonb),

('design', 4, 'تحسين الجداول', 'توحيد تصميم جميع الجداول', 'planned', 40,
'[
  {"id": "1", "name": "جدول المستفيدين", "completed": false},
  {"id": "2", "name": "جدول العقارات", "completed": false},
  {"id": "3", "name": "جدول القيود المحاسبية", "completed": false}
]'::jsonb,
'[]'::jsonb),

('design', 5, 'تحسين النماذج', 'توحيد تصميم جميع النماذج', 'planned', 30,
'[
  {"id": "1", "name": "نماذج المستفيدين", "completed": false},
  {"id": "2", "name": "نماذج العقارات", "completed": false},
  {"id": "3", "name": "نماذج القيود", "completed": false}
]'::jsonb,
'[]'::jsonb);

-- المراحل المستقبلية (Future Releases)
INSERT INTO project_documentation (category, phase_number, phase_name, description, status, completion_percentage, tasks, deliverables) VALUES

('future', 1, 'تطبيقات الموبايل', 'تطبيقات iOS و Android', 'planned', 0,
'[
  {"id": "1", "name": "تطبيق المستفيدين", "completed": false},
  {"id": "2", "name": "تطبيق الموظفين", "completed": false}
]'::jsonb,
'[]'::jsonb),

('future', 2, 'الذكاء الاصطناعي', 'تحليلات ذكية وتوصيات', 'planned', 0,
'[
  {"id": "1", "name": "تقييم الأهلية التلقائي", "completed": false},
  {"id": "2", "name": "التنبؤ بالاحتياجات", "completed": false},
  {"id": "3", "name": "chatbot ذكي", "completed": false}
]'::jsonb,
'[]'::jsonb),

('future', 3, 'التكامل البنكي المباشر', 'ربط مباشر مع البنوك', 'planned', 0,
'[
  {"id": "1", "name": "API البنوك السعودية", "completed": false},
  {"id": "2", "name": "التحويلات المباشرة", "completed": false},
  {"id": "3", "name": "استيراد الكشوفات", "completed": false}
]'::jsonb,
'[]'::jsonb),

('future', 4, 'OCR متقدم', 'استخراج البيانات من المستندات', 'planned', 0,
'[
  {"id": "1", "name": "OCR للهويات", "completed": false},
  {"id": "2", "name": "OCR للعقود", "completed": false},
  {"id": "3", "name": "OCR للفواتير", "completed": false}
]'::jsonb,
'[]'::jsonb);

COMMENT ON TABLE project_documentation IS 'Initial seed data populated - 22 core phases, 5 design phases, 4 future phases';