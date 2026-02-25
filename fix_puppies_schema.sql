-- Migration Script: Add missing columns to puppies table
-- Run this in the Supabase SQL Editor

DO $$ 
BEGIN
    -- Add lister_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='puppies' AND column_name='lister_name') THEN
        ALTER TABLE public.puppies ADD COLUMN lister_name TEXT;
    END IF;

    -- Add deposit_amount column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='puppies' AND column_name='deposit_amount') THEN
        ALTER TABLE public.puppies ADD COLUMN deposit_amount NUMERIC DEFAULT 150;
    END IF;

    -- Refresh postgrest cache
    NOTIFY pgrst, 'reload schema';
END $$;
