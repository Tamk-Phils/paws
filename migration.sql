-- Migration Script: Add 6-Section Form Fields to adoption_requests table
-- Run this in the Supabase SQL Editor

DO $$ 
BEGIN

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

END $$;
