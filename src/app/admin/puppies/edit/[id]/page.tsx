'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { ArrowLeft, Loader2, ImagePlus } from 'lucide-react';
import Link from 'next/link';

export default function EditPuppy() {
    const router = useRouter();
    const params = useParams();
    const puppyId = params?.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        breed: '',
        age: '',
        gender: '',
        color: '',
        size: '',
        adoption_fee: '',
        city: '',
        state: '',
        description: '',
        health_verified: false,
        vaccinations_up_to_date: false,
        microchipped: false,
    });

    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

    const removeExistingImage = (index: number) => {
        setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setNewImageFiles(prev => [...prev, ...files]);
        }
    };

    const removeNewFile = (index: number) => {
        setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    useEffect(() => {
        if (!puppyId) return;

        async function fetchPuppy() {
            const { data, error } = await supabase
                .from('puppies')
                .select('*, puppy_images(image_url)')
                .eq('id', puppyId)
                .single();

            if (data && !error) {
                setFormData({
                    name: data.name || '',
                    breed: data.breed || '',
                    age: data.age?.toString() || '',
                    gender: data.gender || '',
                    color: data.color || '',
                    size: data.size || '',
                    adoption_fee: data.adoption_fee?.toString() || '',
                    city: data.city || '',
                    state: data.state || '',
                    description: data.description || '',
                    health_verified: data.health_verified || false,
                    vaccinations_up_to_date: data.vaccinations_up_to_date || false,
                    microchipped: data.microchipped || false,
                });
                if (data.puppy_images && data.puppy_images.length > 0) {
                    setExistingImageUrls(data.puppy_images.map((img: any) => img.image_url));
                }
            } else {
                setError('Could not fetch puppy details.');
            }
            setFetching(false);
        }

        fetchPuppy();
    }, [puppyId]);

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
            const updatePayload = {
                ...formData,
            };

            const { error: updateError } = await supabase
                .from('puppies')
                .update(updatePayload)
                .eq('id', puppyId);

            if (updateError) throw updateError;

            // Handle Images
            await supabase.from('puppy_images').delete().eq('puppy_id', puppyId);

            let allUrls = [...existingImageUrls];

            // Upload New Images
            if (newImageFiles.length > 0) {
                for (let i = 0; i < newImageFiles.length; i++) {
                    const file = newImageFiles[i];
                    const fileName = `${puppyId}/${Date.now()}_${file.name}`;

                    const { error: uploadError } = await supabase.storage
                        .from('puppy_images')
                        .upload(fileName, file);

                    if (!uploadError) {
                        const { data: publicUrlData } = supabase.storage
                            .from('puppy_images')
                            .getPublicUrl(fileName);

                        allUrls.push(publicUrlData.publicUrl);
                    }
                }
            }

            const validUrls = allUrls.filter(url => url.trim() !== '');
            if (validUrls.length > 0) {
                const imagePayloads = validUrls.map((url, i) => ({
                    puppy_id: puppyId,
                    image_url: url.trim(),
                    is_primary: i === 0
                }));
                await supabase.from('puppy_images').insert(imagePayloads);
            }

            router.push('/admin/puppies');
        } catch (err: any) {
            console.error('Error updating puppy:', err);
            setError(err.message || 'Failed to update puppy.');
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/puppies" className="text-gray-500 hover:text-gray-900 transition-colors p-2 -ml-2 rounded-lg hover:bg-gray-100">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Edit Puppy Listing</h1>
                    <p className="text-gray-500 mt-1">Update information for {formData.name}</p>
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
                            <input required type="text" name="breed" value={formData.breed} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Rottweiler" />
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
                            <input type="text" name="color" value={formData.color} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. Black and Tan" />
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Adoption Fee (USD) *</label>
                            <input required type="number" name="adoption_fee" value={formData.adoption_fee} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] text-black" placeholder="e.g. 500" min="0" />
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

                            {(existingImageUrls.length > 0 || newImageFiles.length > 0) && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    {/* Existing Images */}
                                    {existingImageUrls.map((url, index) => (
                                        <div key={`existing-${index}`} className="relative group rounded-lg overflow-hidden border border-gray-200">
                                            <img
                                                src={url}
                                                alt={`Puppy image ${index + 1}`}
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 hover:bg-red-600"
                                                title="Remove this image"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}

                                    {/* New Uploading Images in Preview */}
                                    {newImageFiles.map((file, index) => (
                                        <div key={`new-${index}`} className="relative group rounded-lg overflow-hidden border border-[var(--color-primary)] opacity-80">
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10 z-10 pointer-events-none">
                                                <span className="text-xs font-bold text-[var(--color-primary)] bg-white/90 px-2 py-1 rounded">New</span>
                                            </div>
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`New upload preview ${index + 1}`}
                                                className="w-full h-24 object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeNewFile(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 hover:bg-red-600 z-20"
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
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
