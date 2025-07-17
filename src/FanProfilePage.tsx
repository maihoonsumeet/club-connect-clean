import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Profile } from '../App';
import { User } from '@supabase/supabase-js';
import { Camera } from 'lucide-react';

interface FanProfilePageProps {
    user: Profile & User;
}

const FanProfilePage: React.FC<FanProfilePageProps> = ({ user }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.full_name);
    const [bio, setBio] = useState(user.bio || '');
    const [avatar, setAvatar] = useState(user.avatar_url);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ full_name: name, bio: bio, avatar_url: avatar })
            .eq('id', user.id);

        if (error) {
            alert(error.message);
        } else {
            alert("Profile updated successfully!");
            setIsEditing(false);
            // You might want to refresh the user state in App.tsx here
        }
        setLoading(false);
    };
    
    const handleAvatarChange = () => {
        // In a real app, this would use Supabase Storage to upload a file.
        // For this prototype, we'll just cycle a placeholder.
        const newAvatar = `https://placehold.co/150x150/60A5FA/FFFFFF?text=${name.charAt(0)}`;
        setAvatar(newAvatar);
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Your Profile</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
                    {isEditing ? 'Cancel' : 'Edit Profile'}
                </button>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <img src={avatar} alt="Profile" className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"/>
                    {isEditing && (
                        <button onClick={handleAvatarChange} className="absolute bottom-1 right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600">
                            <Camera size={18}/>
                        </button>
                    )}
                </div>
                {!isEditing ? (
                    <>
                        <h1 className="text-3xl font-bold">{name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">{bio || "You haven't written a bio yet."}</p>
                    </>
                ) : (
                    <div className="w-full space-y-4 pt-4">
                        <div><label className="block font-medium mb-1">Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block font-medium mb-1">Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows={3} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea></div>
                        <button onClick={handleSave} disabled={loading} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 disabled:bg-green-300">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FanProfilePage;
