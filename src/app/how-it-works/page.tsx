import Link from 'next/link';
import { Search, FileText, Heart, MessageCircle, CheckCircle, ArrowRight, Shield, Users, Clock } from 'lucide-react';

const steps = [
    {
        icon: Search,
        step: '01',
        title: 'Browse Listings',
        description: 'Search through hundreds of verified puppy listings from trusted individuals and rescue organizations. Filter by breed, age, and more.',
        color: 'bg-amber-50 text-amber-600 border-amber-200',
    },
    {
        icon: FileText,
        step: '02',
        title: 'Submit Your Application',
        description: 'Found your match? Fill out a short adoption application that tells the lister about your home environment, past experience with dogs, and why you\'d be a great fit.',
        color: 'bg-blue-50 text-blue-600 border-blue-200',
    },
    {
        icon: MessageCircle,
        step: '03',
        title: 'Connect & Chat',
        description: 'Once your application is reviewed, you\'ll be connected with the lister. Use our built-in live chat to ask questions, schedule a meet-and-greet, and get to know your future pup.',
        color: 'bg-green-50 text-green-600 border-green-200',
    },
    {
        icon: Heart,
        step: '04',
        title: 'Welcome Home',
        description: 'After approval, finalize the adoption details directly with the lister. Welcome your new best friend into their forever home — and share the joy with the PawsomeBreed community!',
        color: 'bg-rose-50 text-rose-600 border-rose-200',
    },
];

const guarantees = [
    { icon: Shield, title: 'Verified Listers', desc: 'Every lister on PawsomeBreed goes through an identity check and must agree to our responsible listing guidelines.' },
    { icon: Users, title: 'Thorough Applications', desc: 'Our adoption form captures everything a responsible lister needs to evaluate a good home match for their puppy.' },
    { icon: Clock, title: '24/7 Support', desc: 'Our support team and live chat system is always on. Have a question at 2am? We\'ve got you covered.' },
    { icon: CheckCircle, title: 'Transparent Process', desc: 'No hidden fees, no surprise steps. The whole process — from application to approval — is transparent and straightforward.' },
];

export default function HowItWorksPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="relative bg-black text-white py-24 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img src="https://images.unsplash.com/photo-1771157552643-2ba2fae724fb?fm=jpg&q=60&w=1400&auto=format&fit=crop" alt="Boxer and Rottweiler" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4">Simple & Transparent</p>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">How PawsomeBreed Works</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Finding your perfect puppy should be joyful and safe. Here's exactly how our process works from start to finish.
                    </p>
                </div>
            </section>

            {/* Steps */}
            <section className="py-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {steps.map((s) => (
                        <div key={s.step} className="flex gap-6 p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className={`w-16 h-16 shrink-0 rounded-2xl border-2 flex items-center justify-center ${s.color}`}>
                                <s.icon className="w-7 h-7" />
                            </div>
                            <div>
                                <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Step {s.step}</span>
                                <h3 className="text-xl font-bold text-gray-900 mt-1 mb-2">{s.title}</h3>
                                <p className="text-gray-500 leading-relaxed text-sm">{s.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Photo Break */}
            <section className="relative h-72 overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1673474025690-eacc81e21daa?fm=jpg&q=60&w=1400&auto=format&fit=crop"
                    alt="Happy Rottweiler with family"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <p className="text-white text-3xl md:text-4xl font-extrabold text-center px-4">"Every dog deserves a loving forever home."</p>
                </div>
            </section>

            {/* Our Guarantees */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Commitments to You</h2>
                        <p className="text-gray-500 max-w-xl mx-auto">Every aspect of PawsomeBreed is designed to make adoption safe, transparent, and joyful.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {guarantees.map((g) => (
                            <div key={g.title} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="w-14 h-14 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <g.icon className="w-7 h-7 text-[var(--color-primary)]" />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">{g.title}</h3>
                                <p className="text-sm text-gray-500">{g.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white py-24">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your perfect companion?</h2>
                    <p className="text-gray-400 mb-10 text-lg">Browse hundreds of available puppies from trusted listers.</p>
                    <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center gap-2">
                        Browse Puppies <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
