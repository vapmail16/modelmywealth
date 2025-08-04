-- Remove the foreign key constraint that's causing the issue
-- We can't control the auth.users table timing during signup
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Add a comment to document why we removed it
COMMENT ON COLUMN public.profiles.user_id IS 'References auth.users(id) but without FK constraint due to signup timing issues';