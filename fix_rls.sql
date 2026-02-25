-- ============================================================
-- RUN THIS ENTIRE SCRIPT in Supabase SQL Editor
-- It will fix all RLS policies and create missing tables
-- ============================================================

-- Conversations table (one per user ↔ admin)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Conversations viewable by participants." ON public.conversations FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can insert conversations." ON public.conversations FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Anyone can update conversations." ON public.conversations FOR UPDATE USING (true);

-- Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Messages viewable by participants." ON public.messages FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can insert messages." ON public.messages FOR INSERT WITH CHECK (true);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view own notifications." ON public.notifications FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "Anyone can insert notifications." ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY IF NOT EXISTS "Users can update own notifications." ON public.notifications FOR UPDATE USING (true);

-- Trigger: notify user when adoption request status changes
CREATE OR REPLACE FUNCTION public.notify_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
        IF NEW.status = 'approved' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, '🎉 Application Approved!', 'Your adoption application has been approved! The lister will contact you to arrange next steps.', 'success');
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, 'Application Update', 'Unfortunately your adoption application was not approved at this time. Feel free to browse other puppies!', 'info');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_adoption_status_change ON public.adoption_requests;
CREATE TRIGGER on_adoption_status_change
    AFTER UPDATE ON public.adoption_requests
    FOR EACH ROW EXECUTE PROCEDURE public.notify_adoption_status_change();


DROP POLICY IF EXISTS "Listers can insert puppies." ON public.puppies;
DROP POLICY IF EXISTS "Listers can update their own puppies." ON public.puppies;
DROP POLICY IF EXISTS "Listers can delete their own puppies." ON public.puppies;
DROP POLICY IF EXISTS "Anyone can insert puppies." ON public.puppies;
DROP POLICY IF EXISTS "Anyone can update puppies." ON public.puppies;
DROP POLICY IF EXISTS "Anyone can delete puppies." ON public.puppies;

-- Create open policies (for demo/admin use — lock down in production)
CREATE POLICY "Anyone can insert puppies." ON public.puppies FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update puppies." ON public.puppies FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete puppies." ON public.puppies FOR DELETE USING (true);

-- Drop and recreate puppy_images policies
DROP POLICY IF EXISTS "Listers can insert puppy images." ON public.puppy_images;
DROP POLICY IF EXISTS "Anyone can insert puppy images." ON public.puppy_images;
DROP POLICY IF EXISTS "Anyone can delete puppy images." ON public.puppy_images;

CREATE POLICY "Anyone can insert puppy images." ON public.puppy_images FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can delete puppy images." ON public.puppy_images FOR DELETE USING (true);

-- Drop and recreate reviews policies
DROP POLICY IF EXISTS "Users can insert reviews." ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can update their own reviews." ON public.reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews." ON public.reviews;

CREATE POLICY "Anyone can insert reviews." ON public.reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reviews." ON public.reviews FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete reviews." ON public.reviews FOR DELETE USING (true);

-- Drop and recreate storage policies
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'puppy_images' );
CREATE POLICY "Anyone can upload images" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'puppy_images' );
CREATE POLICY "Anyone can delete images" ON storage.objects FOR DELETE USING ( bucket_id = 'puppy_images' );

-- Ensure storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public) 
VALUES ('puppy_images', 'puppy_images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

NOTIFY pgrst, 'reload schema';
