-- Add notifications table for user alerts
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'message')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can insert notifications." ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own notifications." ON public.notifications FOR UPDATE USING (true);

-- Trigger: send notification when adoption request status changes
CREATE OR REPLACE FUNCTION public.notify_adoption_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status AND NEW.user_id IS NOT NULL THEN
        IF NEW.status = 'approved' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, '🎉 Application Approved!', 'Your adoption application has been approved! Check your messages to coordinate next steps with the lister.', 'success');
        ELSIF NEW.status = 'rejected' THEN
            INSERT INTO public.notifications (user_id, title, message, type)
            VALUES (NEW.user_id, 'Application Update', 'Unfortunately your adoption application was not approved at this time. Feel free to browse other available puppies!', 'info');
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_adoption_status_change
    AFTER UPDATE ON public.adoption_requests
    FOR EACH ROW EXECUTE PROCEDURE public.notify_adoption_status_change();

-- Trigger: send notification when admin sends a new message in a conversation
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
    conv_user_id UUID;
    conv_admin_id UUID;
BEGIN
    SELECT user_id, admin_id INTO conv_user_id, conv_admin_id
    FROM public.conversations WHERE id = NEW.conversation_id;

    -- Notify the user if admin sent it
    IF NEW.sender_id = conv_admin_id AND conv_user_id IS NOT NULL THEN
        INSERT INTO public.notifications (user_id, title, message, type)
        VALUES (conv_user_id, '💬 New Message from Admin', 'You have a new message from the PawsomeBreed admin. Tap to view.', 'message');
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE PROCEDURE public.notify_new_message();

NOTIFY pgrst, 'reload schema';
