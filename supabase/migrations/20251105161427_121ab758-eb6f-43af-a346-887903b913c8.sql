-- إنشاء جدول الصناديق (funds)
CREATE TABLE IF NOT EXISTS public.funds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  allocated_amount NUMERIC NOT NULL DEFAULT 0,
  spent_amount NUMERIC NOT NULL DEFAULT 0,
  percentage NUMERIC NOT NULL DEFAULT 0,
  beneficiaries_count INTEGER NOT NULL DEFAULT 0,
  category TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.funds ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated read on funds" 
ON public.funds 
FOR SELECT 
USING (true);

CREATE POLICY "Allow authenticated insert on funds" 
ON public.funds 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow authenticated update on funds" 
ON public.funds 
FOR UPDATE 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_funds_updated_at
BEFORE UPDATE ON public.funds
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- إدخال بيانات أولية للصناديق
INSERT INTO public.funds (name, allocated_amount, spent_amount, percentage, beneficiaries_count, category, description) VALUES
('صرف مستحقات العائلات', 500000, 350000, 70, 124, 'distribution', 'مخصص لصرف المستحقات الشهرية للمستفيدين'),
('مصاريف الصيانة', 200000, 120000, 60, 0, 'maintenance', 'مخصص لصيانة العقارات والمرافق'),
('الاحتياطي', 300000, 50000, 17, 0, 'reserve', 'الاحتياطي العام للطوارئ'),
('التطوير والاستثمار', 400000, 200000, 50, 0, 'investment', 'مخصص للتطوير والاستثمارات الجديدة');