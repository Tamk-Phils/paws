import { Metadata } from 'next';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

export const metadata: Metadata = {
    title: "FAQ | Ellie's Boxer & Rottweiler Sanctuary",
    description: "Frequently asked questions about adopting a Boxer or Rottweiler puppy, fees, and our process.",
};

const faqs = [
    {
        category: 'Adoption Process',
        items: [
            {
                q: "How do I adopt a puppy from Ellie's Boxer & Rottweiler Sanctuary?", a: 'Browse our listings, find a puppy you love, and click "Adopt". Fill in the adoption application form with your home details and experience with dogs. The lister will review your application and contact you via our chat feature.'
            },
            { q: 'How long does the adoption process take?', a: 'It varies by lister. Typically, you\'ll hear back within 24–72 hours of submitting your application. Once approved, the final handoff timeline is agreed directly between you and the lister.' },
            { q: 'Can I adopt if I live in an apartment?', a: 'Yes! Many dogs thrive in apartments. Be transparent in your application about your living situation. Some listers may have breed-specific requirements, but many are open to apartment adopters.' },
            { q: 'Is there an adoption fee?', a: 'Each listing carries its own adoption fee set by the lister. This fee typically covers vaccinations, health checks, and microchipping. You can see the fee clearly on each listing page.' },
        ]
    },
    {
        category: 'Listings & Listers',
        items: [
            { q: 'Who lists puppies on PawsomeBreed?', a: 'We accept listings from both individual dog owners (individuals rehoming a litter or a personal pet) and registered rescue organizations. All listers must agree to our responsible listing guidelines.' },
            { q: 'Are all listers verified?', a: 'Yes. All listers go through an identity check before their listings go live. We also review each listing for accuracy and completeness before approval.' },
            { q: 'Can I list my own puppies?', a: 'Absolutely. Create an account and navigate to your dashboard to submit a listing. Our admin team will review and approve it within 24 hours.' },
        ]
    },
    {
        category: 'Safety & Trust',
        items: [
            { q: 'What if I suspect a listing is fraudulent?', a: 'Report it immediately using the flag button on the listing, or contact us directly at support@pawsomebreed.com. We take fraud very seriously and investigate all reports promptly.' },
            { q: 'Do the puppies come with health records?', a: 'Most listers provide health records including vaccination history and vet check results. This information is included in the listing details. Always ask the lister directly for documentation before finalizing the adoption.' },
            { q: 'What if the puppy is sick after adoption?', a: 'Contact the lister immediately — most reputable listers have a short health guarantee period. We also recommend taking your new pup to a vet within 48 hours of adoption as a general best practice.' },
        ]
    },
];

export default function FAQPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="bg-black text-white py-24">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4">Got Questions?</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6">Frequently Asked Questions</h1>
                    <p className="text-xl text-gray-400">Everything you need to know about adopting through PawsomeBreed.</p>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-24 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="space-y-16">
                    {faqs.map((cat) => (
                        <div key={cat.category}>
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b border-gray-100">{cat.category}</h2>
                            <div className="space-y-4">
                                {cat.items.map((item) => (
                                    <details key={item.q} className="group border border-gray-200 rounded-xl overflow-hidden">
                                        <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors">
                                            <span className="font-semibold text-gray-900 text-left">{item.q}</span>
                                            <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 ml-4 group-open:rotate-180 transition-transform" />
                                        </summary>
                                        <div className="px-6 pb-6">
                                            <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Still have questions */}
                <div className="mt-20 text-center p-10 bg-[var(--color-secondary)] rounded-2xl border border-gray-100">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Still have questions?</h3>
                    <p className="text-gray-500 mb-6">Our support team is here to help. Reach out anytime.</p>
                    <Link href="/contact" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold transition-all duration-300 inline-block">
                        Contact Us
                    </Link>
                </div>
            </section>
        </div>
    );
}
