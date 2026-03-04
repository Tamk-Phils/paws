import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Privacy Policy | Ellie's Boxer & Rottweiler Sanctuary",
    description: "Learn how we protect and handle your data at Ellie's Boxer & Rottweiler Sanctuary.",
};

export default function PrivacyPage() {
    return (
        <div className="bg-white min-h-screen">
            <section className="bg-black text-white py-24">
                <div className="max-w-4xl mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Privacy Policy</h1>
                    <p className="text-gray-400 text-lg">Your privacy is our priority. Learn how we handle your data.</p>
                    <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 uppercase tracking-widest">
                        <span>Effective Date: February 25, 2026</span>
                    </div>
                </div>
            </section>

            <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6">
                <div className="prose prose-lg prose-gray max-w-none">
                    <p className="lead text-xl text-gray-600 mb-12">
                        At PawsomeBreed, we are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about this privacy notice, or our practices with regards to your personal information, please contact our support team via our contact form or live chat.
                    </p>

                    <div className="space-y-16">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">1. INFORMATION WE COLLECT</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We collect personal information that you voluntarily provide to us when you register on the Platform, express an interest in obtaining information about us or our products and services, or otherwise when you contact us.
                            </p>
                            <div className="mt-6 bg-gray-50 border border-gray-100 p-8 rounded-2xl">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Key Data Points</h3>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-600">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></span> Name and Contact Data</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></span> Credentials</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></span> Payment Data</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 bg-[var(--color-primary)] rounded-full"></span> Adoption History</li>
                                </ul>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">2. HOW WE USE YOUR INFORMATION</h2>
                            <p className="text-gray-600 leading-relaxed">
                                We use personal information collected via our Platform for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
                            </p>
                            <ul className="mt-6 space-y-4 text-gray-600">
                                <li className="flex gap-3">
                                    <strong className="text-gray-900 shrink-0">Facilitation:</strong>
                                    <span>To facilitate account creation and logon process and to perform the adoption facilitation services.</span>
                                </li>
                                <li className="flex gap-3">
                                    <strong className="text-gray-900 shrink-0">Communication:</strong>
                                    <span>To send administrative information to you, such as security alerts and updates to our terms.</span>
                                </li>
                                <li className="flex gap-3">
                                    <strong className="text-gray-900 shrink-0">Protection:</strong>
                                    <span>To protect our Platform and our users as part of our efforts to keep our Services safe and secure.</span>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">3. WILL YOUR INFORMATION BE SHARED?</h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. Better specifically, we may need to process your data or share your personal information in the following situations:
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="p-6 border border-gray-100 rounded-2xl hover:border-[var(--color-primary)]/20 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">Vendors & Third-Party Service Providers</h4>
                                    <p className="text-sm text-gray-500">We may share your data with third-party vendors, service providers, contractors or agents who perform services for us or on our behalf.</p>
                                </div>
                                <div className="p-6 border border-gray-100 rounded-2xl hover:border-[var(--color-primary)]/20 transition-colors">
                                    <h4 className="font-bold text-gray-900 mb-2">Business Transfers</h4>
                                    <p className="text-sm text-gray-500">We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, or acquisition.</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">4. THE SECURITY OF YOUR INFORMATION</h2>
                            <p className="text-gray-600 leading-relaxed mb-4">
                                We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process.
                            </p>
                            <p className="text-gray-600 leading-relaxed italic">
                                However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure.
                            </p>
                        </div>

                        <section>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">5. CONTACT INFORMATION</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                If you have questions or comments about this policy, you may contact our support team via our contact form or live chat.
                            </p>
                        </section>
                    </div>
                </div>
            </section>
        </div>
    );
}
