-- إنشاء جدول المستفيدين
CREATE TABLE public.beneficiaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  national_id TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  email TEXT,
  category TEXT NOT NULL,
  family_name TEXT,
  relationship TEXT,
  status TEXT NOT NULL DEFAULT 'نشط',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول العقارات
CREATE TABLE public.properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  units INTEGER NOT NULL DEFAULT 1,
  occupied INTEGER NOT NULL DEFAULT 0,
  monthly_revenue NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT occupied_units_check CHECK (occupied <= units)
);

-- إنشاء جدول التوزيعات
CREATE TABLE public.distributions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  beneficiaries_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'معلق',
  distribution_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المجلدات
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  files_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- إنشاء جدول المستندات
CREATE TABLE public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size TEXT NOT NULL,
  folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL,
  description TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- تفعيل RLS على جميع الجداول
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- سياسات RLS للقراءة (متاحة للجميع مؤقتاً)
CREATE POLICY "Allow public read on beneficiaries" 
ON public.beneficiaries 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on beneficiaries" 
ON public.beneficiaries 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on beneficiaries" 
ON public.beneficiaries 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on beneficiaries" 
ON public.beneficiaries 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read on properties" 
ON public.properties 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on properties" 
ON public.properties 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on properties" 
ON public.properties 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete on properties" 
ON public.properties 
FOR DELETE 
USING (true);

CREATE POLICY "Allow public read on distributions" 
ON public.distributions 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on distributions" 
ON public.distributions 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on distributions" 
ON public.distributions 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read on folders" 
ON public.folders 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on folders" 
ON public.folders 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on folders" 
ON public.folders 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public read on documents" 
ON public.documents 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert on documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update on documents" 
ON public.documents 
FOR UPDATE 
USING (true);

-- إنشاء triggers للـ updated_at
CREATE TRIGGER update_beneficiaries_updated_at
BEFORE UPDATE ON public.beneficiaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
BEFORE UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_distributions_updated_at
BEFORE UPDATE ON public.distributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_folders_updated_at
BEFORE UPDATE ON public.folders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();