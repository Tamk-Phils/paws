import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// A separate client specifically for the admin panel to prevent session collision
// during local testing (allows user and admin to be logged in simultaneously on same browser)
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storageKey: 'sb-admin-auth-token',
    }
})
