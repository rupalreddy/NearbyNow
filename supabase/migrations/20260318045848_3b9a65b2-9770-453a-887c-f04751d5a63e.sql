
-- Create a table for user-submitted businesses
CREATE TABLE public.user_businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hospital', 'food', 'repair', 'education', 'transport', 'shopping', 'hotel', 'grocery')),
  description TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  hours TEXT DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  tags TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_businesses ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved businesses
CREATE POLICY "Anyone can view approved businesses"
  ON public.user_businesses FOR SELECT
  USING (status = 'approved');

-- Authenticated users can view their own businesses (any status)
CREATE POLICY "Users can view own businesses"
  ON public.user_businesses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Authenticated users can add businesses
CREATE POLICY "Users can add businesses"
  ON public.user_businesses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own businesses
CREATE POLICY "Users can update own businesses"
  ON public.user_businesses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can delete their own businesses
CREATE POLICY "Users can delete own businesses"
  ON public.user_businesses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Timestamp trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_user_businesses_updated_at
  BEFORE UPDATE ON public.user_businesses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
