-- Fix function search path mutable warning by setting search_path
CREATE OR REPLACE FUNCTION update_session_activity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.last_activity = now();
  RETURN NEW;
END;
$$;