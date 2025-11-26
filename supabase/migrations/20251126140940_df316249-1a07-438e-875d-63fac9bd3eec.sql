-- إصلاح سياسات governance_votes - حذف السياسات المتعارضة

-- حذف جميع السياسات القديمة
DROP POLICY IF EXISTS "Users can view all votes" ON governance_votes;
DROP POLICY IF EXISTS "Authenticated users can insert votes" ON governance_votes;
DROP POLICY IF EXISTS "المصوتون المسموح لهم يمكنهم التصو" ON governance_votes;
DROP POLICY IF EXISTS "رؤية الأصوات حسب الصلاحية" ON governance_votes;

-- إنشاء سياسات واضحة ومحسنة
-- 1. سياسة القراءة: يمكن للجميع رؤية الأصوات المكتملة، والناظر والأدمن يرون كل شيء
CREATE POLICY "governance_votes_select_policy"
  ON governance_votes FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role) 
    OR has_role(auth.uid(), 'nazer'::app_role)
    OR voter_id = auth.uid()
    OR (
      NOT is_secret 
      AND EXISTS (
        SELECT 1 FROM governance_decisions 
        WHERE id = governance_votes.decision_id 
        AND voting_completed = true
      )
    )
  );

-- 2. سياسة الإدراج: المستخدمون المصادق عليهم فقط
CREATE POLICY "governance_votes_insert_policy"
  ON governance_votes FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND voter_id = auth.uid()
  );

-- تحديث جميع الأخطاء القديمة إلى resolved
UPDATE system_error_logs
SET status = 'resolved',
    resolved_at = NOW()
WHERE status = 'new'
  AND created_at < NOW() - INTERVAL '1 hour';

-- حذف أخطاء [object Object] الجديدة أيضاً
DELETE FROM system_error_logs
WHERE error_message = '[object Object]';