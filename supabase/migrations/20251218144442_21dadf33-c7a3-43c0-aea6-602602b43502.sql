
-- تحديث السياسة الأولى: support_ticket_ratings
DROP POLICY IF EXISTS "المستخدمون يمكنهم تقييم تذاكرهم" ON public.support_ticket_ratings;

CREATE POLICY "المستخدمون يمكنهم تقييم تذاكرهم"
ON public.support_ticket_ratings
FOR ALL
TO authenticated
USING (owns_support_ticket(ticket_id));

-- تحديث السياسة الثانية: tribes
DROP POLICY IF EXISTS "الإداريون يمكنهم إدارة القبائل" ON public.tribes;

CREATE POLICY "الإداريون يمكنهم إدارة القبائل"
ON public.tribes
FOR ALL
TO authenticated
USING (is_admin_or_nazer());

-- تشغيل VACUUM ANALYZE النهائي
SELECT public.run_vacuum_analyze();
