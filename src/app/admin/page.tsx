'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Dog, Inbox, Activity, Loader2 } from 'lucide-react';
import { adminSupabase } from '@/lib/supabaseClient';

export default function AdminOverview() {
    const [stats, setStats] = useState({
        totalPuppies: 0,
        pendingRequests: 0,
        totalUsers: 0,
        activeChats: 0
    });
    const [recentRequests, setRecentRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();

        const channel = adminSupabase
            .channel('admin:overview')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'puppies' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'adoption_requests' }, () => fetchData())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchData())
            .subscribe();

        return () => {
            adminSupabase.removeChannel(channel);
        };
    }, []);

    async function fetchData() {
        // Fetch stats
        const { count: puppiesCount } = await adminSupabase.from('puppies').select('*', { count: 'exact', head: true });
        const { count: pendingCount } = await adminSupabase.from('adoption_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending');
        const { count: usersCount } = await adminSupabase.from('profiles').select('*', { count: 'exact', head: true });

        // For chats, since it's mock in our DB, we'll just set it to 0 or a placeholder.
        const chatsCount = 0;

        setStats({
            totalPuppies: puppiesCount || 0,
            pendingRequests: pendingCount || 0,
            totalUsers: usersCount || 0,
            activeChats: chatsCount
        });

        // Fetch recent requests
        const { data: requests } = await adminSupabase
            .from('adoption_requests')
            .select(`
                *,
                puppies (name, breed),
                profiles (full_name, email)
            `)
            .order('created_at', { ascending: false })
            .limit(5);

        if (requests) setRecentRequests(requests);
        setLoading(false);
    }

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Total Puppies', value: stats.totalPuppies, icon: Dog, trend: 'All listings', color: 'bg-blue-50 text-blue-600', trendColor: 'text-gray-500' },
                    { label: 'Pending Requests', value: stats.pendingRequests, icon: Inbox, trend: 'Needs action', color: 'bg-amber-50 text-amber-600', trendColor: 'text-amber-600' },
                    { label: 'Total Users', value: stats.totalUsers, icon: Users, trend: 'Registered accounts', color: 'bg-purple-50 text-purple-600', trendColor: 'text-gray-500' },
                    { label: 'Active Chats', value: stats.activeChats, icon: Activity, trend: 'Real-time support', color: 'bg-green-50 text-green-600', trendColor: 'text-gray-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-lg ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-50">
                            <span className={`text-sm font-medium ${stat.trendColor}`}>{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Activity Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Recent Adoption Requests</h2>
                    <Link href="/admin/requests" className="text-[var(--color-primary)] text-sm font-medium hover:underline">
                        View All
                    </Link>
                </div>
                <div className="overflow-x-auto min-h-[200px]">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Applicant</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Puppy</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                            {recentRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                        No recent requests found.
                                    </td>
                                </tr>
                            ) : recentRequests.map((row) => {
                                const statusColor = row.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    row.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

                                return (
                                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-gray-900">{row.profiles?.full_name || 'Anonymous User'}</div>
                                            <div className="text-sm text-gray-500">{row.profiles?.email || 'No email found'}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                            {row.puppies?.name || 'Unknown'} <span className="text-gray-400">({row.puppies?.breed})</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(row.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full uppercase ${statusColor}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Link href="/admin/requests" className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] mr-3">
                                                Review
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
