-- ==========================================================
-- إضافة سياسات القراءة للمستفيدين من الدرجة الأولى
-- Date: 2025-11-29
-- ==========================================================

-- 1. سياسة قراءة الوثائق للمستفيدين من الدرجة الأولى
CREATE POLICY "first_class_beneficiaries_can_view_documents"
  ON documents
  FOR SELECT
  USING (is_first_class_beneficiary());

-- 2. سياسة قراءة التقارير للمستفيدين من الدرجة الأولى (إن وجد الجدول)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reports' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "first_class_beneficiaries_can_view_reports"
      ON reports
      FOR SELECT
      USING (is_first_class_beneficiary())';
  END IF;
END $$;

-- 3. سياسة قراءة المصروفات للمستفيدين من الدرجة الأولى (إن وجد الجدول)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'expenses' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "first_class_beneficiaries_can_view_expenses"
      ON expenses
      FOR SELECT
      USING (is_first_class_beneficiary())';
  END IF;
END $$;

-- 4. سياسة قراءة مجلدات الوثائق للمستفيدين (إن وجد الجدول)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_folders' AND table_schema = 'public') THEN
    EXECUTE 'CREATE POLICY "first_class_beneficiaries_can_view_folders"
      ON document_folders
      FOR SELECT
      USING (is_first_class_beneficiary())';
  END IF;
END $$;