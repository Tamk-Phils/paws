import Link from 'next/link';
import { ArrowRight, Heart, PawPrint } from 'lucide-react';

const team = [
    { name: 'Emily Carter', role: 'Co-Founder & CEO', bio: 'Animal welfare advocate with 12+ years in rescue operations across the US.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&h=300&fit=crop&crop=face' },
    { name: 'Marcus Johnson', role: 'Head of Operations', bio: 'Believes every dog deserves a second chance. Built our vetting process from the ground up.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
    { name: 'Priya Nair', role: 'Community Manager', bio: 'Dog mom to 3. Manages our network of trusted listers and ensures listing quality.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300&h=300&fit=crop&crop=face' },
];

const values = [
    { emoji: '🐾', title: 'Animal First', desc: 'Every decision we make is guided by the best interest of the dog, always.' },
    { emoji: '🔒', title: 'Safe & Trusted', desc: 'We verify every lister to ensure safe, responsible placements.' },
    { emoji: '🌎', title: 'Nationwide Reach', desc: 'Connecting thousands of families with loving dogs across all 50 states.' },
    { emoji: '💬', title: 'Community Driven', desc: 'Our adopter and lister community is the heart of everything we do.' },
];

export default function AboutPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero */}
            <section className="relative bg-black text-white py-28 overflow-hidden">
                <div className="absolute inset-0 opacity-30">
                    <img src="https://images.unsplash.com/photo-1510337269634-9aa8f42da111?auto=format&fit=crop&q=80&w=1400" alt="Boxer and Rottweiler" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                </div>
                <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
                    <div className="flex justify-center mb-6">
                        <PawPrint className="w-12 h-12 text-[var(--color-primary)]" />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6">Our Story</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        PawsomeBreed was founded with one simple belief: every dog deserves a loving forever home, and every family deserves to find the perfect furry companion safely and transparently.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="py-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4">Our Mission</p>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Connecting hearts, one paw at a time</h2>
                        <p className="text-gray-500 leading-relaxed mb-6">
                            We built PawsomeBreed to fix a broken adoption process. Too many families struggled to find trustworthy listings. Too many dogs ended up with the wrong homes. We changed that by creating a platform that puts transparency, safety, and community at its core.
                        </p>
                        <p className="text-gray-500 leading-relaxed mb-8">
                            Since our founding, we've facilitated thousands of successful adoptions across the US — from rescue organizations in rural Texas to individual breeders in New England.
                        </p>
                        <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold inline-flex items-center gap-2 transition-all duration-300">
                            Find Your Pup <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src="https://images.unsplash.com/photo-1510337269634-9aa8f42da111?auto=format&fit=crop&q=80&w=1000" alt="Boxer playing" className="rounded-2xl object-cover h-64 w-full" />
                        <img src="https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&q=80&w=1000" alt="Rottweiler" className="rounded-2xl object-cover h-64 w-full mt-8" />
                        <img src="https://images.unsplash.com/photo-1558322394-4d8813ceef8a?auto=format&fit=crop&q=80&w=1000" alt="Boxer puppy" className="rounded-2xl object-cover h-48 w-full" />
                        <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=1000" alt="Rottweiler puppy" className="rounded-2xl object-cover h-48 w-full mt-4" />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">What We Stand For</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((v) => (
                            <div key={v.title} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-4xl mb-4">{v.emoji}</div>
                                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                                <p className="text-sm text-gray-500">{v.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="py-24">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">Meet the Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {team.map((member) => (
                            <div key={member.name} className="text-center">
                                <img src={member.photo} alt={member.name} className="w-28 h-28 rounded-full object-cover mx-auto mb-4 border-4 border-[var(--color-secondary)] shadow-sm" />
                                <h3 className="font-bold text-gray-900 text-lg">{member.name}</h3>
                                <p className="text-[var(--color-primary)] text-sm font-medium mb-2">{member.role}</p>
                                <p className="text-gray-500 text-sm">{member.bio}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="bg-black text-white py-20">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <Heart className="w-12 h-12 text-[var(--color-primary)] mx-auto mb-6" />
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the PawsomeBreed family</h2>
                    <p className="text-gray-400 mb-10 text-lg">Thousands of families found their best friend here. Yours could be next.</p>
                    <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 inline-flex items-center gap-2">
                        Browse Puppies <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
