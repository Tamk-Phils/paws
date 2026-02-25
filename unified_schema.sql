-- ============================================================
-- PawsomeBreed — COMPLETE UNIFIED SECURE DATABASE SCHEMA
-- Purpose: This script can be run in the Supabase SQL Editor.
-- It safely adds all required fields and policies WITHOUT throwing duplicate errors.
-- Run it directly via copy-paste.
-- ============================================================

-- ─── 0. Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. Profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
    id          UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
    full_name   TEXT,
    email       TEXT UNIQUE,
    role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'lister')),
    avatar_url  TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Profiles viewable by everyone."      ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile."       ON public.profiles;

CREATE POLICY "Profiles viewable by everyone."        ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile."   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile."         ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Auto-create profile on sign-up trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    ) ON CONFLICT (id) DO NOTHING;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- ─── 2. Puppies ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.puppies (
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
    lister_name             TEXT,
    deposit_amount          NUMERIC DEFAULT 150,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.puppies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Puppies viewable by everyone." ON public.puppies;
DROP POLICY IF EXISTS "Anyone can insert puppies."    ON public.puppies;
DROP POLICY IF EXISTS "Anyone can update puppies."    ON public.puppies;
DROP POLICY IF EXISTS "Anyone can delete puppies."    ON public.puppies;

CREATE POLICY "Puppies viewable by everyone." ON public.puppies FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppies."    ON public.puppies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update puppies."    ON public.puppies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete puppies."    ON public.puppies FOR DELETE USING (true);


-- ─── 3. Puppy Images ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.puppy_images (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id    UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    image_url   TEXT NOT NULL,
    is_primary  BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.puppy_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Puppy images viewable by everyone." ON public.puppy_images;
DROP POLICY IF EXISTS "Anyone can insert puppy images."    ON public.puppy_images;
DROP POLICY IF EXISTS "Anyone can delete puppy images."    ON public.puppy_images;

CREATE POLICY "Puppy images viewable by everyone." ON public.puppy_images FOR SELECT USING (true);
CREATE POLICY "Anyone can insert puppy images."    ON public.puppy_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete puppy images."    ON public.puppy_images FOR DELETE USING (true);


-- ─── 4. Adoption Requests ────────────────────────────────────
-- Ensure the table exists
CREATE TABLE IF NOT EXISTS public.adoption_requests (
    id                      UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id                UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    user_id                 UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at              TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Safely augment missing columns (if already present, ignores)
DO $$ 
BEGIN
    -- Legacy cleanup to allow new forms to process
    ALTER TABLE public.adoption_requests DROP COLUMN IF EXISTS home_environment;
    ALTER TABLE public.adoption_requests DROP COLUMN IF EXISTS past_experience;
    ALTER TABLE public.adoption_requests DROP COLUMN IF EXISTS message;

    -- Section 1: Personal Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='contact_phone') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN contact_phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='dob') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN dob TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='address') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='city_state_zip') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN city_state_zip TEXT;
    END IF;

    -- Section 2: Household Info
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='residence_type') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN residence_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='rent_or_own') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN rent_or_own TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='landlord_info') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN landlord_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='adults_in_home') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN adults_in_home INTEGER DEFAULT 1;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='children_info') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN children_info TEXT;
    END IF;

    -- Section 3: Pet History
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='has_pets') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN has_pets BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='current_pets_info') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN current_pets_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='past_pets_info') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN past_pets_info TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='vet_info') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN vet_info TEXT;
    END IF;

    -- Section 4: Lifestyle
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='work_schedule') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN work_schedule TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='day_location') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN day_location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='night_location') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN night_location TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='exercise_plan') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN exercise_plan TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='fenced_yard') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN fenced_yard BOOLEAN DEFAULT false;
    END IF;

    -- Section 5: Preferences
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='application_type') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN application_type TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='preferred_age') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN preferred_age TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='preferred_size') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN preferred_size TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='open_to_special_needs') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN open_to_special_needs BOOLEAN DEFAULT false;
    END IF;

    -- Section 6: Commitment & Deposits
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='financially_prepared') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN financially_prepared BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='agree_to_spay_neuter') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN agree_to_spay_neuter BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='allow_home_visit') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN allow_home_visit BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='signature') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN signature TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='deposit_amount') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN deposit_amount NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='deposit_paid') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN deposit_paid BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='adoption_requests' AND column_name='status') THEN
        ALTER TABLE public.adoption_requests ADD COLUMN status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));
    END IF;
END $$;

ALTER TABLE public.adoption_requests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Adoption requests viewable by all." ON public.adoption_requests;
DROP POLICY IF EXISTS "Anyone can insert adoption requests." ON public.adoption_requests;
DROP POLICY IF EXISTS "Anyone can update adoption requests." ON public.adoption_requests;

CREATE POLICY "Adoption requests viewable by all." ON public.adoption_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert adoption requests." ON public.adoption_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update adoption requests." ON public.adoption_requests FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete adoption requests." ON public.adoption_requests FOR DELETE USING (true);


-- ─── 5. Reviews ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.reviews (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    puppy_id    UUID REFERENCES public.puppies(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating      INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment     TEXT,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Reviews viewable by everyone." ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews."    ON public.reviews;
DROP POLICY IF EXISTS "Anyone can update reviews."    ON public.reviews;
DROP POLICY IF EXISTS "Anyone can delete reviews."    ON public.reviews;

CREATE POLICY "Reviews viewable by everyone." ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews."    ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews."    ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews."    ON public.reviews FOR DELETE USING (true);


-- ─── 6. Conversations ────────────────────────────────────────
-- One conversation per user ↔ admin
CREATE TABLE IF NOT EXISTS public.conversations (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    admin_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Conversations viewable by all." ON public.conversations;
DROP POLICY IF EXISTS "Anyone can create conversations." ON public.conversations;
DROP POLICY IF EXISTS "Anyone can update conversations." ON public.conversations;

CREATE POLICY "Conversations viewable by all." ON public.conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can create conversations." ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations." ON public.conversations FOR UPDATE USING (true);


-- ─── 7. Messages ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
    id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id  UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id        UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content          TEXT NOT NULL,
    created_at       TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Messages viewable by all."   ON public.messages;
DROP POLICY IF EXISTS "Anyone can insert messages." ON public.messages;

CREATE POLICY "Messages viewable by all."   ON public.messages FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages." ON public.messages FOR INSERT WITH CHECK (true);


-- ─── 8. Notifications ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
    id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    type        TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'message')),
    is_read     BOOLEAN DEFAULT false,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own notifications."   ON public.notifications;
DROP POLICY IF EXISTS "Anyone can insert notifications."    ON public.notifications;
DROP POLICY IF EXISTS "Anyone can update notifications."    ON public.notifications;

CREATE POLICY "Users can view own notifications."   ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Anyone can insert notifications."    ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update notifications."    ON public.notifications FOR UPDATE USING (true);


-- ─── 9. Triggers ─────────────────────────────────────────────
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

DROP TRIGGER IF EXISTS on_adoption_status_change ON public.adoption_requests;
CREATE TRIGGER on_adoption_status_change
    AFTER UPDATE ON public.adoption_requests
    FOR EACH ROW EXECUTE PROCEDURE public.notify_adoption_status_change();


-- ─── 10. Storage — puppy_images bucket ───────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('puppy_images', 'puppy_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop old storage policies first to avoid postgres conflicts ("policy already exists")
-- Suppress annoying PG startup noise
DROP POLICY IF EXISTS "Public read puppy images"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload images"   ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete images"   ON storage.objects;

-- Recreate safely
CREATE POLICY "Public read puppy images"   ON storage.objects FOR SELECT USING (bucket_id = 'puppy_images');
CREATE POLICY "Anyone can upload images"   ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'puppy_images');
CREATE POLICY "Anyone can delete images"   ON storage.objects FOR DELETE USING (bucket_id = 'puppy_images');

-- ─── Done ─────────────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
