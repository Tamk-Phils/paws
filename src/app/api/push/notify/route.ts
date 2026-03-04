import { NextResponse } from 'next/server';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin for DB access (since this is server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
    // Guard: VAPID keys must be set at request time (not build time)
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    if (!vapidPublicKey || !vapidPrivateKey) {
        return NextResponse.json({ error: 'Push notifications not configured (missing VAPID keys)' }, { status: 500 });
    }
    webpush.setVapidDetails('mailto:pawsomebreed18@gmail.com', vapidPublicKey, vapidPrivateKey);

    try {
        const { userId, title, message, url, admin } = await req.json();

        let targetUserIds: string[] = [];

        if (admin) {
            // Fetch all admin user IDs
            const { data: adminProfiles } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'admin');
            if (adminProfiles) {
                targetUserIds = adminProfiles.map(p => p.id);
            }
        } else if (userId) {
            targetUserIds = [userId];
        }

        if (targetUserIds.length === 0) {
            return NextResponse.json({ error: 'No target users' }, { status: 400 });
        }

        // Fetch subscriptions for target users
        const { data: subs, error } = await supabase
            .from('push_subscriptions')
            .select('subscription, user_id')
            .in('user_id', targetUserIds);

        if (error || !subs || subs.length === 0) {
            return NextResponse.json({ success: true, count: 0, note: 'No subscriptions found' });
        }

        const notifications = subs.map(async (row: any) => {
            try {
                await webpush.sendNotification(
                    row.subscription,
                    JSON.stringify({ title, message, url })
                );
                return { success: true };
            } catch (err: any) {
                console.error('Push notification failed for a subscription:', err.statusCode);
                if (err.statusCode === 410 || err.statusCode === 404) {
                    // Subscription expired or no longer valid
                    await supabase.from('push_subscriptions').delete().match({ subscription: row.subscription });
                }
                return { success: false, error: err.message };
            }
        });

        const results = await Promise.all(notifications);
        return NextResponse.json({ success: true, count: results.filter(r => r.success).length });

    } catch (err: any) {
        console.error('Notify route error:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
