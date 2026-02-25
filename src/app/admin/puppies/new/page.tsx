'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminSupabase } from '@/lib/supabaseClient';
import { ArrowLeft, Loader2, ImagePlus, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function AddPuppy() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        gender: '',
        color: '',
        size: '',
        adoption_fee: '',
        deposit_amount: '150',
        city: '',
        state: '',
        description: '',
        health_verified: false,
        vaccinations_up_to_date: false,
        microchipped: false,
        lister_name: '',
    });

    const [imageFiles, setImageFiles] = useState<File[]>([]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as any;
        const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Use adminSupabase to check authorization and perform operations
            const { data: { session }, error: authError } = await adminSupabase.auth.getSession();

            if (authError || !session?.user) {
                throw new Error('You must be signed in as an admin to add a puppy.');
            }

            const newPuppy = {
                ...formData,
                lister_id: session.user.id,
                status: 'available'
            };

            const { data: puppyData, error: insertError } = await adminSupabase
                .from('puppies')
                .insert([newPuppy])
                .select()
                .single();

            if (insertError) {
                console.error('Insert Error:', insertError);
                throw new Error(`Database Error: ${insertError.message}`);
            }

            // Upload Images to Storage and insert into table
            if (imageFiles.length > 0) {
                const imagePayloads = [];
                for (let i = 0; i < imageFiles.length; i++) {
                    const file = imageFiles[i];
                    const fileName = `${puppyData.id}/${Date.now()}_${file.name}`;

                    const { error: uploadError } = await adminSupabase.storage
                        .from('puppy_images')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error('Error uploading image:', uploadError);
                        continue;
                    }

                    const { data: publicUrlData } = adminSupabase.storage
                        .from('puppy_images')
                        .getPublicUrl(fileName);

                    imagePayloads.push({
                        puppy_id: puppyData.id,
                        image_url: publicUrlData.publicUrl,
                        is_primary: i === 0
                    });
                }

                if (imagePayloads.length > 0) {
                    const { error: imageInsertError } = await adminSupabase
                        .from('puppy_images')
                        .insert(imagePayloads);

                    if (imageInsertError) {
                        console.error('Error inserting image URLs:', imageInsertError);
                    }
                }
            }

            router.push('/admin/puppies');
        } catch (err: any) {
            console.error('Detailed Error adding puppy:', err);
            setError(err.message || 'Failed to add puppy.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/puppies" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Add New Puppy</h1>
                    <p className="text-gray-500 mt-1">List a new dog for adoption.</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Info */}
                        <div className="space-y-4 md:col-span-2">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                            <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Buddy" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Breed *</label>
                            <input required type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Boxer" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Lister Name (Admin Label) *</label>
                            <input required type="text" name="lister_name" value={formData.lister_name} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Happy Paws" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Age (in months) *</label>
                            <input required type="number" name="age" value={formData.age} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. 3" min="1" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gender *</label>
                            <select required name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black">
                                <option value="" disabled>Select gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                            <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Brindle or Fawn" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Size</label>
                            <select name="size" value={formData.size} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black">
                                <option value="" disabled>Select expected size</option>
                                <option value="Small">Small</option>
                                <option value="Medium">Medium</option>
                                <option value="Large">Large</option>
                                <option value="Extra Large">Extra Large</option>
                            </select>
                        </div>

                        {/* Location Details */}
                        <div className="space-y-4 md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Location & Pricing</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                            <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Austin" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                            <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. TX" />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adoption Fee (USD) *</label>
                            <input required type="number" name="adoption_fee" value={formData.adoption_fee} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. 500" min="0" />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Initial Deposit (USD) *</label>
                            <input required type="number" name="deposit_amount" value={formData.deposit_amount} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. 150" min="0" />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Health & Description</h3>
                        </div>

                        <div className="md:col-span-2 flex flex-col gap-3 mb-2">
                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="health_verified" checked={formData.health_verified} onChange={handleChange} className="w-5 h-5 text-[var(--color-primary)]" />
                                <span className="text-gray-700 font-medium">Health Verified by Veterinarian</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="vaccinations_up_to_date" checked={formData.vaccinations_up_to_date} onChange={handleChange} className="w-5 h-5 text-[var(--color-primary)]" />
                                <span className="text-gray-700 font-medium">Vaccinations Up To Date</span>
                            </label>
                            <label className="flex items-center gap-3">
                                <input type="checkbox" name="microchipped" checked={formData.microchipped} onChange={handleChange} className="w-5 h-5 text-[var(--color-primary)]" />
                                <span className="text-gray-700 font-medium">Microchipped</span>
                            </label>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows={5} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] resize-y text-black" placeholder="Tell us about the puppy's personality, background, and ideal home..."></textarea>
                        </div>

                        {/* Images */}
                        <div className="md:col-span-2 mt-4">
                            <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Images</h3>
                        </div>

                        <div className="md:col-span-2 space-y-3">
                            <label className="block text-sm font-medium text-gray-700">Upload Puppy Photos</label>

                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <ImagePlus className="w-8 h-8 mb-3 text-gray-400" />
                                        <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                        <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
                                    </div>
                                    <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                                </label>
                            </div>

                            {imageFiles.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {imageFiles.map((file, index) => (
                                        <div key={index} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`Upload preview ${index + 1}`}
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 hover:bg-red-600"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-4 border-t pt-6">
                        <Link href="/admin/puppies" className="px-6 py-2.5 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-colors">
                            Cancel
                        </Link>
                        <button type="submit" disabled={loading} className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white px-8 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Add Puppy Listing'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
