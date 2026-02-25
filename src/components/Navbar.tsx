'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, PawPrint, Bell, LogOut, User, MessageCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { supabase, adminSupabase } from '@/lib/supabaseClient';

const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Browse Puppies', href: '/browse' },
];

export default function Navbar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [profile, setProfile] = useState<any>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Dynamically choose the client based on the route
        const activeClient = pathname.startsWith('/admin') ? adminSupabase : supabase;

        activeClient.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            if (session?.user) fetchProfile(session.user.id, activeClient);
        });

        const { data: { subscription } } = activeClient.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id, activeClient);
                subscribeToNotifications(session.user.id, activeClient);
            } else {
                setProfile(null);
                setNotifications([]);
            }
        });

        return () => subscription.unsubscribe();
    }, [pathname]);

    useEffect(() => {
        if (user) {
            const activeClient = pathname.startsWith('/admin') ? adminSupabase : supabase;
            fetchNotifications(user.id, activeClient);
            subscribeToNotifications(user.id, activeClient);
        }
    }, [user, pathname]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
            if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    async function fetchProfile(userId: string, activeClient: any) {
        const { data } = await activeClient.from('profiles').select('*').eq('id', userId).maybeSingle();
        if (data) {
            setProfile(data);
        } else {
            // Profile missing (e.g. after schema reset) — upsert it
            const { data: { session } } = await activeClient.auth.getSession();
            if (session?.user) {
                await activeClient.from('profiles').upsert({
                    id: userId,
                    email: session.user.email,
                    full_name: session.user.user_metadata?.full_name || null,
                }, { onConflict: 'id', ignoreDuplicates: true });
            }
        }
    }

    async function fetchNotifications(userId: string, activeClient: any) {
        const { data } = await activeClient
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);
        if (data) setNotifications(data);
    }

    function subscribeToNotifications(userId: string, activeClient: any) {
        const channel = activeClient
            .channel(`notifications:${userId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${userId}`,
            }, (payload: any) => {
                setNotifications((prev) => [payload.new, ...prev]);
            })
            .subscribe();
        return () => activeClient.removeChannel(channel);
    }

    async function markAllRead() {
        if (!user) return;
        const activeClient = pathname.startsWith('/admin') ? adminSupabase : supabase;
        await activeClient.from('notifications').update({ is_read: true }).eq('user_id', user.id).eq('is_read', false);
        setNotifications((prev) => prev.map(n => ({ ...n, is_read: true })));
    }

    async function handleSignOut() {
        const activeClient = pathname.startsWith('/admin') ? adminSupabase : supabase;
        await activeClient.auth.signOut();
        router.push('/');
        router.refresh();
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    // Hide global navbar on admin routes completely (admin has its own sidebar/header)
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <nav className="bg-black text-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex items-center gap-2 group">
                            <PawPrint className="h-8 w-8 text-[var(--color-primary)] group-hover:scale-110 transition-transform duration-300" />
                            <span className="font-bold text-2xl tracking-tight">PawsomeBreed</span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-3 py-2 text-sm font-medium transition-colors relative group ${pathname === link.href ? 'text-white' : 'text-gray-300 hover:text-white'}`}
                            >
                                {link.name}
                                <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[var(--color-primary)] transition-transform duration-300 origin-left ${pathname === link.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`} />
                            </Link>
                        ))}

                        {user ? (
                            <div className="flex items-center gap-3">
                                {/* Chat Link */}
                                <Link href="/chat" className={`p-2 rounded-full hover:bg-gray-800 transition-colors ${pathname === '/chat' ? 'text-[var(--color-primary)]' : 'text-gray-300'}`} title="Messages">
                                    <MessageCircle className="w-5 h-5" />
                                </Link>

                                {/* Notifications Bell */}
                                <div className="relative" ref={notifRef}>
                                    <button
                                        onClick={() => { setShowNotifs(!showNotifs); if (!showNotifs) markAllRead(); }}
                                        className="relative p-2 rounded-full hover:bg-gray-800 transition-colors text-gray-300 hover:text-white"
                                    >
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                {unreadCount > 9 ? '9+' : unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {showNotifs && (
                                        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                                                <span className="font-bold text-gray-900 text-sm">Notifications</span>
                                                {unreadCount > 0 && (
                                                    <button onClick={markAllRead} className="text-xs text-[var(--color-primary)] hover:underline">Mark all read</button>
                                                )}
                                            </div>
                                            <div className="max-h-80 overflow-y-auto">
                                                {notifications.length === 0 ? (
                                                    <div className="p-6 text-center text-gray-400 text-sm">No notifications yet</div>
                                                ) : (
                                                    notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                                                        >
                                                            <p className={`text-sm ${!notif.is_read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>{notif.title}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{notif.message}</p>
                                                            <p className="text-xs text-gray-400 mt-1">{new Date(notif.created_at).toLocaleString()}</p>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* User Avatar Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-800 transition-colors"
                                    >
                                        {profile?.avatar_url ? (
                                            <img src={profile.avatar_url} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-[var(--color-primary)]" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center text-white font-bold text-sm">
                                                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                                            </div>
                                        )}
                                    </button>

                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <p className="font-bold text-gray-900 text-sm truncate">{profile?.full_name || 'My Account'}</p>
                                                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                            </div>
                                            <Link href="/chat" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                                                <MessageCircle className="w-4 h-4" />
                                                My Messages
                                            </Link>
                                            <button
                                                onClick={handleSignOut}
                                                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <Link
                                href="/login"
                                className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2 rounded-full font-medium transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="-mr-2 flex md:hidden items-center gap-2">
                        {user && (
                            <Link href="/chat" className="p-2 text-gray-300 hover:text-white">
                                <MessageCircle className="w-5 h-5" />
                            </Link>
                        )}
                        {user && (
                            <button onClick={() => { setShowNotifs(!showNotifs); markAllRead(); }} className="relative p-2 text-gray-300 hover:text-white">
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount}</span>
                                )}
                            </button>
                        )}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none"
                        >
                            {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-64' : 'max-h-0'}`} id="mobile-menu">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-900 border-t border-gray-800">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`block px-3 py-2 rounded-md text-base font-medium ${pathname === link.href ? 'bg-gray-800 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                            onClick={() => setIsOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                    {user ? (
                        <>
                            <Link href="/chat" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-white">Messages</Link>
                            <button onClick={handleSignOut} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-gray-700 mt-2">Sign Out</button>
                        </>
                    ) : (
                        <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] hover:bg-gray-800 mt-2" onClick={() => setIsOpen(false)}>
                            Sign In
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
