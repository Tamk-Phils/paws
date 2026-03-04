import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Terms of Service | Ellie's Bichon Frise Sanctuary",
    description: "Read our terms of service and platform usage guidelines for adopting from Ellie's Bichon Frise Sanctuary.",
};

export default function TermsPage() {
    return (
        <div className="bg-white min-h-screen">
            <section className="bg-black text-white py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Terms of Service</h1>
                    <p className="text-gray-400 text-lg">Agreement to terms and platform usage guidelines.</p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 uppercase tracking-widest">
                        <span>Last Updated: February 25, 2026</span>
                    </div>
                </div>
            </section>

            <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="prose prose-lg prose-gray max-w-none">
                    <p className="lead text-xl text-gray-600 mb-12">
                        Welcome to PawsomeBreed. By accessing our platform, you agree to comply with and be bound by the following terms and conditions of use, which together with our privacy policy govern PawsomeBreed's relationship with you.
                    </p>

                    <div className="space-y-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. AGREEMENT TO TERMS</h2>
                            <p className="text-gray-600 leading-relaxed font-medium">
                                These Terms of Use constitute a legally binding agreement made between you, whether personally or on behalf of an entity ("you") and PawsomeBreed ("Company," "we," "us," or "our").
                            </p>
                            <p className="mt-4 text-gray-600 leading-relaxed">
                                You agree that by accessing the Platform, you have read, understood, and agreed to be bound by all of these Terms of Use. IF YOU DO NOT AGREE WITH ALL OF THESE TERMS OF USE, THEN YOU ARE EXPRESSLY PROHIBITED FROM USING THE SITE AND YOU MUST DISCONTINUE USE IMMEDIATELY.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. USER REPRESENTATIONS</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                By using the Platform, you represent and warrant that:
                            </p>
                            <ul className="space-y-4 text-gray-600">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                                    <span>All registration information you submit will be true, accurate, current, and complete.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                                    <span>You will maintain the accuracy of such information and promptly update such registration information as necessary.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                                    <span>You have the legal capacity and you agree to comply with these Terms of Use.</span>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center shrink-0 font-bold text-xs">4</div>
                                    <span>You are not a minor in the jurisdiction in which you reside.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. PROHIBITED ACTIVITIES</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                You may not access or use the Platform for any purpose other than that for which we make the Platform available. The Platform may not be used in connection with any commercial endeavors except those that are specifically endorsed or approved by us.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">Violating any local or state welfare laws.</div>
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">Listing animals not legally in your care.</div>
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">Circumventing site security features.</div>
                                <div className="p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">Engaging in any fraudulent transactions.</div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. LIMITATION OF LIABILITY</h2>
                            <p className="text-gray-600 leading-relaxed">
                                IN NO EVENT WILL WE OR OUR DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY DIRECT, INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL, SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFIT, LOST REVENUE, LOSS OF DATA, OR OTHER DAMAGES ARISING FROM YOUR USE OF THE SITE.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. REFUNDABLE DEPOSITS</h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">
                                All security deposits paid to secure a puppy adoption are **refundable**. If you choose not to proceed with the adoption at any time before physical transfer of the animal, you may request a full refund of your deposit.
                            </p>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Please contact our support team to initiate a refund request.
                            </p>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">6. CONTACT INFORMATION</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                In order to resolve a complaint regarding the Site or to receive further information regarding use of the Site, please use our contact form or live chat support.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
