
-- إضافة باقي الأدوار إلى app_role enum
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'nazer';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'archivist';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'beneficiary';
