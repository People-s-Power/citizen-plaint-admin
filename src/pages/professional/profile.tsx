import React, { useState, useRef, Fragment, useEffect } from 'react';
import axios from 'axios';
import { useAtom } from 'jotai';
import { adminAtom } from '@/atoms/adminAtom';
import { SERVER_URL } from '@/pages/_app';
import HeaderComp from '@/components/HeaderComp';
import { useRouter } from 'next/router';

const Profile = () => {
    const [admin, setAdmin] = useAtom(adminAtom);
    const router = useRouter();
    const [image, setImage] = useState(admin?.image || '');
    const [shortDescription, setShortDescription] = useState('');
    const [achievements, setAchievements] = useState(['']);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/user/profile');
                if (data) {
                    setImage(data.data.user.image || '');
                    setShortDescription(data.data.user.shortDescription || data.data.user.description || '');
                    setAchievements(Array.isArray(data.data.user.achievements) && data.data.user.achievements.length > 0 ? data.data.user.achievements : ['']);
                    setAdmin((prev: any) => ({ ...prev, ...data }));
                }
            } catch (e) {
                // Optionally handle error
            }
        };
        fetchProfile();
        // eslint-disable-next-line
    }, []);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const payload = {
                image,
                shortDescription,
                achievements,
            };
            await axios.put('/user/profile', payload);
            setAdmin((prev: any) => ({ ...prev, ...payload }));
            alert('Profile updated successfully!');
        } catch (e) {
            alert('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Fragment>
            <title>PROJECT | Professionals</title>
            <main>
                <HeaderComp />
                <div className="max-w-xl mx-auto p-6 bg-white rounded shadow mt-8">
                    <button
                        type="button"
                        className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => {
                            if (typeof window !== 'undefined' && window.history.length > 1) {
                                router.back();
                                return;
                            }
                            router.push('/');
                        }}
                    >
                        ← Back
                    </button>

                    <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>
                    <div className="mb-6 flex flex-col items-center">
                        <img
                            src={image || '/images/assistant.png'}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-2 border-warning mb-2"
                        />
                        <button
                            className="px-4 py-1 bg-warning text-white rounded text-sm mt-2"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Change Image
                        </button>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">Short Description</label>
                        <textarea
                            className="w-full border rounded p-2"
                            rows={3}
                            value={shortDescription}
                            onChange={e => setShortDescription(e.target.value)}
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-1">Achievements</label>
                        {achievements.map((ach, idx) => (
                            <div key={idx} className="flex items-center mb-2">
                                <input
                                    className="w-full border rounded p-2"
                                    value={ach}
                                    onChange={e => setAchievements(achievements.map((a, i) => i === idx ? e.target.value : a))}
                                    placeholder="Achievement..."
                                />
                                <button
                                    type="button"
                                    className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-600 rounded hover:bg-red-200"
                                    onClick={() => setAchievements(achievements.filter((_, i) => i !== idx))}
                                >
                                    Remove
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                            onClick={() => setAchievements([...achievements, ''])}
                        >
                            + Add Achievement
                        </button>
                    </div>
                    <button
                        className="w-full py-2 bg-warning text-white rounded font-semibold hover:bg-yellow-600 transition-colors"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </main>
        </Fragment>
    );
};

export default Profile;