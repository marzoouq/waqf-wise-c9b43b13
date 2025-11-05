-- Create activities table
CREATE TABLE IF NOT EXISTS public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_name text NOT NULL,
  timestamp timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Allow authenticated read on activities"
  ON public.activities
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on activities"
  ON public.activities
  FOR INSERT
  WITH CHECK (true);

-- Create tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task text NOT NULL,
  priority text NOT NULL CHECK (priority IN ('عالية', 'متوسطة', 'منخفضة')),
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create policies for tasks
CREATE POLICY "Allow authenticated read on tasks"
  ON public.tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on tasks"
  ON public.tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on tasks"
  ON public.tasks
  FOR UPDATE
  USING (true);

-- Add trigger for tasks updated_at
CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text UNIQUE,
  full_name text,
  email text,
  phone text,
  position text,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Allow authenticated read on profiles"
  ON public.profiles
  FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert on profiles"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update on profiles"
  ON public.profiles
  FOR UPDATE
  USING (true);

-- Add trigger for profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();