-- Create user types enum
CREATE TYPE public.user_type AS ENUM ('tech', 'business');

-- Create app roles enum (extensible)
CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'analyst');

-- Create capabilities enum (extensible)
CREATE TYPE public.capability AS ENUM (
  'manage_users',
  'manage_roles', 
  'view_analytics',
  'create_reports',
  'manage_companies',
  'manage_projects',
  'view_financial_data',
  'edit_financial_data',
  'export_data',
  'system_settings'
);

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  user_type public.user_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  user_type public.user_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, user_type)
);

-- Create role_capabilities table for flexible permission management
CREATE TABLE public.role_capabilities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.app_role NOT NULL,
  user_type public.user_type NOT NULL,
  capability public.capability NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, user_type, capability)
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_capabilities ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- RLS policies for role_capabilities (viewable by all authenticated users)
CREATE POLICY "Authenticated users can view role capabilities" 
ON public.role_capabilities 
FOR SELECT 
TO authenticated
USING (true);

-- Create function to check if user has capability
CREATE OR REPLACE FUNCTION public.user_has_capability(_user_id UUID, _capability public.capability)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_capabilities rc ON ur.role = rc.role AND ur.user_type = rc.user_type
    WHERE ur.user_id = _user_id
      AND rc.capability = _capability
  );
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'business')
  );
  
  -- Assign default role based on user type
  INSERT INTO public.user_roles (user_id, role, user_type)
  VALUES (
    NEW.id,
    CASE 
      WHEN COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'business') = 'tech' THEN 'user'::public.app_role
      ELSE 'analyst'::public.app_role
    END,
    COALESCE((NEW.raw_user_meta_data ->> 'user_type')::public.user_type, 'business')
  );
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default role capabilities
INSERT INTO public.role_capabilities (role, user_type, capability) VALUES
  -- Tech Admin capabilities
  ('admin', 'tech', 'manage_users'),
  ('admin', 'tech', 'manage_roles'),
  ('admin', 'tech', 'view_analytics'),
  ('admin', 'tech', 'create_reports'),
  ('admin', 'tech', 'manage_companies'),
  ('admin', 'tech', 'manage_projects'),
  ('admin', 'tech', 'view_financial_data'),
  ('admin', 'tech', 'edit_financial_data'),
  ('admin', 'tech', 'export_data'),
  ('admin', 'tech', 'system_settings'),
  
  -- Tech User capabilities (limited)
  ('user', 'tech', 'view_analytics'),
  ('user', 'tech', 'view_financial_data'),
  
  -- Business Admin capabilities
  ('admin', 'business', 'manage_users'),
  ('admin', 'business', 'view_analytics'),
  ('admin', 'business', 'create_reports'),
  ('admin', 'business', 'manage_companies'),
  ('admin', 'business', 'manage_projects'),
  ('admin', 'business', 'view_financial_data'),
  ('admin', 'business', 'edit_financial_data'),
  ('admin', 'business', 'export_data'),
  
  -- Business Analyst capabilities
  ('analyst', 'business', 'view_analytics'),
  ('analyst', 'business', 'create_reports'),
  ('analyst', 'business', 'view_financial_data');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();