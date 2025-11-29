-- حذف الـ Foreign Keys القديمة التي تشير إلى auth.users
ALTER TABLE public.internal_messages
DROP CONSTRAINT IF EXISTS internal_messages_sender_id_fkey;

ALTER TABLE public.internal_messages
DROP CONSTRAINT IF EXISTS internal_messages_receiver_id_fkey;

-- إضافة Foreign Keys جديدة تشير إلى profiles.user_id
ALTER TABLE public.internal_messages
ADD CONSTRAINT internal_messages_sender_id_fkey
FOREIGN KEY (sender_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;

ALTER TABLE public.internal_messages
ADD CONSTRAINT internal_messages_receiver_id_fkey
FOREIGN KEY (receiver_id) 
REFERENCES public.profiles(user_id) 
ON DELETE CASCADE;