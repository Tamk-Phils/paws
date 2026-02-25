-- Clean up existing tables and triggers to ensure a fresh start
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.adoption_requests CASCADE;
DROP TABLE IF EXISTS public.puppy_images CASCADE;
DROP TABLE IF EXISTS public.puppies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  full_name TEXT,
  email TEXT UNIQUE,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'lister')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Puppies Table
CREATE TABLE public.puppies (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  lister_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER NOT NULL, -- in months
  gender TEXT NOT NULL,
  color TEXT,
  size TEXT,
  adoption_fee NUMERIC NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  description TEXT,
  health_verified BOOLEAN DEFAULT false,
  vaccinations_up_to_date BOOLEAN DEFAULT false,
  microchipped BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS for Puppies (open for demo/admin use - lock down in production)
ALTER TABLE public.puppies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puppies are viewable by everyone." ON public.puppies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppies." ON public.puppies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update puppies." ON public.puppies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete puppies." ON public.puppies FOR DELETE USING (true);


-- 3. Puppy Images Table
CREATE TABLE public.puppy_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puppy_id UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.puppy_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puppy images are viewable by everyone." ON public.puppy_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppy images." ON public.puppy_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete puppy images." ON public.puppy_images FOR DELETE USING (true);


-- 4. Adoption Requests Table
CREATE TABLE public.adoption_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puppy_id UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  contact_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  home_environment TEXT NOT NULL,
  past_experience TEXT NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
-- Admins/Listers can view all. Users can view their own. For simplicity, allow all reads in demo.
CREATE POLICY "Adoption requests viewable by all." ON public.adoption_requests FOR SELECT USING (true); 
CREATE POLICY "Anyone can insert adoption requests." ON public.adoption_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update adoption requests." ON public.adoption_requests FOR UPDATE USING (true);


-- 5. Reviews Table
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  puppy_id UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews are viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews." ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own reviews." ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Users can delete their own reviews." ON public.reviews FOR DELETE USING (true);

-- 6. Storage Bucket for puppy images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('puppy_images', 'puppy_images', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for Storage
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'puppy_images' );

CREATE POLICY "Authenticated users can upload" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'puppy_images' AND auth.role() = 'authenticated' );

-- Reload Schema Cache
NOTIFY pgrst, 'reload schema';
