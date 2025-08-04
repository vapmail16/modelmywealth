-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own roles" ON public.user_roles;

-- Create more permissive INSERT policies for initial user creation
CREATE POLICY "Allow profile creation during signup" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow role creation during signup" 
ON public.user_roles 
FOR INSERT 
TO authenticated  
WITH CHECK (true);

-- Also ensure we can update the profiles after creation
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);