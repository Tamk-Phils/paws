'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PawPrint, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase, adminSupabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [formData, setFormData] = useState({ email: '', password: '', fullName: '' });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        // --- ADMIN BYPASS ---
        if (isLogin && formData.email === 'admin' && formData.password === 'admin123') {
            try {
                // Since Supabase requires valid emails, we use a mock email under the hood
                const adminEmail = 'admin@pawsomebreed.com';
                let { error: signInErr } = await adminSupabase.auth.signInWithPassword({
                    email: adminEmail,
                    password: formData.password,
                });

                // If the account doesn't exist yet, create it on the fly
                if (signInErr && signInErr.message.includes('Invalid login credentials')) {
                    const { error: signUpErr, data } = await adminSupabase.auth.signUp({
                        email: adminEmail,
                        password: formData.password,
                        options: { data: { full_name: 'System Admin' } },
                    });
                    if (signUpErr) throw signUpErr;

                    // Force their role to admin
                    if (data.user) {
                        await adminSupabase.from('profiles').update({ role: 'admin' }).eq('id', data.user.id);
                    }
                }

                router.push('/admin');
                return;
            } catch (err: any) {
                setError('Failed to auto-login admin: ' + err.message);
                setLoading(false);
                return;
            }
        }
        // --- END BYPASS ---

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password,
                });
                if (error) throw error;
                router.push('/');
            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: { data: { full_name: formData.fullName } },
                });
                if (error) throw error;
                setSuccess('Account created! Check your email to confirm your account, then sign in.');
                setIsLogin(true);
            }
        } catch (err: any) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--color-secondary)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-gray-900 hover:opacity-80 transition-opacity">
                        <PawPrint className="w-10 h-10 text-[var(--color-primary)]" />
                        <span className="text-2xl font-extrabold">PawsomeBreed</span>
                    </Link>
                    <p className="text-gray-500 mt-2 text-sm">
                        {isLogin ? 'Welcome back! Sign in to your account.' : 'Create an account to start adopting.'}
                    </p>
                </div>

                {/* Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                    {/* Toggle Tabs */}
                    <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
                        <button
                            onClick={() => { setIsLogin(true); setError(null); }}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setIsLogin(false); setError(null); }}
                            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm transition-all ${!isLogin ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Create Account
                        </button>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl border border-red-100 mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-100 mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-black"
                                    placeholder="Jane Doe"
                                />
                            </div>
                        )}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                required
                                type="text"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-black"
                                placeholder="you@example.com or admin"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                            <div className="relative">
                                <input
                                    required
                                    type={showPass ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 pr-12 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all text-black"
                                    placeholder="••••••••"
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPass(!showPass)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        By continuing, you agree to our{' '}
                        <Link href="/terms" className="text-[var(--color-primary)] hover:underline">Terms of Service</Link>
                        {' '}and{' '}
                        <Link href="/privacy" className="text-[var(--color-primary)] hover:underline">Privacy Policy</Link>.
                    </p>
                </div>

                <p className="text-center text-sm text-gray-500 mt-6">
                    <Link href="/" className="hover:text-gray-800 transition-colors">← Back to PawsomeBreed</Link>
                </p>
            </div>
        </div>
    );
}
