'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, ShieldCheck, Clock, Loader2, MapPin, Search, FileText, MessageCircle, Star } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

const BREED_PHOTOS = [
  { breed: 'Boxer', photo: 'https://images.unsplash.com/photo-1558349699-1e1c38c05eeb?fm=jpg&q=60&w=3000&auto=format&fit=crop' },
  { breed: 'Rottweiler', photo: 'https://images.unsplash.com/photo-1673474025690-eacc81e21daa?fm=jpg&q=60&w=3000&auto=format&fit=crop' },
  { breed: 'Boxer Puppy', photo: 'https://images.unsplash.com/photo-1593620659530-7f98c53de278?fm=jpg&q=60&w=3000&auto=format&fit=crop' },
  { breed: 'Rottweiler Puppy', photo: 'https://images.unsplash.com/photo-1644562855511-2081ea3ad3c7?fm=jpg&q=60&w=3000&auto=format&fit=crop' },
];

const HOW_IT_WORKS = [
  { icon: Search, title: 'Browse Listings', desc: 'Search through verified puppy listings by breed, age, and location.' },
  { icon: FileText, title: 'Apply to Adopt', desc: 'Submit a short application and tell the lister about your home.' },
  { icon: MessageCircle, title: 'Chat with Lister', desc: 'Connect via our built-in live chat to ask questions directly.' },
  { icon: Heart, title: 'Welcome Home', desc: 'Get approved and welcome your new best friend home.' },
];

const TESTIMONIALS = [
  { name: 'Sarah M.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face', rating: 5, text: 'Found our Boxer puppy Buddy here. The process was seamless and the support was incredible from start to finish!' },
  { name: 'James K.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face', rating: 5, text: 'Our Rottweiler Duke has been with us for 8 months. Best decision we ever made. Couldn\'t be happier.' },
  { name: 'Priya N.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&crop=face', rating: 5, text: 'I was skeptical about adopting online but PawsomeBreed made it feel totally safe and transparent.' },
];

export default function Home() {
  const [featuredPuppies, setFeaturedPuppies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ happyFamilies: 0, totalPuppies: 0 });

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('public:puppies-home')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'puppies' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: puppies } = await supabase
      .from('puppies')
      .select('*, puppy_images(image_url)')
      .eq('status', 'available')
      .order('created_at', { ascending: false })
      .limit(4);

    if (puppies) setFeaturedPuppies(puppies);

    const { count: familiesCount } = await supabase
      .from('adoption_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    const { count: puppiesCount } = await supabase
      .from('puppies')
      .select('*', { count: 'exact', head: true });

    setStats({
      happyFamilies: (familiesCount || 0) + 100,
      totalPuppies: puppiesCount || 0,
    });

    setLoading(false);
  }

  return (
    <div className="flex flex-col min-h-screen">

      {/* ─── Hero ─── */}
      <section className="relative bg-black text-white py-24 lg:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1771157552643-2ba2fae724fb?fm=jpg&q=60&w=3000&auto=format&fit=crop"
            alt="Happy Boxer and Rottweiler playing"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <p className="text-[var(--color-primary)] font-semibold uppercase tracking-widest mb-4 text-sm">Trusted by 5,000+ Families</p>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Adopt. Rescue. <span className="text-[var(--color-primary)]">Love.</span>
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-300 mb-10 text-balance">
            Connect with trusted individuals and rescues to find your perfect furry companion. Every dog deserves a loving home.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/browse"
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Find a Puppy <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center"
            >
              How it Works
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <div className="bg-[var(--color-primary)] text-white py-5">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap justify-around gap-4">
          {[
            { num: `${stats.happyFamilies}+`, label: 'Happy Families' },
            { num: `${stats.totalPuppies}+`, label: 'Puppies Listed' },
            { num: '50', label: 'States Covered' },
            { num: '4.9★', label: 'Average Rating' },
          ].map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-extrabold">{s.num}</p>
              <p className="text-sm text-white/80">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Featured Puppies ─── */}
      <section className="py-20 bg-[var(--color-secondary)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-foreground)] mb-4">Featured Furry Friends</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              These adorable puppies are waiting for their forever homes. See if one steals your heart!
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
          ) : featuredPuppies.length === 0 ? (
            /* Placeholder cards when no puppies in DB */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { name: 'Buddy', breed: 'Boxer', age: '3 mo', photo: 'https://images.unsplash.com/photo-1558349699-1e1c38c05eeb?fm=jpg&q=60&w=1000&auto=format&fit=crop' },
                { name: 'Luna', breed: 'Rottweiler', age: '2 mo', photo: 'https://images.unsplash.com/photo-1673474025690-eacc81e21daa?fm=jpg&q=60&w=1000&auto=format&fit=crop' },
                { name: 'Max', breed: 'Boxer', age: '4 mo', photo: 'https://images.unsplash.com/photo-1593620659530-7f98c53de278?fm=jpg&q=60&w=1000&auto=format&fit=crop' },
                { name: 'Bella', breed: 'Rottweiler', age: '5 mo', photo: 'https://images.unsplash.com/photo-1644562855511-2081ea3ad3c7?fm=jpg&q=60&w=1000&auto=format&fit=crop' },
              ].map((puppy) => (
                <div key={puppy.name} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 flex flex-col group">
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    <img src={puppy.photo} alt={puppy.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  </div>
                  <div className="p-5 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-xl font-bold text-gray-900">{puppy.name}</h3>
                      <span className="text-sm font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded">{puppy.age}</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{puppy.breed}</p>
                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end">
                      <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm">Adopt</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredPuppies.map((puppy) => {
                const imageUrl = puppy.puppy_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600&h=400';
                return (
                  <div key={puppy.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col group cursor-pointer">
                    <div className="relative h-64 overflow-hidden bg-gray-200">
                      <img src={imageUrl} alt={puppy.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{puppy.name}</h3>
                        <span className="text-sm font-medium bg-[var(--color-secondary)] text-gray-600 px-2 py-1 rounded">{puppy.age} mo</span>
                      </div>
                      <p className="text-gray-500 mb-4 text-sm">{puppy.breed} • {puppy.gender}</p>
                      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-end">
                        <Link href={`/puppies/${puppy.id}`} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-4 py-2 rounded-lg font-medium transition-colors text-sm shrink-0">Adopt</Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/browse" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold text-lg group">
              See all available puppies
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Breed Gallery ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Breeds</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Browse by your favorite breed and discover the pup that was made for you.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {BREED_PHOTOS.map((b) => (
              <Link key={b.breed} href={`/browse?breed=${encodeURIComponent(b.breed)}`} className="group relative rounded-2xl overflow-hidden aspect-square shadow-sm hover:shadow-xl transition-shadow duration-300">
                <img src={b.photo} alt={b.breed} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute bottom-3 left-0 right-0 text-center text-white text-xs font-bold">{b.breed}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Photo Banner ─── */}
      <section className="relative h-80 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?auto=format&fit=crop&q=80&w=1600" alt="Rottweiler with family" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-center px-4">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4">"A dog is the only thing on earth that loves you more than he loves himself."</h2>
          <p className="text-gray-300 text-sm">— Josh Billings</p>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-24 bg-[var(--color-secondary)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Adoption Works</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">Simple, transparent, and designed for you.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="relative w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-[var(--color-primary)]/20">
                  <step.icon className="w-7 h-7 text-[var(--color-primary)]" />
                  <span className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--color-primary)] text-white text-xs font-bold rounded-full flex items-center justify-center">{i + 1}</span>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-sm text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-14">
            <Link href="/how-it-works" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-3 rounded-full font-bold transition-all duration-300 inline-flex items-center gap-2">
              Learn More <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Happy Families Photo Grid ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <img src="https://images.unsplash.com/photo-1510337269634-9aa8f42da111?auto=format&fit=crop&q=80&w=600" alt="Happy Boxer" className="rounded-2xl object-cover w-full h-56" />
            <img src="https://images.unsplash.com/photo-1567752881298-894bb81f9379?auto=format&fit=crop&q=80&w=600" alt="Rottweiler walking" className="rounded-2xl object-cover w-full h-56 mt-8" />
            <img src="https://images.unsplash.com/photo-1558322394-4d8813ceef8a?auto=format&fit=crop&q=80&w=600" alt="Boxer playing" className="rounded-2xl object-cover w-full h-56" />
            <img src="https://images.unsplash.com/photo-1544568100-847a948585b9?auto=format&fit=crop&q=80&w=600" alt="Rottweiler puppy" className="rounded-2xl object-cover w-full h-56 mt-8" />
          </div>
        </div>
      </section>

      {/* ─── Trust Stats ─── */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">{stats.happyFamilies}+</h3>
              <p className="text-lg text-gray-600 font-medium">Happy Families</p>
            </div>
            <div className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">100%</h3>
              <p className="text-lg text-gray-600 font-medium">Verified Listers</p>
            </div>
            <div className="p-8 rounded-2xl bg-white shadow-sm border border-gray-100">
              <div className="mx-auto w-16 h-16 bg-[var(--color-primary)]/10 rounded-full flex items-center justify-center mb-6">
                <Clock className="w-8 h-8 text-[var(--color-primary)]" />
              </div>
              <h3 className="text-4xl font-extrabold text-gray-900 mb-2">24/7</h3>
              <p className="text-lg text-gray-600 font-medium">Adoption Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">What Adopters Say</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Thousands of happy families found their best friend here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-gray-700 leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.photo} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/success-stories" className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] font-bold text-lg group">
              Read all success stories
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="bg-black text-white py-28 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src="https://images.unsplash.com/photo-1510337269634-9aa8f42da111?auto=format&fit=crop&q=80&w=1920" alt="Boxer" className="w-full h-full object-cover" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to find your new<br />best friend?</h2>
          <p className="text-xl text-gray-400 mb-10">Start browsing listings today and discover the puppy that is meant for you.</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/browse" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:shadow-xl inline-flex items-center gap-2">
              Browse Puppies <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/how-it-works" className="bg-white/10 border border-white/20 hover:bg-white/20 text-white px-10 py-4 rounded-full font-bold text-lg transition-all duration-300">
              How it Works
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
