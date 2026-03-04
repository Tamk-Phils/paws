'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, CreditCard, ShieldCheck, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DepositCheckout({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [request, setRequest] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock Payment State
    const [paymentMethod, setPaymentMethod] = useState('card');

    useEffect(() => {
        if (id) {
            fetchRequestDetails();
        }
    }, [id]);

    const fetchRequestDetails = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            router.push('/login');
            return;
        }

        const { data, error } = await supabase
            .from('adoption_requests')
            .select('*, puppies(name, breed, adoption_fee)')
            .eq('id', id)
            .single();

        if (error || !data) {
            alert('Could not load application details.');
            router.push('/profile');
            return;
        }

        if (data.status !== 'approved' || data.deposit_paid) {
            router.push('/profile');
            return;
        }

        setRequest(data);
        setLoading(false);
    };

    const handlePayment = async () => {
        setProcessing(true);

        // Mock payment delay
        setTimeout(async () => {
            // Update database
            const { error } = await supabase
                .from('adoption_requests')
                .update({ deposit_paid: true })
                .eq('id', id);

            if (error) {
                alert('An error occurred updating your application status.');
                setProcessing(false);
                return;
            }

            setSuccess(true);
            setProcessing(false);
        }, 1500);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Deposit Successful!</h2>
                    <p className="text-gray-500 mb-6">Your payment of ${request.deposit_amount} has been received. Your deposit is secured for {request.puppies?.name}.</p>
                    <Link href="/profile" className="inline-block w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 rounded-xl transition">
                        Return to Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10 px-4">
            <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-8">

                {/* Checkout Form */}
                <div className="flex-1 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-[var(--color-primary)]" /> Secure Checkout
                    </h1>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">Payment Method</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {['card', 'apple_pay', 'zelle', 'chime'].map((method) => (
                                    <button
                                        key={method}
                                        onClick={() => setPaymentMethod(method)}
                                        className={`border py-3 px-2 rounded-xl flex items-center justify-center text-sm font-medium transition-all ${paymentMethod === method ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/5 text-[var(--color-primary)] ring-1 ring-[var(--color-primary)]' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}
                                    >
                                        {method === 'card' && 'Credit Card'}
                                        {method === 'apple_pay' && 'Apple Pay'}
                                        {method === 'zelle' && 'Zelle'}
                                        {method === 'chime' && 'Chime'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {paymentMethod === 'card' && (
                            <div className="space-y-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-black" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                                        <input type="text" placeholder="MM/YY" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-black" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                                        <input type="text" placeholder="123" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-black" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                                    <input type="text" placeholder="John Doe" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-black" />
                                </div>
                            </div>
                        )}

                        {(paymentMethod === 'zelle' || paymentMethod === 'chime') && (
                            <div className="pt-2 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                                <p className="text-gray-600 text-sm">Please send exactly <strong className="text-gray-900">${request.deposit_amount}</strong> to our {paymentMethod === 'zelle' ? 'Zelle' : 'Chime'} account: <br /><br />
                                    <span className="font-mono bg-white px-2 py-1 rounded border">payments@pawsomebreed.com</span><br /><br />
                                    Click "Confirm Payment" below after sending the funds.</p>
                            </div>
                        )}

                        <button
                            onClick={handlePayment}
                            disabled={processing}
                            className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-4 rounded-xl shadow-md transition-colors disabled:opacity-70 flex justify-center items-center"
                        >
                            {processing ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                `Pay $${request.deposit_amount} Deposit`
                            )}
                        </button>

                        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs mt-4">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Payments are secure and encrypted.</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="md:w-80 shrink-0">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-8">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-3">Deposit Summary</h2>

                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-gray-500">Puppy</span>
                            <span className="font-medium">{request.puppies?.name} ({request.puppies?.breed})</span>
                        </div>

                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="text-gray-500">Total Adoption Fee</span>
                            <span className="font-medium">${request.puppies?.adoption_fee}</span>
                        </div>

                        <div className="border-t border-gray-100 py-4 my-2">
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-gray-900">Required Deposit</span>
                                <span className="text-2xl font-bold text-[var(--color-primary)]">${request.deposit_amount}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                This **refundable** deposit secures your adoption and is deducted from the total adoption fee. The remaining balance (${Number(request.puppies?.adoption_fee) - Number(request.deposit_amount)}) will be due upon pickup.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
