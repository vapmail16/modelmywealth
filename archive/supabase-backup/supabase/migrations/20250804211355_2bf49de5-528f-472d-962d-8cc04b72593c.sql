-- Create notification history table
CREATE TABLE public.notification_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'sent', 'failed', 'pending'
  template_id TEXT,
  recipient_email TEXT NOT NULL,
  subject TEXT,
  template_params JSONB DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.notification_history ENABLE ROW LEVEL SECURITY;

-- Create policies for notification history
CREATE POLICY "Users can view their own notification history" 
ON public.notification_history 
FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "System can manage notification history" 
ON public.notification_history 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Add notification preferences to profiles table
ALTER TABLE public.profiles 
ADD COLUMN notification_preferences JSONB DEFAULT '{
  "email_enabled": true,
  "frequency": "immediate",
  "types": {
    "security": true,
    "reports": true,
    "system": true,
    "collaboration": true,
    "welcome": true
  }
}';

-- Create trigger for automatic timestamp updates on notification_history
CREATE TRIGGER update_notification_history_updated_at
BEFORE UPDATE ON public.notification_history
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();