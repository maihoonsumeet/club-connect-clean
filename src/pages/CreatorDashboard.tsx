import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Club, Profile } from '../App';
import { User } from '@supabase/supabase-js';

interface CreatorDashboardProps {
    currentUser: Profile & User;
    clubs: Club[];
}

const CreatorDashboard: React.FC<CreatorDashboardProps> = ({ currentUser, clubs }) => {
    const navigate = useNavigate();
    const managedClubs = clubs.filter(club => club.creator_id === currentUser.id);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Your Clubs</h2>
                <div className="space-y-4">
                    {managedClubs.length > 0 ? (
                        managedClubs.map(club => (
                            <div key={club.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                                <div className="flex items-center space-x-4">
                                    <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" />
                                    <div>
                                        <p className="font-bold text-lg">{club.name}</p>
                                        <p className="text-sm text-gray-500">{club.players?.length || 0} Players · {club.merch?.length || 0} Merch</p>
                                    </div>
                                </div>
                                <button onClick={() => navigate(`/manage/club/${club.id}`)} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 shadow">
                                    Manage
                                </button>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 py-4">You haven't created any clubs yet.</p>
                    )}
                </div>
                <button onClick={() => navigate('/create-club')} className="mt-6 w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 shadow">
                    <Plus size={20} />
                    <span>Create a New Club</span>
                </button>
            </div>
        </div>
    );
};

export default CreatorDashboard;
