-- إنشاء دالة SECURITY DEFINER لجلب رسائل المستخدم
-- هذه الدالة تتجاوز سياسات RLS على الجداول المرتبطة (profiles, beneficiaries)
-- مما يسمح للمستفيدين برؤية أسماء المرسلين

CREATE OR REPLACE FUNCTION get_user_messages(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    sender_id uuid,
    receiver_id uuid,
    subject text,
    body text,
    is_read boolean,
    read_at timestamptz,
    priority text,
    created_at timestamptz,
    updated_at timestamptz,
    parent_message_id uuid,
    request_id uuid,
    sender_name text,
    receiver_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.subject,
        m.body,
        m.is_read,
        m.read_at,
        m.priority,
        m.created_at,
        m.updated_at,
        m.parent_message_id,
        m.request_id,
        COALESCE(sender_p.full_name, sender_b.full_name)::text AS sender_name,
        COALESCE(receiver_p.full_name, receiver_b.full_name)::text AS receiver_name
    FROM internal_messages m
    LEFT JOIN profiles sender_p ON sender_p.user_id = m.sender_id
    LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
    LEFT JOIN profiles receiver_p ON receiver_p.user_id = m.receiver_id
    LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id
    WHERE m.sender_id = p_user_id OR m.receiver_id = p_user_id
    ORDER BY m.created_at DESC;
END;
$$;

-- دالة لجلب الرسائل الواردة فقط
CREATE OR REPLACE FUNCTION get_inbox_messages(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    sender_id uuid,
    receiver_id uuid,
    subject text,
    body text,
    is_read boolean,
    read_at timestamptz,
    priority text,
    created_at timestamptz,
    updated_at timestamptz,
    parent_message_id uuid,
    request_id uuid,
    sender_name text,
    receiver_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.subject,
        m.body,
        m.is_read,
        m.read_at,
        m.priority,
        m.created_at,
        m.updated_at,
        m.parent_message_id,
        m.request_id,
        COALESCE(sender_p.full_name, sender_b.full_name)::text AS sender_name,
        COALESCE(receiver_p.full_name, receiver_b.full_name)::text AS receiver_name
    FROM internal_messages m
    LEFT JOIN profiles sender_p ON sender_p.user_id = m.sender_id
    LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
    LEFT JOIN profiles receiver_p ON receiver_p.user_id = m.receiver_id
    LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id
    WHERE m.receiver_id = p_user_id
    ORDER BY m.created_at DESC;
END;
$$;

-- دالة لجلب الرسائل المرسلة فقط
CREATE OR REPLACE FUNCTION get_sent_messages(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    sender_id uuid,
    receiver_id uuid,
    subject text,
    body text,
    is_read boolean,
    read_at timestamptz,
    priority text,
    created_at timestamptz,
    updated_at timestamptz,
    parent_message_id uuid,
    request_id uuid,
    sender_name text,
    receiver_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.sender_id,
        m.receiver_id,
        m.subject,
        m.body,
        m.is_read,
        m.read_at,
        m.priority,
        m.created_at,
        m.updated_at,
        m.parent_message_id,
        m.request_id,
        COALESCE(sender_p.full_name, sender_b.full_name)::text AS sender_name,
        COALESCE(receiver_p.full_name, receiver_b.full_name)::text AS receiver_name
    FROM internal_messages m
    LEFT JOIN profiles sender_p ON sender_p.user_id = m.sender_id
    LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
    LEFT JOIN profiles receiver_p ON receiver_p.user_id = m.receiver_id
    LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id
    WHERE m.sender_id = p_user_id
    ORDER BY m.created_at DESC;
END;
$$;