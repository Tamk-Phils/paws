import { Metadata } from 'next';
import Link from 'next/link';
import { Star, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
    title: "Success Stories | Ellie's Bichon Frise Sanctuary",
    description: "Read heartwarming stories from families who found their perfect Bichon Frise companion through our sanctuary.",
};

const stories = [
    {
        family: 'The Thompson Family',
        location: 'Austin, TX',
        puppy: 'Rex — Boxer',
        photo: 'https://images.unsplash.com/photo-1593620659530-7f98c53de278?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        familyPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face',
        quote: 'Rex came into our lives at the perfect time. He has brought so much joy and love to our household. The adoption process through PawsomeBreed was seamless and we felt supported every step of the way.',
        rating: 5,
    },
    {
        family: 'Sarah & Mike',
        location: 'Denver, CO',
        puppy: 'Luna — Rottweiler',
        photo: 'https://images.unsplash.com/photo-1673474025690-eacc81e21daa?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        familyPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
        quote: 'We had been looking for a Rottweiler for months. PawsomeBreed connected us with an amazing lister who was SO thorough in making sure we were the right fit. Luna is the best thing to happen to us!',
        rating: 5,
    },
    {
        family: 'The Patel Family',
        location: 'Chicago, IL',
        puppy: 'Buddy — Boxer',
        photo: 'https://images.unsplash.com/photo-1558349699-1e1c38c05eeb?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        familyPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face',
        quote: 'I was skeptical about adopting online but the vetting process and live chat with the lister made us feel completely at ease. Buddy has been part of our family for 6 months now and we could not be happier.',
        rating: 5,
    },
    {
        family: 'James R.',
        location: 'Seattle, WA',
        puppy: 'Duke — Rottweiler',
        photo: 'https://images.unsplash.com/photo-1644562855511-2081ea3ad3c7?fm=jpg&q=60&w=1200&auto=format&fit=crop',
        familyPhoto: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face',
        quote: 'PawsomeBreed made the process feel personal. The live chat feature let me ask questions directly and the lister was incredibly responsive. Duke arrived healthy, happy and ready to play!',
        rating: 5,
    },
];

export default function SuccessStoriesPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="relative bg-black text-white py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=1400" alt="Happy families with dogs" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4">Happy Endings</p>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Success Stories</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Real families. Real Boxers and Rottweilers. Real love. Here are just a few of the thousands of happy adoption stories from PawsomeBreed.</p>
                </div>
            </section>

            {/* Stats banner */}
            <div className="bg-[var(--color-secondary)] border-b border-gray-200">
                <div className="max-w-5xl mx-auto px-4 py-8 flex flex-wrap justify-around gap-6 text-center">
                    {[
                        { num: '5,000+', label: 'Successful Adoptions' },
                        { num: '4.9★', label: 'Average Rating' },
                        { num: '50', label: 'States Covered' },
                        { num: '98%', label: 'Satisfaction Rate' },
                    ].map((s) => (
                        <div key={s.label}>
                            <p className="text-2xl font-extrabold text-gray-900">{s.num}</p>
                            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stories Grid */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {stories.map((s) => (
                            <div key={s.family} className="rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow bg-white flex flex-col">
                                <div className="relative h-64 overflow-hidden">
                                    <img src={s.photo} alt={s.puppy} className="w-full h-full object-cover" />
                                    <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full">{s.puppy}</div>
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-3 mb-4">
                                        <img src={s.familyPhoto} alt={s.family} className="w-11 h-11 rounded-full object-cover border-2 border-[var(--color-secondary)]" />
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{s.family}</p>
                                            <p className="text-gray-400 text-xs">{s.location}</p>
                                        </div>
                                        <div className="ml-auto flex items-center text-amber-400">
                                            {[...Array(s.rating)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-current" />)}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{s.quote}"</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Write your own success story</h2>
                    <p className="text-gray-400 mb-10 text-lg">Thousands of families found their perfect dog here. Yours could be next.</p>
                    <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center gap-2">
                        Browse Puppies <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
