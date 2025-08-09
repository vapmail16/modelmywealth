-- Add missing INSERT policy for profiles table
CREATE POLICY "Users can create their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add missing INSERT policy for user_roles table  
CREATE POLICY "Users can create their own roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);