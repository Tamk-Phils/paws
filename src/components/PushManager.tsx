'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function PushManager() {
    const [isSupported, setIsSupported] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            setIsSupported(true);
            registerServiceWorker();
        }
    }, []);

    async function registerServiceWorker() {
        try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            setRegistration(reg);

            const sub = await reg.pushManager.getSubscription();
            setIsSubscribed(!!sub);

            if (sub && await isUserLoggedIn()) {
                await syncSubscription(sub);
            }
        } catch (err) {
            console.error('Service Worker registration failed:', err);
        }
    }

    async function isUserLoggedIn() {
        const { data: { session } } = await supabase.auth.getSession();
        return !!session?.user;
    }

    async function syncSubscription(sub: PushSubscription) {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        // Save to Database
        await supabase.from('push_subscriptions').upsert({
            user_id: session.user.id,
            subscription: sub.toJSON(),
        }, { onConflict: 'user_id, subscription' });
    }

    async function subscribeToPush() {
        if (!registration) return;

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
            });

            setIsSubscribed(true);
            await syncSubscription(sub);
            console.log('Push subscription successful');
        } catch (err) {
            console.error('Push subscription failed:', err);
            alert('Notification permission denied or blocked.');
        }
    }

    function urlBase64ToUint8Array(base64String: string) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    if (!isSupported) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[60]">
            {!isSubscribed && (
                <button
                    onClick={subscribeToPush}
                    className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[var(--color-primary-hover)] transition-all flex items-center gap-2 text-sm font-bold"
                >
                    🔔 Enable Notifications
                </button>
            )}
        </div>
    );
}
