'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, FileText, CheckCircle, Clock, XCircle, DollarSign } from 'lucide-react';

export default function UserProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkUserAndFetchData();
    }, []);

    const checkUserAndFetchData = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        setUser(session.user);

        // Fetch User's Adoption Requests
        const { data, error } = await supabase
            .from('adoption_requests')
            .select(`
                id,
                status,
                deposit_amount,
                deposit_paid,
                created_at,
                puppies ( id, name, breed, puppy_images(image_url) )
            `)
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false });

        if (data && !error) {
            setRequests(data);
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 mt-2">Manage your adoption applications and account.</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[var(--color-primary)]" /> My Applications
                    </h2>

                    {requests.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-gray-500 mb-4">You haven't submitted any adoption applications yet.</p>
                            <Link href="/browse" className="bg-[var(--color-primary)] text-white px-6 py-2 rounded-lg font-medium hover:bg-[var(--color-primary-hover)] transition">
                                Browse Puppies
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {requests.map((req) => {
                                const puppy = req.puppies;
                                const imgUrl = puppy.puppy_images?.[0]?.image_url || 'https://via.placeholder.com/150';

                                return (
                                    <div key={req.id} className="border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 items-center">
                                        <img src={imgUrl} alt={puppy.name} className="w-24 h-24 object-cover rounded-lg shrink-0" />

                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-900">{puppy.name} <span className="text-sm font-normal text-gray-500">({puppy.breed})</span></h3>
                                            <p className="text-sm text-gray-500 mt-1">Applied on {new Date(req.created_at).toLocaleDateString()}</p>

                                            <div className="mt-2 flex items-center gap-2">
                                                {req.status === 'pending' && <span className="inline-flex items-center gap-1 text-sm bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full"><Clock className="w-4 h-4" /> Pending Review</span>}
                                                {req.status === 'rejected' && <span className="inline-flex items-center gap-1 text-sm bg-red-100 text-red-800 px-2.5 py-1 rounded-full"><XCircle className="w-4 h-4" /> Application Declined</span>}
                                                {req.status === 'approved' && <span className="inline-flex items-center gap-1 text-sm bg-green-100 text-green-800 px-2.5 py-1 rounded-full"><CheckCircle className="w-4 h-4" /> Approved</span>}

                                                {req.status === 'approved' && req.deposit_paid && (
                                                    <span className="inline-flex items-center gap-1 text-sm bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full"><DollarSign className="w-4 h-4" /> Deposit Paid</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="shrink-0 w-full sm:w-auto mt-4 sm:mt-0">
                                            {req.status === 'approved' && !req.deposit_paid && (
                                                <Link
                                                    href={`/checkout/deposit/${req.id}`}
                                                    className="block w-full text-center bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-6 rounded-xl transition-colors shadow-md animate-pulse"
                                                >
                                                    Pay ${req.deposit_amount} Deposit
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
