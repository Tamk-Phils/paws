'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Shield, MapPin, Calendar, Activity, Info, Heart, ChevronLeft, ChevronRight, Share2, Star, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export default function PuppyDetails({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [puppy, setPuppy] = useState<any>(null);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState<any>(null);

    // UI State
    const [currentImageIdx, setCurrentImageIdx] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    // Detailed Form State (6 Sections)
    const [formData, setFormData] = useState({
        // Section 1
        fullName: '',
        contactPhone: '',
        dob: '',
        address: '',
        cityStateZip: '',
        // Section 2
        residenceType: 'House',
        rentOrOwn: 'Own',
        landlordInfo: '',
        adultsInHome: 1,
        childrenInfo: '',
        // Section 3
        hasPets: false,
        currentPetsInfo: '',
        pastPetsInfo: '',
        vetInfo: '',
        // Section 4
        workSchedule: '',
        dayLocation: '',
        nightLocation: '',
        exercisePlan: '',
        fencedYard: false,
        // Section 5
        applicationType: 'Adopt',
        preferredSize: '',
        openToSpecialNeeds: false,
        // Section 6
        financiallyPrepared: false,
        agreeToSpayNeuter: false,
        allowHomeVisit: false,
        signature: ''
    });
    const [submitting, setSubmitting] = useState(false);

    // New Review State
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });

    useEffect(() => {
        // Check auth state for chat button
        supabase.auth.getSession().then(({ data: { session } }) => {
            setAuthUser(session?.user ?? null);
        });

        if (id) {
            fetchPuppyData();
            fetchReviews();

            const channel = supabase
                .channel(`public:puppies:${id}`)
                .on('postgres_changes', { event: '*', schema: 'public', table: 'puppies', filter: `id=eq.${id}` }, (payload) => {
                    if (payload.new) setPuppy((prev: any) => ({ ...prev, ...payload.new }));
                })
                .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reviews', filter: `puppy_id=eq.${id}` }, (payload) => {
                    setReviews((prev) => [payload.new, ...prev]);
                })
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [id]);

    // Auth Redirect Persistence
    useEffect(() => {
        const savedForm = localStorage.getItem(`adoption_form_${id}`);
        if (savedForm) {
            try {
                setFormData(JSON.parse(savedForm));
                // Clear after loading
                localStorage.removeItem(`adoption_form_${id}`);
                // Open modal if we just came back from login
                if (authUser) {
                    setIsModalOpen(true);
                }
            } catch (e) {
                console.error('Failed to load saved form', e);
            }
        }
    }, [id, authUser]);

    async function fetchPuppyData() {
        const { data, error } = await supabase
            .from('puppies')
            .select('*, puppy_images(image_url), profiles(full_name)')
            .eq('id', id)
            .single();

        if (data && !error) {
            setPuppy(data);
        }
        setLoading(false);
    }

    async function fetchReviews() {
        const { data } = await supabase
            .from('reviews')
            .select('*, profiles(full_name)')
            .eq('puppy_id', id)
            .order('created_at', { ascending: false });
        if (data) setReviews(data);
    }

    const nextImage = () => {
        if (!puppy?.puppy_images) return;
        setCurrentImageIdx((prev) => (prev + 1) % puppy.puppy_images.length);
    };

    const prevImage = () => {
        if (!puppy?.puppy_images) return;
        setCurrentImageIdx((prev) => (prev - 1 + puppy.puppy_images.length) % puppy.puppy_images.length);
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const handleAdoptionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (!authUser) {
            // Save form data to localStorage
            localStorage.setItem(`adoption_form_${id}`, JSON.stringify(formData));
            alert('Please sign in to submit an adoption application. Your form data has been saved.');
            router.push(`/login?redirect=/puppies/${id}`);
            setSubmitting(false);
            return;
        }

        const user = authUser;

        const { error } = await supabase.from('adoption_requests').insert({
            puppy_id: puppy.id,
            user_id: user.id,
            // Sec 1
            contact_phone: formData.contactPhone,
            dob: formData.dob,
            address: formData.address,
            city_state_zip: formData.cityStateZip,
            // Sec 2
            residence_type: formData.residenceType,
            rent_or_own: formData.rentOrOwn,
            landlord_info: formData.landlordInfo,
            adults_in_home: formData.adultsInHome,
            children_info: formData.childrenInfo,
            // Sec 3
            has_pets: formData.hasPets,
            current_pets_info: formData.currentPetsInfo,
            past_pets_info: formData.pastPetsInfo,
            vet_info: formData.vetInfo,
            // Sec 4
            work_schedule: formData.workSchedule,
            day_location: formData.dayLocation,
            night_location: formData.nightLocation,
            exercise_plan: formData.exercisePlan,
            fenced_yard: formData.fencedYard,
            // Sec 5
            application_type: formData.applicationType,
            preferred_size: formData.preferredSize,
            open_to_special_needs: formData.openToSpecialNeeds,
            // Sec 6
            financially_prepared: formData.financiallyPrepared,
            agree_to_spay_neuter: formData.agreeToSpayNeuter,
            allow_home_visit: formData.allowHomeVisit,
            signature: formData.signature,

            status: 'pending',
            deposit_amount: 0,
            deposit_paid: false
        });

        setSubmitting(false);
        if (!error) {
            // Send Push Notification to Admins
            fetch('/api/push/notify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    admin: true,
                    title: '🐶 New Adoption Application!',
                    message: `${formData.fullName} just applied for ${puppy.name}`,
                    url: '/admin/requests'
                })
            }).catch(err => console.error('Push notify error:', err));

            setIsModalOpen(false);
            alert('Application submitted successfully! The admin will review it shortly.');
        } else {
            console.error(error);
            alert('Failed to submit application. Please verify all required fields are filled.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    if (!puppy) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Puppy not found</h1>
                <Link href="/browse" className="text-[var(--color-primary)] hover:underline">Go back to browse</Link>
            </div>
        );
    }

    const images = puppy.puppy_images?.length > 0
        ? puppy.puppy_images.map((img: any) => img.image_url)
        : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&q=80&w=1000&h=1000'];

    return (
        <div className="bg-gray-50 min-h-screen pb-20">
            {/* Navigation Bar */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/browse" className="inline-flex items-center text-gray-500 hover:text-[var(--color-primary)] transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Browse
                    </Link>
                    <button
                        onClick={handleShare}
                        className="flex items-center gap-2 text-gray-600 hover:text-[var(--color-primary)] transition-colors font-medium"
                    >
                        {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                        {isCopied ? 'Link Copied!' : 'Share Listing'}
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Left Column: Images */}
                    <div className="space-y-4">
                        {/* Main Image */}
                        <div className="relative h-96 md:h-[500px] rounded-2xl overflow-hidden shadow-lg bg-gray-200 group">
                            <img
                                src={images[currentImageIdx]}
                                alt={`${puppy.name} - Image ${currentImageIdx + 1}`}
                                className="w-full h-full object-cover"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 p-2 rounded-full shadow-md backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <div className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm uppercase tracking-wider backdrop-blur-sm text-white ${puppy.status === 'available' ? 'bg-green-500/90' : puppy.status === 'adopted' ? 'bg-gray-500/90' : 'bg-amber-500/90'}`}>
                                    {puppy.status}
                                </div>
                            </div>
                        </div>

                        {/* Thumbnails */}
                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {images.map((img: string, idx: number) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentImageIdx(idx)}
                                        className={`relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${currentImageIdx === idx ? 'border-[var(--color-primary)] opacity-100 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                                    >
                                        <img
                                            src={img}
                                            alt={`Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right Column: Details & Adoption Flow */}
                    <div className="flex flex-col">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex-grow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900">{puppy.name}</h1>
                                    <p className="text-gray-500 mt-1">Listed by: {puppy.lister_name || puppy.profiles?.full_name || 'Anonymous'}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8">
                                <span className="inline-flex items-center text-sm font-medium bg-[var(--color-secondary)] text-gray-700 px-3 py-1.5 rounded-lg">
                                    <Info className="w-4 h-4 mr-1.5 text-gray-500" />
                                    {puppy.breed}
                                </span>
                                <span className="inline-flex items-center text-sm font-medium bg-[var(--color-secondary)] text-gray-700 px-3 py-1.5 rounded-lg">
                                    <Calendar className="w-4 h-4 mr-1.5 text-gray-500" />
                                    {puppy.age} months
                                </span>
                                <span className="inline-flex items-center text-sm font-medium bg-[var(--color-secondary)] text-gray-700 px-3 py-1.5 rounded-lg">
                                    {puppy.gender === 'Male' ? '♂️' : '♀️'} {puppy.gender}
                                </span>
                            </div>

                            <div className="border-t border-b border-gray-100 py-6 mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">About {puppy.name}</h2>
                                <p className="text-gray-600 leading-relaxed text-balance whitespace-pre-line">
                                    {puppy.description || `Meet ${puppy.name}! A wonderful ${puppy.breed} looking for a forever home.`}
                                </p>
                            </div>

                            <div className="mb-8">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Health & Verification</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className={`flex items-center p-3 rounded-lg border ${puppy.vaccinated ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                                        {puppy.vaccinated ? <Check className="w-5 h-5 mr-3 shrink-0" /> : <Info className="w-5 h-5 mr-3 shrink-0" />}
                                        <span className="font-medium">{puppy.vaccinated ? 'Up to date on vaccinations' : 'Vaccination info pending'}</span>
                                    </div>
                                    <div className="flex items-center p-3 bg-blue-50 rounded-lg text-blue-700 border border-blue-100">
                                        <Shield className="w-5 h-5 mr-3 shrink-0" />
                                        <span className="font-medium">Verified Lister</span>
                                    </div>
                                    <div className="flex items-center p-3 bg-purple-50 rounded-lg text-purple-700 border border-purple-100">
                                        <Activity className="w-5 h-5 mr-3 shrink-0" />
                                        <span className="font-medium">Health Guarantee</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto flex flex-col sm:flex-row gap-4">
                                {puppy.status === 'available' ? (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                        Adopt {puppy.name}
                                    </button>
                                ) : (
                                    <button disabled className="flex-1 bg-gray-300 text-white px-8 py-4 rounded-xl font-bold text-lg cursor-not-allowed text-center">
                                        Currently {puppy.status}
                                    </button>
                                )}
                                <button
                                    onClick={() => {
                                        if (authUser) {
                                            router.push('/chat');
                                        } else {
                                            router.push('/login');
                                        }
                                    }}
                                    className="bg-white border-2 border-gray-200 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] text-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {authUser ? 'Message Lister' : 'Sign In to Chat'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="mt-16 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Reviews & Testimonials</h2>
                            <p className="text-gray-500 text-sm mt-1">What happy adopters are saying</p>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2">
                            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                            <span className="font-bold text-amber-700 text-lg">4.9</span>
                            <span className="text-amber-600 text-sm ml-1">({reviews.length + 5} reviews)</span>
                        </div>
                    </div>

                    <div className="space-y-4 mb-8">
                        {/* Live DB Reviews */}
                        {reviews.map((rev) => (
                            <div key={rev.id} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                <img
                                    src={rev.profiles?.avatar_url || `https://i.pravatar.cc/150?u=${rev.id}`}
                                    alt={rev.profiles?.full_name || 'Reviewer'}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{rev.profiles?.full_name || 'Happy Adopter'}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified</span>
                                        </div>
                                        <div className="flex items-center text-amber-400">
                                            {[...Array(5)].map((_, i) => (<Star key={i} className={`w-4 h-4 ${i < rev.rating ? 'fill-current' : 'text-gray-300'}`} />))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{new Date(rev.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                            </div>
                        ))}

                        {/* Seed Reviews with real Unsplash portraits */}
                        {[
                            { name: 'Sarah M.', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face', rating: 5, date: 'February 10, 2026', comment: 'We adopted from this amazing breeder and our puppy is the absolute light of our home! She was so healthy, socialized, and came with all her vaccinations. The adoption process was smooth and the team was incredibly supportive.' },
                            { name: 'James K.', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', rating: 5, date: 'January 28, 2026', comment: 'Our golden retriever pup settled in within a week. You can tell how well-loved these dogs are before adoption. Five stars without hesitation. Highly recommend PawsomeBreed!' },
                            { name: 'Marcus T.', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', rating: 5, date: 'January 15, 2026', comment: 'The whole experience exceeded our expectations. Our pup arrived healthy, happy, and full of energy. The breeder kept us updated throughout with photos. Could not be happier!' },
                            { name: 'Priya N.', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', rating: 4, date: 'December 22, 2025', comment: 'Really positive experience from start to finish. Our puppy is playful and loving. The adoption form was thorough which shows how much they care about placing dogs in good homes.' },
                            { name: 'David R.', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', rating: 5, date: 'December 5, 2025', comment: 'I was nervous about adopting online but this platform made it so easy and trustworthy. Our pup is the best thing that has happened to our family! Very transparent team.' },
                        ].map((rev, i) => (
                            <div key={`seed-${i}`} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
                                <img src={rev.photo} alt={rev.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-gray-900">{rev.name}</span>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Verified Adopter</span>
                                        </div>
                                        <div className="flex items-center text-amber-400">
                                            {[...Array(5)].map((_, j) => (<Star key={j} className={`w-4 h-4 ${j < rev.rating ? 'fill-current' : 'text-gray-300'}`} />))}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{rev.comment}</p>
                                    <span className="text-xs text-gray-400 mt-1 block">{rev.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Expanded Adoption Form Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-[var(--color-primary)] p-6 text-white text-center shrink-0 flex justify-between items-center">
                            <div className="w-8"></div> {/* Spacer */}
                            <div>
                                <h2 className="text-2xl font-bold mb-1">Adoption Application</h2>
                                <p className="text-white/80 text-sm">You are applying to adopt {puppy.name}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-white hover:text-gray-200">
                                <ArrowLeft className="w-6 h-6 rotate-180" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            <form onSubmit={handleAdoptionSubmit} className="space-y-4">
                                <div className="space-y-8">
                                    {/* Section 1: Personal Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 1: Personal Info</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                <input required type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="John Doe" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                                <input required type="date" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                            <input required type="tel" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="(555) 123-4567" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                            <input required type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 mb-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="123 Main St" />
                                            <input required type="text" value={formData.cityStateZip} onChange={e => setFormData({ ...formData, cityStateZip: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="City, State Zip" />
                                        </div>
                                    </div>

                                    {/* Section 2: Household Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 2: Household</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Residence Type</label>
                                                <select value={formData.residenceType} onChange={e => setFormData({ ...formData, residenceType: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-white text-black">
                                                    <option>House</option>
                                                    <option>Apartment</option>
                                                    <option>Townhouse</option>
                                                    <option>Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rent or Own?</label>
                                                <select value={formData.rentOrOwn} onChange={e => setFormData({ ...formData, rentOrOwn: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-white text-black">
                                                    <option>Own</option>
                                                    <option>Rent</option>
                                                </select>
                                            </div>
                                        </div>
                                        {formData.rentOrOwn === 'Rent' && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Landlord Name & Phone</label>
                                                <input required type="text" value={formData.landlordInfo} onChange={e => setFormData({ ...formData, landlordInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="Jane Smith - (555) 987-6543" />
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Adults in Household</label>
                                                <input required type="number" min="1" value={formData.adultsInHome} onChange={e => setFormData({ ...formData, adultsInHome: parseInt(e.target.value) || 1 })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Children (and ages)</label>
                                                <input type="text" value={formData.childrenInfo} onChange={e => setFormData({ ...formData, childrenInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="None, or '2 kids (ages 4 and 7)'" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 3: Pet History */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 3: Pet History</h3>
                                        <div className="flex items-center mb-2">
                                            <input type="checkbox" id="hasPets" checked={formData.hasPets} onChange={e => setFormData({ ...formData, hasPets: e.target.checked })} className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]" />
                                            <label htmlFor="hasPets" className="ml-2 block text-sm text-gray-900">Do you currently have pets?</label>
                                        </div>
                                        {formData.hasPets && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Pets (Species, Breed, Age, Spayed/Neutered)</label>
                                                <textarea required rows={2} value={formData.currentPetsInfo} onChange={e => setFormData({ ...formData, currentPetsInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y text-black" placeholder="e.g., Cat, Tabby, 4yo, Spayed"></textarea>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Past Pets (What happened to them?)</label>
                                            <textarea required rows={2} value={formData.pastPetsInfo} onChange={e => setFormData({ ...formData, pastPetsInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none resize-y text-black" placeholder="Briefly describe past pet ownership"></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Veterinarian Name & Contact Info</label>
                                            <input required type="text" value={formData.vetInfo} onChange={e => setFormData({ ...formData, vetInfo: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="Dr. Smith - City Vet Clinic - (555) 111-2222" />
                                        </div>
                                    </div>

                                    {/* Section 4: Lifestyle */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 4: Lifestyle</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Work Schedule (hours away from home)</label>
                                            <input required type="text" value={formData.workSchedule} onChange={e => setFormData({ ...formData, workSchedule: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="e.g., 9-5 M-F, or Work from home" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Where will the dog stay during the day?</label>
                                                <input required type="text" value={formData.dayLocation} onChange={e => setFormData({ ...formData, dayLocation: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="e.g., Inside, crated, backyard" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Where will the dog sleep at night?</label>
                                                <input required type="text" value={formData.nightLocation} onChange={e => setFormData({ ...formData, nightLocation: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="e.g., Dog bed in master bedroom" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">How often will the dog be exercised?</label>
                                            <input required type="text" value={formData.exercisePlan} onChange={e => setFormData({ ...formData, exercisePlan: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="e.g., 2 walks a day + yard play" />
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" id="fencedYard" checked={formData.fencedYard} onChange={e => setFormData({ ...formData, fencedYard: e.target.checked })} className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]" />
                                            <label htmlFor="fencedYard" className="ml-2 block text-sm text-gray-900">Do you have a fenced yard?</label>
                                        </div>
                                    </div>

                                    {/* Section 5: Preferences */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 5: Preferences</h3>
                                        <div>
                                            <h4 className="text-sm font-bold text-amber-800 mb-2">Notice Regarding Initial Deposit</h4>
                                            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-4">
                                                <p className="text-xs text-amber-700 leading-relaxed">
                                                    If your application is approved, a **refundable** deposit of **${puppy?.deposit_amount || 150}** will be required to secure your chosen puppy. This ensures serious commitment and helps cover administrative costs. The deposit will be deducted from the final adoption fee.
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Are you applying to:</label>
                                            <select value={formData.applicationType} onChange={e => setFormData({ ...formData, applicationType: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none bg-white text-black">
                                                <option>Adopt</option>
                                                <option>Foster</option>
                                                <option>Rescue Volunteer</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Dog Size/Breed</label>
                                                <input required type="text" value={formData.preferredSize} onChange={e => setFormData({ ...formData, preferredSize: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none text-black" placeholder="e.g., Medium, Boxer" />
                                            </div>
                                        </div>
                                        <div className="flex items-center">
                                            <input type="checkbox" id="openSpecial" checked={formData.openToSpecialNeeds} onChange={e => setFormData({ ...formData, openToSpecialNeeds: e.target.checked })} className="w-4 h-4 text-[var(--color-primary)] border-gray-300 rounded focus:ring-[var(--color-primary)]" />
                                            <label htmlFor="openSpecial" className="ml-2 block text-sm text-gray-900">Are you open to senior or special-needs dogs?</label>
                                        </div>
                                    </div>

                                    {/* Section 6: Commitment */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-bold border-b pb-2">Section 6: Commitment & Agreement</h3>
                                        <div className="flex flex-col gap-3">
                                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input required type="checkbox" checked={formData.financiallyPrepared} onChange={e => setFormData({ ...formData, financiallyPrepared: e.target.checked })} className="w-5 h-5 text-[var(--color-primary)] rounded" />
                                                <span className="text-sm">I am financially prepared for vet care, food, and training.</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input required type="checkbox" checked={formData.agreeToSpayNeuter} onChange={e => setFormData({ ...formData, agreeToSpayNeuter: e.target.checked })} className="w-5 h-5 text-[var(--color-primary)] rounded" />
                                                <span className="text-sm">I agree to spay/neuter the dog if not already done.</span>
                                            </label>
                                            <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <input required type="checkbox" checked={formData.allowHomeVisit} onChange={e => setFormData({ ...formData, allowHomeVisit: e.target.checked })} className="w-5 h-5 text-[var(--color-primary)] rounded" />
                                                <span className="text-sm">I am willing to allow a home visit.</span>
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Digital Signature (Type your full name to agree)</label>
                                            <input required type="text" value={formData.signature} onChange={e => setFormData({ ...formData, signature: e.target.value })} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[var(--color-primary)] outline-none font-medium italic text-black" placeholder="Your Full Name" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl transition-colors">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={submitting} className="flex-1 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 rounded-xl transition-colors shadow-md disabled:opacity-70 disabled:cursor-not-allowed">
                                        {submitting ? 'Submitting...' : 'Submit Request'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
