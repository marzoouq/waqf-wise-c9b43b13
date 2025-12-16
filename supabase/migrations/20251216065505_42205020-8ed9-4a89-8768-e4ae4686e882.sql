-- تحديث view messages_with_users لجلب اسم المرسل من profiles أو beneficiaries
DROP VIEW IF EXISTS messages_with_users;

CREATE VIEW messages_with_users AS
SELECT 
    m.id,
    m.sender_id,
    m.receiver_id,
    m.subject,
    m.body,
    m.is_read,
    m.read_at,
    m.parent_message_id,
    m.request_id,
    m.created_at,
    m.updated_at,
    m.priority,
    -- جلب اسم المرسل من profiles أولاً، ثم من beneficiaries
    COALESCE(sender_p.full_name, sender_b.full_name) AS sender_name,
    sender_b.beneficiary_number AS sender_number,
    -- جلب اسم المستلم من profiles أولاً، ثم من beneficiaries  
    COALESCE(receiver_p.full_name, receiver_b.full_name) AS receiver_name,
    receiver_b.beneficiary_number AS receiver_number
FROM internal_messages m
LEFT JOIN profiles sender_p ON sender_p.user_id = m.sender_id
LEFT JOIN beneficiaries sender_b ON sender_b.user_id = m.sender_id
LEFT JOIN profiles receiver_p ON receiver_p.user_id = m.receiver_id
LEFT JOIN beneficiaries receiver_b ON receiver_b.user_id = m.receiver_id;