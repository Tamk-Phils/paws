-- ============================================================
-- PawsomeBreed — Complete Database Schema
-- Run this ONCE in Supabase SQL Editor (Dashboard → SQL Editor)
-- This drops and recreates everything cleanly.
-- ============================================================

-- ─── Drop existing objects ───────────────────────────────────
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_adoption_status_change ON public.adoption_requests;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.notify_adoption_status_change();

DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.adoption_requests CASCADE;
DROP TABLE IF EXISTS public.puppy_images CASCADE;
DROP TABLE IF EXISTS public.puppies CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ─── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ─── 1. Profiles ─────────────────────────────────────────────
CREATE TABLE public.profiles (
    id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name   TEXT,
    email       TEXT UNIQUE,
    role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'lister')),
    avatar_url  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles viewable by everyone."        ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile."   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile."         ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ─── 2. Puppies ──────────────────────────────────────────────
CREATE TABLE public.puppies (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    lister_id               UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name                    TEXT NOT NULL,
    breed                   TEXT NOT NULL,
    age                     INTEGER NOT NULL,   -- in months
    gender                  TEXT NOT NULL,
    color                   TEXT,
    size                    TEXT,
    adoption_fee            NUMERIC NOT NULL,
    city                    TEXT NOT NULL,
    state                   TEXT NOT NULL,
    description             TEXT,
    health_verified         BOOLEAN DEFAULT false,
    vaccinations_up_to_date BOOLEAN DEFAULT false,
    microchipped            BOOLEAN DEFAULT false,
    status                  TEXT DEFAULT 'available' CHECK (status IN ('available', 'pending', 'adopted')),
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.puppies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puppies viewable by everyone." ON public.puppies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppies."    ON public.puppies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update puppies."    ON public.puppies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete puppies."    ON public.puppies FOR DELETE USING (true);


-- ─── 3. Puppy Images ─────────────────────────────────────────
CREATE TABLE public.puppy_images (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id    UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    is_primary  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.puppy_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puppy images viewable by everyone." ON public.puppy_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppy images."    ON public.puppy_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete puppy images."    ON public.puppy_images FOR DELETE USING (true);


-- ─── 4. Adoption Requests ────────────────────────────────────
CREATE TABLE public.adoption_requests (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id                UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Section 1: Personal Info
    contact_phone           TEXT NOT NULL,
    dob                     TEXT NOT NULL,
    address                 TEXT NOT NULL,
    city_state_zip          TEXT NOT NULL,
    
    -- Section 2: Household Info
    residence_type          TEXT NOT NULL,
    rent_or_own             TEXT NOT NULL,
    landlord_info           TEXT,
    adults_in_home          INTEGER NOT NULL,
    children_info           TEXT,
    
    -- Section 3: Pet History
    has_pets                BOOLEAN NOT NULL,
    current_pets_info       TEXT,
    past_pets_info          TEXT,
    vet_info                TEXT,
    
    -- Section 4: Lifestyle
    work_schedule           TEXT NOT NULL,
    day_location            TEXT NOT NULL,
    night_location          TEXT NOT NULL,
    exercise_plan           TEXT NOT NULL,
    fenced_yard             BOOLEAN NOT NULL,
    
    -- Section 5: Preferences
    application_type        TEXT NOT NULL CHECK (application_type IN ('Adopt', 'Foster', 'Rescue Volunteer')),
    preferred_age           TEXT NOT NULL,
    preferred_size          TEXT NOT NULL,
    open_to_special_needs   BOOLEAN NOT NULL,
    
    -- Section 6: Commitment
    financially_prepared    BOOLEAN NOT NULL,
    agree_to_spay_neuter    BOOLEAN NOT NULL,
    allow_home_visit        BOOLEAN NOT NULL,
    signature               TEXT NOT NULL,
    
    -- Admin & State
    status                  TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    deposit_amount          NUMERIC DEFAULT 0,
    deposit_paid            BOOLEAN DEFAULT false,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Adoption requests viewable by all." ON public.adoption_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert adoption requests." ON public.adoption_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update adoption requests." ON public.adoption_requests FOR UPDATE USING (true);


-- ─── 5. Reviews ──────────────────────────────────────────────
CREATE TABLE public.reviews (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id    UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reviews viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews."    ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews."    ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews."    ON public.reviews FOR DELETE USING (true);


-- ─── 6. Conversations ────────────────────────────────────────
-- One conversation per user ↔ admin
CREATE TABLE public.conversations (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    admin_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversations viewable by all." ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can create conversations." ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations." ON public.conversations FOR UPDATE USING (true);


-- ─── 7. Messages ─────────────────────────────────────────────
CREATE TABLE public.messages (
    id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id  UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content          TEXT NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by all."   ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages." ON public.messages FOR INSERT WITH CHECK (true);


-- ─── 8. Notifications ────────────────────────────────────────
CREATE TABLE public.notifications (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    type        TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'message')),
    is_read     BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications."   ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications."    ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications."    ON public.notifications FOR UPDATE USING (true);


-- ─── 9. Triggers ─────────────────────────────────────────────
-- Notify user when their adoption request status changes
CREATE OR REPLACE FUNCTION public.notify_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
        IF NEW.status = 'approved' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                NEW.user_id,
                '🎉 Application Approved!',
                'Your adoption application has been approved! The lister will contact you to arrange next steps.',
                'success'
            );
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (
                NEW.user_id,
                'Application Update',
                'Unfortunately your application was not approved at this time. Feel free to browse other available puppies!',
                'info'
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_adoption_status_change
    AFTER UPDATE ON public.adoption_requests
    FOR EACH ROW EXECUTE PROCEDURE public.notify_adoption_status_change();


-- ─── 10. Storage — puppy_images bucket ───────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('puppy_images', 'puppy_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies first to avoid conflicts
DROP POLICY IF EXISTS "Public Access"                ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images"     ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images"     ON storage.objects;

CREATE POLICY "Public read puppy images"   ON storage.objects FOR SELECT USING (bucket_id = 'puppy_images');
CREATE POLICY "Anyone can upload images"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'puppy_images');
CREATE POLICY "Anyone can delete images"   ON storage.objects FOR DELETE USING (bucket_id = 'puppy_images');

-- ─── Done ─────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
