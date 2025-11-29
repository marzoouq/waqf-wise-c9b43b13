
-- إصلاح trigger إصدارات المستندات
-- حذف الـ trigger القديم
DROP TRIGGER IF EXISTS document_version_trigger ON documents;

-- إعادة إنشاء الدالة بشكل صحيح (بدون file_path)
CREATE OR REPLACE FUNCTION public.create_document_version()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- إذا تغير اسم الملف أو التصنيف، نسجل ذلك
  IF OLD.name IS DISTINCT FROM NEW.name OR OLD.category IS DISTINCT FROM NEW.category THEN
    -- إلغاء الإصدار الحالي
    UPDATE public.document_versions
    SET is_current = false
    WHERE document_id = NEW.id AND is_current = true;
    
    -- إنشاء إصدار جديد
    INSERT INTO public.document_versions (
      document_id,
      version_number,
      change_description,
      is_current
    )
    SELECT 
      NEW.id,
      COALESCE(MAX(version_number), 0) + 1,
      'تحديث المستند',
      true
    FROM public.document_versions
    WHERE document_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- إعادة إنشاء الـ trigger
CREATE TRIGGER document_version_trigger 
AFTER UPDATE ON public.documents 
FOR EACH ROW 
EXECUTE FUNCTION create_document_version();
