-- Create broadcast_notifications table for logging group notifications
CREATE TABLE public.broadcast_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    priority TEXT DEFAULT 'medium',
    target_type TEXT NOT NULL, -- 'all', 'role', 'beneficiaries', 'staff'
    target_value TEXT, -- الدور أو الفئة المحددة
    recipient_count INTEGER DEFAULT 0,
    sent_by UUID REFERENCES auth.users(id),
    sent_by_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    action_url TEXT
);

-- Enable RLS
ALTER TABLE public.broadcast_notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admin and nazer can insert
CREATE POLICY "Admins and nazer can insert broadcast notifications"
ON public.broadcast_notifications FOR INSERT
TO authenticated
WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'nazer')
);

-- Anyone authenticated can view broadcast logs
CREATE POLICY "Authenticated users can view broadcast notifications"
ON public.broadcast_notifications FOR SELECT
TO authenticated
USING (true);

-- Create SECURITY DEFINER function to get users by target type
CREATE OR REPLACE FUNCTION public.get_users_by_target(
    p_target_type TEXT,
    p_target_value TEXT DEFAULT NULL
)
RETURNS TABLE (user_id UUID, full_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    CASE p_target_type
        WHEN 'all' THEN
            -- جميع المستخدمين الذين لديهم user_id
            RETURN QUERY
            SELECT DISTINCT COALESCE(p.user_id, b.user_id) as user_id, 
                   COALESCE(p.full_name, b.full_name)::TEXT as full_name
            FROM profiles p
            FULL OUTER JOIN beneficiaries b ON p.user_id = b.user_id
            WHERE COALESCE(p.user_id, b.user_id) IS NOT NULL;
            
        WHEN 'role' THEN
            -- حسب الدور المحدد
            RETURN QUERY
            SELECT ur.user_id, COALESCE(p.full_name, 'مستخدم')::TEXT as full_name
            FROM user_roles ur
            LEFT JOIN profiles p ON p.user_id = ur.user_id
            WHERE ur.role::TEXT = p_target_value;
            
        WHEN 'beneficiaries' THEN
            -- جميع المستفيدين النشطين الذين لديهم حساب
            RETURN QUERY
            SELECT b.user_id, b.full_name::TEXT
            FROM beneficiaries b
            WHERE b.user_id IS NOT NULL AND b.status = 'نشط';
            
        WHEN 'staff' THEN
            -- جميع الموظفين (أدوار غير المستفيد)
            RETURN QUERY
            SELECT DISTINCT ur.user_id, COALESCE(p.full_name, 'موظف')::TEXT as full_name
            FROM user_roles ur
            LEFT JOIN profiles p ON p.user_id = ur.user_id
            WHERE ur.role IN ('admin', 'nazer', 'accountant', 'cashier', 'archivist');
            
        ELSE
            -- إرجاع فارغ للأنواع غير المعروفة
            RETURN;
    END CASE;
END;
$$;

-- Create function to count users by target (for preview before sending)
CREATE OR REPLACE FUNCTION public.count_users_by_target(
    p_target_type TEXT,
    p_target_value TEXT DEFAULT NULL
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM public.get_users_by_target(p_target_type, p_target_value);
    RETURN user_count;
END;
$$;