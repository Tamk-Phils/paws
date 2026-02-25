'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PawPrint, Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();

    // Hide footer on admin routes
    if (pathname.startsWith('/admin')) {
        return null;
    }

    return (
        <footer className="bg-[var(--color-accent)] text-white pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand & Intro */}
                    <div className="col-span-1 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 group mb-6">
                            <PawPrint className="h-8 w-8 text-[var(--color-primary)] group-hover:rotate-12 transition-transform" />
                            <span className="font-bold text-xl tracking-tight">PawsomeBreed</span>
                        </Link>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Adopt. Rescue. Love. Connecting families with incredible puppies from trusted individuals and rescues across the US.
                        </p>
                        <div className="flex gap-4">
                            <Link href="/" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                                <span className="sr-only">Facebook</span>
                                <Facebook className="w-6 h-6" />
                            </Link>
                            <Link href="/" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                                <span className="sr-only">Instagram</span>
                                <Instagram className="w-6 h-6" />
                            </Link>
                            <Link href="/" className="text-gray-400 hover:text-[var(--color-primary)] transition-colors">
                                <span className="sr-only">Twitter</span>
                                <Twitter className="w-6 h-6" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Explore</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/browse" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Browse Puppies
                                </Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/success-stories" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Success Stories
                                </Link>
                            </li>
                            <li>
                                <Link href="/how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    How It Works
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Support</h3>
                        <ul className="space-y-3">
                            <li>
                                <Link href="/faq" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    FAQ
                                </Link>
                            </li>
                            <li>
                                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Contact Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4 text-white">Stay Updated</h3>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe to our newsletter for the latest puppy arrivals and adoption tips.
                        </p>
                        <form className="flex flex-col sm:flex-row gap-2" onSubmit={(e) => e.preventDefault()}>
                            <div className="relative flex-grow">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-md leading-5 bg-gray-800 text-gray-300 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-[var(--color-primary)] transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-gray-500 text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} PawsomeBreed. All rights reserved.
                    </p>
                    <div className="mt-4 md:mt-0 flex space-x-6 text-sm text-gray-500">
                        <span>Made with love in the US 🇺🇸</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
