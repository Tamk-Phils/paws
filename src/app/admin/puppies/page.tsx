'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit2, Trash2, MoreVertical, Loader2, Share2, Check } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function ManagePuppies() {
    const [searchTerm, setSearchTerm] = useState('');
    const [puppies, setPuppies] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchPuppies();

        const channel = supabase
            .channel('admin:manage-puppies')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'puppies' }, () => {
                fetchPuppies();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchPuppies() {
        // Here we could filter by the admin's user_id, but for demonstration we'll grab all
        const { data, error } = await supabase
            .from('puppies')
            .select('*, puppy_images(image_url)')
            .order('created_at', { ascending: false });

        if (data && !error) {
            setPuppies(data);
        }
        setLoading(false);
    }

    const filteredPuppies = puppies.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.breed.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShare = async (id: string) => {
        try {
            const url = `${window.location.origin}/puppies/${id}`;
            await navigator.clipboard.writeText(url);
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Manage Puppies</h1>

                <Link href="/admin/puppies/new" className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-5 py-2.5 rounded-lg font-bold transition-all shadow-sm flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Add New Puppy
                </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder="Search by name or breed..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]">
                            <option>All Status</option>
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="adopted">Adopted</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto min-h-[300px] relative">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Puppy</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Price</th>
                                    <th className="px-6 py-4">Added On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {filteredPuppies.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No puppies found.
                                        </td>
                                    </tr>
                                ) : filteredPuppies.map((puppy) => {
                                    const img = puppy.puppy_images?.[0]?.image_url || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=100&h=100';
                                    const statusColor = puppy.status === 'available' ? 'bg-green-100 text-green-800' : puppy.status === 'adopted' ? 'bg-gray-100 text-gray-800' : 'bg-amber-100 text-amber-800';

                                    return (
                                        <tr key={puppy.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                                                        <img className="h-full w-full object-cover" src={img} alt={puppy.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-bold text-gray-900">{puppy.name}</div>
                                                        <div className="text-sm text-gray-500">{puppy.breed}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${statusColor}`}>
                                                    {puppy.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                ${puppy.adoption_fee}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(puppy.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleShare(puppy.id)}
                                                        className="text-gray-400 hover:text-green-600 transition-colors flex items-center justify-center p-2 rounded-md hover:bg-green-50"
                                                        title="Share Link"
                                                    >
                                                        {copiedId === puppy.id ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
                                                    </button>
                                                    <Link href={`/admin/puppies/edit/${puppy.id}`} className="text-gray-400 hover:text-blue-600 transition-colors flex items-center justify-center p-2 rounded-md hover:bg-blue-50" title="Edit">
                                                        <Edit2 className="w-4 h-4" />
                                                    </Link>
                                                    <button onClick={async () => {
                                                        if (confirm('Are you sure you want to delete this puppy?')) {
                                                            await supabase.from('puppies').delete().eq('id', puppy.id);
                                                        }
                                                    }} className="text-gray-400 hover:text-red-600 transition-colors flex items-center justify-center p-2 rounded-md hover:bg-red-50" title="Delete">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination mock */}
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{filteredPuppies.length === 0 ? 0 : 1}</span> to <span className="font-medium">{filteredPuppies.length}</span> results
                            </p>
                        </div>
                        {filteredPuppies.length > 0 && (
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px bg-white">
                                    <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium z-10 rounded-md">
                                        1
                                    </button>
                                </nav>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
