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
                            Adopt. Rescue. Love. Connecting families with incredible puppies from trusted individuals and rescues.
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
                    <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end gap-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-[var(--color-primary)]" />
                            <span>pawsomebreed18@gmail.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-[var(--color-primary)]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                            </svg>
                            <a href="https://github.com/Tamk-Phils/paws" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub Repository</a>
                        </div>
                        <span>Made with love</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
