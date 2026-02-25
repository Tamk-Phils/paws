'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
    const [sent, setSent] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            let data;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                const text = await res.text();
                throw new Error(`Server returned non-JSON response: ${text.substring(0, 100)}`);
            }

            if (res.ok) {
                setSent(true);
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="bg-black text-white py-24">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4">Get In Touch</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Contact Us</h1>
                    <p className="text-xl text-gray-400">Have a question, concern, or feedback? We'd love to hear from you.</p>
                </div>
            </section>

            <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
                    {/* Info */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">We're here for you</h2>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Whether you have a question about an adoption, an issue with a listing, or just want to say hello — our team is ready to help.
                        </p>
                        <div className="space-y-5">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                                    <MessageCircle className="w-5 h-5 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Live Chat</p>
                                    <p className="text-gray-500 text-sm">Instant support for registered users</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center shrink-0">
                                    <Mail className="w-5 h-5 text-[var(--color-primary)]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 text-sm">Email Us</p>
                                    <p className="text-gray-500 text-sm">pawsomebreed18@gmail.com</p>
                                    <p className="text-gray-400 text-xs">Response within 24 hours</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Form */}
                    <div className="lg:col-span-3">
                        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-8">
                            {sent ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
                                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Message Sent!</h3>
                                    <p className="text-gray-500">Thanks for reaching out. Our team will get back to you within 24 hours.</p>
                                </div>
                            ) : (
                                <>
                                    {error && (
                                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-5 border border-red-100 text-sm">
                                            {error}
                                        </div>
                                    )}
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-black" placeholder="John Doe" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input required type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-black" placeholder="you@example.com" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                            <input required type="text" value={formData.subject} onChange={e => setFormData({ ...formData, subject: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none text-black" placeholder="e.g. Question about an adoption" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                            <textarea required rows={6} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none resize-none text-black" placeholder="Tell us how we can help you..." />
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {loading ? (
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            ) : (
                                                <Send className="w-5 h-5" />
                                            )}
                                            {loading ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
