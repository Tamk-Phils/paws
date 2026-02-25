'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, adminSupabase } from '@/lib/supabaseClient';
import { useEffect, useState } from 'react';
import {
    BarChart3,
    Dog,
    Inbox,
    Users,
    MessageSquare,
    Settings,
    LogOut,
    Loader2,
    Menu,
    X
} from 'lucide-react';

const adminLinks = [
    { name: 'Overview', href: '/admin', icon: BarChart3 },
    { name: 'Puppies', href: '/admin/puppies', icon: Dog },
    { name: 'Requests', href: '/admin/requests', icon: Inbox },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    async function checkAuth() {
        // Ensure user is signed in using the admin client
        const { data: { session } } = await adminSupabase.auth.getSession();
        if (!session?.user) {
            router.push('/login');
            return;
        }

        // Check user role from profiles table
        const { data: profile } = await adminSupabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .maybeSingle();

        if (profile?.role === 'admin') {
            setIsAuthorized(true);
        } else {
            console.warn('Unauthorized access attempt: User is not an admin.');
            router.push('/');
        }
    }

    async function handleSignOut() {
        await adminSupabase.auth.signOut();
        router.push('/login');
    }

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            {/* Mobile Header */}
            <div className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-20 relative">
                <span className="font-bold text-lg text-gray-900">Admin Panel</span>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-16 md:h-20 flex items-center px-6 border-b border-gray-200 shrink-0">
                    <Link href="/" className="font-bold text-xl tracking-tight text-gray-900">
                        B&R Admin
                    </Link>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {adminLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                    ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                            >
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-[var(--color-primary)]' : 'text-gray-400'}`} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-200 shrink-0">
                    <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-red-600" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 h-[calc(100vh-4rem)] md:h-screen w-full">
                <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
