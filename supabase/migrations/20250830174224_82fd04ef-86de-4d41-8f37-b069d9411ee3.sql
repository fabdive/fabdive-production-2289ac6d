-- Create a table to store crush notifications
CREATE TABLE public.crushes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_user_id UUID NOT NULL,
  recipient_email TEXT NOT NULL,
  email_sent BOOLEAN NOT NULL DEFAULT false,
  email_id TEXT, -- Resend email ID if successful
  error_message TEXT, -- Store error if email failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.crushes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own sent crushes" 
ON public.crushes 
FOR SELECT 
USING (auth.uid() = sender_user_id);

CREATE POLICY "Users can create their own crushes" 
ON public.crushes 
FOR INSERT 
WITH CHECK (auth.uid() = sender_user_id);

CREATE POLICY "Users can update their own crushes" 
ON public.crushes 
FOR UPDATE 
USING (auth.uid() = sender_user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_crushes_updated_at
BEFORE UPDATE ON public.crushes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();