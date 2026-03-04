'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Filter, CheckCircle2, XCircle, MessageSquare, Loader2, Trash2, Clock, MapPin, Phone, User, ExternalLink, DollarSign } from 'lucide-react';
import { adminSupabase } from '@/lib/supabaseClient';

export default function AdoptionRequests() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchRequests();

        const channel = adminSupabase
            .channel('admin:manage-requests')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'adoption_requests' }, () => {
                fetchRequests();
            })
            .subscribe();

        return () => {
            adminSupabase.removeChannel(channel);
        };
    }, []);

    async function fetchRequests() {
        const { data, error } = await adminSupabase
            .from('adoption_requests')
            .select(`
    *,
    puppies(name, breed),
    profiles(full_name, email)
        `)
            .order('created_at', { ascending: false });

        if (data && !error) {
            setRequests(data);
        }
        setLoading(false);
    }

    const [depositModalOpen, setDepositModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [depositAmount, setDepositAmount] = useState<number>(150);

    // ... (keep useEffect and fetchRequests the same, handled below by targeting handleUpdateStatus)

    const handleUpdateStatus = async (id: string, newStatus: string, reqContext: any) => {
        if (newStatus === 'rejected') {
            await adminSupabase.from('adoption_requests').update({ status: 'rejected' }).eq('id', id);

            // Push Notification for Rejection
            if (reqContext.user_id) {
                fetch('/api/push/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: reqContext.user_id,
                        title: 'Application Update',
                        message: 'Your adoption application status has been updated.',
                        url: '/profile'
                    })
                }).catch(err => console.error('Push notify error:', err));
            }
            fetchRequests(); // Re-fetch to update UI
        } else if (newStatus === 'approved') {
            // Open the deposit modal instead of direct approval
            setSelectedRequest({ id, puppyId: reqContext.puppies?.id, userId: reqContext.user_id });
            setDepositAmount(150);
            setDepositModalOpen(true);
        }
    };

    const handleDeleteRequest = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this adoption request? This action cannot be undone.')) {
            const { error } = await adminSupabase.from('adoption_requests').delete().eq('id', id);
            if (error) {
                console.error('Error deleting request:', error);
                // Optionally show a toast notification
            } else {
                fetchRequests(); // Re-fetch requests to update the UI
                // Optionally show a success toast
            }
        }
    };

    const confirmApproval = async () => {
        if (!selectedRequest) return;

        try {
            // 1. Update Request with status and deposit
            const { error: reqError } = await adminSupabase.from('adoption_requests').update({
                status: 'approved',
                deposit_amount: depositAmount,
                deposit_paid: false
            }).eq('id', selectedRequest.id);
            if (reqError) throw reqError;

            // 2. Mark puppy as pending
            if (selectedRequest.puppyId) {
                const { error: puppyError } = await adminSupabase.from('puppies').update({ status: 'pending' }).eq('id', selectedRequest.puppyId);
                if (puppyError) throw puppyError;
            }

            // 3. Send Notification
            if (selectedRequest.userId) {
                const { error: notifError } = await adminSupabase.from('notifications').insert({
                    user_id: selectedRequest.userId,
                    title: '🎉 Application Approved!',
                    message: `Your application was approved! Please pay the $${depositAmount} deposit to secure your puppy.`,
                    type: 'success'
                });
                if (notifError) throw notifError;

                // Also send Push Notification
                fetch('/api/push/notify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        userId: selectedRequest.userId,
                        title: '🎉 Application Approved!',
                        message: `Your application was approved! Please pay the $${depositAmount} deposit to secure your puppy.`,
                        url: '/profile'
                    })
                }).catch(err => console.error('Push notify error:', err));
            }

            setDepositModalOpen(false);
            setSelectedRequest(null);
            fetchRequests(); // Re-fetch to update UI
        } catch (err: any) {
            console.error('Error approving request:', err);
            alert(`Failed to approve: ${err.message}`);
        }
    };

    // State to manage which request cards are expanded
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
    const toggleExpansion = (id: string) => {
        const newSet = new Set(expandedCards);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setExpandedCards(newSet);
    };

    const filteredRequests = requests.filter(req => {
        const searchMatches =
            (req.profiles?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.puppies?.name || '').toLowerCase().includes(searchTerm.toLowerCase());

        const statusMatches = statusFilter === 'All' || req.status === statusFilter.toLowerCase();

        return searchMatches && statusMatches;
    });

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-extrabold text-gray-900">Adoption Requests</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
                    <div className="relative w-full sm:w-96">
                        <input
                            type="text"
                            placeholder="Search applicant or puppy name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>

                    <div className="flex gap-2 w-full sm:w-auto">
                        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white hover:bg-gray-50 text-gray-700 font-medium">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        >
                            <option value="All">Status: All</option>
                            <option value="pending">Status: Pending</option>
                            <option value="approved">Status: Approved</option>
                            <option value="rejected">Status: Rejected</option>
                        </select>
                    </div>
                </div>

                {/* List of Requests */}
                <div className="divide-y divide-gray-100 relative min-h-[400px]">
                    {loading ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
                        </div>
                    ) : filteredRequests.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            No adoption requests found.
                        </div>
                    ) : (
                        filteredRequests.map((req) => {
                            const statusColor = req.status === 'approved' ? 'bg-green-100 text-green-800' :
                                req.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800';

                            const isExpanded = expandedCards.has(req.id);

                            return (
                                <div key={req.id} className="p-6 hover:bg-gray-50/50 transition-colors">
                                    <div className="flex flex-col lg:flex-row gap-6">

                                        {/* Applicant Info */}
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <Link href={`/admin/chat?user=${req.user_id}`} className="hover:opacity-80 transition-opacity">
                                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{req.profiles?.full_name || 'Anonymous Applicant'}</h3>
                                                    </Link>
                                                    <div className="text-sm text-gray-500 mt-1 flex flex-col sm:flex-row sm:gap-4">
                                                        <span>{req.profiles?.email || 'No email'}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>{req.contact_phone || 'No phone'}</span>
                                                        <span className="hidden sm:inline">•</span>
                                                        <span>{req.city_state_zip || 'No location'}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full uppercase ${statusColor} `}>
                                                        {req.status}
                                                    </span>
                                                    {req.status === 'approved' && (
                                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${req.deposit_paid ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} `}>
                                                            {req.deposit_paid ? 'Deposit Paid' : `Awaiting $${req.deposit_amount} Deposit`}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expand/Collapse Button */}
                                            <button
                                                onClick={() => toggleExpansion(req.id)}
                                                className="text-[var(--color-primary)] text-sm font-semibold hover:underline mt-2 inline-flex items-center"
                                            >
                                                {isExpanded ? 'Hide Application Details' : 'View Full Application Details'}
                                            </button>

                                            {/* Expanded 6-Section Application */}
                                            {isExpanded && (
                                                <div className="mt-4 space-y-4 bg-white p-5 rounded-xl border border-gray-200">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                                        {/* Sec 1 & 2 */}
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">1. Personal</h4>
                                                            <p className="text-sm"><span className="text-gray-500">DOB:</span> {req.dob}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Address:</span> {req.address}</p>

                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mt-4 mb-2">2. Household</h4>
                                                            <p className="text-sm"><span className="text-gray-500">Type:</span> {req.residence_type} ({req.rent_or_own})</p>
                                                            {req.rent_or_own === 'Rent' && <p className="text-sm"><span className="text-gray-500">Landlord:</span> {req.landlord_info}</p>}
                                                            <p className="text-sm"><span className="text-gray-500">Adults:</span> {req.adults_in_home}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Children:</span> {req.children_info || 'None'}</p>
                                                        </div>

                                                        {/* Sec 3 & 4 */}
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">3. Pet History</h4>
                                                            <p className="text-sm"><span className="text-gray-500">Has Pets:</span> {req.has_pets ? 'Yes' : 'No'}</p>
                                                            {req.has_pets && <p className="text-sm"><span className="text-gray-500">Current:</span> {req.current_pets_info}</p>}
                                                            <p className="text-sm"><span className="text-gray-500">Past:</span> {req.past_pets_info}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Vet:</span> {req.vet_info}</p>

                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mt-4 mb-2">4. Lifestyle</h4>
                                                            <p className="text-sm"><span className="text-gray-500">Schedule:</span> {req.work_schedule}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Location (Day/Night):</span> {req.day_location}/{req.night_location}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Exercise:</span> {req.exercise_plan} | Fenced: {req.fenced_yard ? 'Yes' : 'No'}</p>
                                                        </div>
                                                    </div>

                                                    {/* Sec 5 & 6 */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-2 border-t">
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">5. Preferences</h4>
                                                            <p className="text-sm"><span className="text-gray-500">Type:</span> {req.application_type}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Target Age/Size:</span> {req.preferred_age}/{req.preferred_size}</p>
                                                            <p className="text-sm"><span className="text-gray-500">Open to Special Needs:</span> {req.open_to_special_needs ? 'Yes' : 'No'}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-gray-800 border-b pb-1 mb-2">6. Commitment</h4>
                                                            <div className="flex gap-2 items-center"><CheckCircle2 className="w-3 h-3 text-green-500" /> <span className="text-sm">Financially PREPARED</span></div>
                                                            <div className="flex gap-2 items-center"><CheckCircle2 className="w-3 h-3 text-green-500" /> <span className="text-sm">WILL Spay/Neuter</span></div>
                                                            <div className="flex gap-2 items-center"><CheckCircle2 className="w-3 h-3 text-green-500" /> <span className="text-sm">ALLOWS Home Visit</span></div>
                                                            <p className="text-sm mt-2 italic font-serif">Signed: {req.signature}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                            <p className="text-xs text-gray-500 font-bold uppercase mb-1">Message to Lister</p>
                                            <p className="text-sm text-gray-700 italic">"{req.message || 'No additional message.'}"</p>
                                        </div>
                                    </div>

                                    {/* Puppy Info & Actions */}
                                    <div className="lg:w-72 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-gray-200 pt-4 lg:pt-0 lg:pl-6 shrink-0 mt-6 lg:mt-0">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Applying For</p>
                                            <div className="font-medium text-gray-900">{req.puppies?.name || 'Unknown Puppy'}</div>
                                            <div className="text-sm text-[var(--color-primary)]">{req.puppies?.breed}</div>
                                            <div className="text-xs text-gray-400 mt-2">Requested on {new Date(req.created_at).toLocaleDateString()}</div>
                                            <div className="text-xs text-gray-400 mt-1 truncate" title={req.id}>ID: <span className="font-mono">{req.id.substring(0, 8)}...</span></div>
                                        </div>

                                        <div className="mt-4 flex flex-col gap-2">
                                            {req.status === 'pending' ? (
                                                <div className="flex gap-2 shrink-0">
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'rejected', req)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                                                        title="Reject Request"
                                                    >
                                                        <XCircle className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(req.id, 'approved', req)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-transparent hover:border-green-100"
                                                        title="Approve Request"
                                                    >
                                                        <CheckCircle2 className="w-5 h-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRequest(req.id)}
                                                        className="p-2 text-gray-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                        title="Delete Request"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button disabled className="w-full bg-white border border-gray-300 text-gray-400 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-not-allowed">
                                                    Status Updated
                                                </button>
                                            )}
                                            <Link href={`/admin/chat?user=${req.user_id}`} className="w-full bg-[var(--color-secondary)] hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                                                <MessageSquare className="w-4 h-4" /> Message Applicant
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Deposit Modal */}
            {
                depositModalOpen && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Required Deposit</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Approving this application will prompt the user to pay a deposit before the adoption is finalized.
                            </p>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount ($)</label>
                                <input
                                    type="number"
                                    min="0" step="10"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                                    className="w-full text-2xl font-bold px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDepositModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmApproval}
                                    className="flex-1 px-4 py-2 bg-[var(--color-primary)] text-white font-medium rounded-xl hover:bg-[var(--color-primary-hover)] shadow-md transition"
                                >
                                    Confirm Approval
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
