'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, MapPin, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function BrowsePuppies() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBreed, setSelectedBreed] = useState('All');
    const [puppies, setPuppies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPuppies();

        const channel = supabase
            .channel('public:puppies')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'puppies' }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setPuppies((prev) => [payload.new, ...prev]);
                } else if (payload.eventType === 'UPDATE') {
                    setPuppies((prev) => prev.map((p) => (p.id === payload.new.id ? { ...p, ...payload.new } : p)));
                } else if (payload.eventType === 'DELETE') {
                    setPuppies((prev) => prev.filter((p) => p.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchPuppies() {
        setLoading(true);
        const { data, error } = await supabase
            .from('puppies')
            .select('*, puppy_images(image_url)')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setPuppies(data);
        }
        setLoading(false);
    }

    const filteredPuppies = puppies.filter(puppy => {
        const name = puppy.name || '';
        const breed = puppy.breed || '';
        const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            breed.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesBreed = selectedBreed === 'All' || breed === selectedBreed;
        // only show available puppies unless it's a specific filter later
        const isAvailable = puppy.status === 'available';
        return matchesSearch && matchesBreed && isAvailable;
    });

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Page Header */}
            <div className="bg-[var(--color-secondary)] py-12 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Find Your Perfect Puppy</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Browse through our network of trusted rescues and individuals to find a furry friend that matches your lifestyle.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">

                {/* Sidebar Filters */}
                <aside className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-28">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                            <Filter className="w-5 h-5 text-[var(--color-primary)]" />
                            <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                        </div>

                        {/* Search */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Breed or Name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] text-sm text-black"
                                />
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                            </div>
                        </div>

                        {/* Breed Filter */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Breed</label>
                            <select
                                value={selectedBreed}
                                onChange={(e) => setSelectedBreed(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] text-sm bg-white cursor-pointer"
                            >
                                <option value="All">All Breeds</option>
                                <option value="Boxer">Boxer</option>
                                <option value="Rottweiler">Rottweiler</option>
                            </select>
                        </div>

                        <button
                            onClick={() => { setSearchTerm(''); setSelectedBreed('All') }}
                            className="w-full bg-[var(--color-secondary)] hover:bg-gray-200 text-gray-800 py-2 rounded-md font-medium transition-colors text-sm"
                        >
                            Reset Filters
                        </button>
                    </div>
                </aside>

                {/* Puppy Grid */}
                <main className="flex-grow">
                    <div className="mb-6 flex justify-between items-center">
                        <p className="text-gray-600 font-medium">Showing {filteredPuppies.length} available puppies</p>
                    </div>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <Loader2 className="w-8 h-8 animate-spin mb-4 text-[var(--color-primary)]" />
                            <p>Loading puppies...</p>
                        </div>
                    ) : filteredPuppies.length === 0 ? (
                        <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-gray-500 text-lg">No puppies match your current filters.</p>
                            <button
                                onClick={() => { setSearchTerm(''); setSelectedBreed('All') }}
                                className="mt-4 text-[var(--color-primary)] hover:underline font-medium cursor-pointer"
                            >
                                Clear all filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredPuppies.map((puppy) => {
                                const imageUrl = puppy.puppy_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=600&h=400';

                                return (
                                    <div key={puppy.id} className="bg-white rounded-xl overflow-hidden shadow border border-gray-100 flex flex-col group hover:shadow-lg transition-all duration-300">
                                        <div className="relative h-56 overflow-hidden bg-gray-200">
                                            <img
                                                src={imageUrl}
                                                alt={puppy.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5 flex-grow flex flex-col">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="text-xl font-bold text-gray-900">{puppy.name}</h3>
                                                <span className="text-xs font-semibold bg-[var(--color-secondary)] text-gray-700 px-2 py-1 rounded">
                                                    {puppy.age} months
                                                </span>
                                            </div>
                                            <p className="text-[var(--color-primary)] font-medium text-sm mb-3">{puppy.breed}</p>



                                            <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                                                <Link
                                                    href={`/puppies/${puppy.id}`}
                                                    className="flex-1 bg-white border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white py-2 rounded-lg font-medium text-center transition-colors text-sm"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
