import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft } from 'lucide-react';

const CreateClubPage: React.FC = () => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [sport, setSport] = useState('');
    const [tagline, setTagline] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleLogoClick = () => fileInputRef.current?.click();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app, you'd upload this to Supabase Storage and get a URL.
            // For this prototype, we'll use a data URL as a placeholder.
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !sport || !tagline || !description || !logo) {
            alert("Please fill all fields and upload a logo.");
            return;
        }
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            alert("You must be logged in to create a club.");
            setLoading(false);
            return;
        }

        const { error } = await supabase.from('clubs').insert([{ 
            name, sport, tagline, description, logo, creator_id: user.id 
        }]);

        if (error) {
            alert(error.message);
        } else {
            alert("Club created successfully!");
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Set Up Your New Club</h2>
                <button onClick={() => navigate('/dashboard')} className="text-gray-500 hover:text-gray-800"><ArrowLeft size={24}/></button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Fill out the details below to get your club's page up and running.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Club Logo</label>
                    <div onClick={handleLogoClick} className="cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {logo ? <img src={logo} alt="Logo Preview" className="mx-auto h-24 w-24 rounded-lg object-cover"/> : <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            <p className="text-sm text-blue-500 hover:underline">Click to upload an image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                </div>
                <div><label className="block font-medium mb-1">Club Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Sport</label><input type="text" value={sport} onChange={e=>setSport(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Tagline</label><input type="text" value={tagline} onChange={e=>setTagline(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} required rows={3} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea></div>
                <button type="submit" disabled={loading} className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold disabled:bg-green-300">
                    {loading ? 'Creating...' : 'Create Club Page'}
                </button>
            </form>
        </div>
    );
};

export default CreateClubPage;
