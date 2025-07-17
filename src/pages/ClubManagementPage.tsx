import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Club, Profile } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import { Newspaper, Users, Shirt, DollarSign, Settings } from 'lucide-react';
// You would create these management components in the components folder
// For now, we'll use placeholders.
// import PostsManager from '../components/PostsManager';
// import PlayerRoster from '../components/PlayerRoster';
// import ClubSettings from '../components/ClubSettings';

const ClubManagementPage: React.FC = () => {
    const { clubId } = useParams();
    const [club, setClub] = useState<Club | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        const fetchClubData = async () => {
            if (!clubId) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from('clubs')
                .select('*, players(*), posts(*)')
                .eq('id', clubId)
                .single();
            
            if (error) console.error('Error fetching club data:', error);
            else setClub(data);
            
            setIsLoading(false);
        };
        fetchClubData();
    }, [clubId]);

    if (isLoading) return <LoadingSpinner />;
    if (!club) return <div className="text-center">Club not found.</div>;

    const tabs = [
        { id: 'posts', label: 'Posts', icon: Newspaper },
        { id: 'team', label: 'Team', icon: Users },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="space-y-8">
            <header className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <img src={club.logo} alt={club.name} className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                    <div>
                        <h1 className="text-4xl font-extrabold">{club.name}</h1>
                        <p className="text-xl text-gray-500 mt-1">Club Management</p>
                    </div>
                </div>
            </header>
            <div>
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto">
                        {tabs.map(tab => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${ activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}>
                                <tab.icon size={16} /><span>{tab.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                <div className="mt-8">
                    {/* Placeholder content for tabs */}
                    {activeTab === 'posts' && <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">Posts Management Coming Soon</div>}
                    {activeTab === 'team' && <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">Team Roster Management Coming Soon</div>}
                    {activeTab === 'settings' && <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow">Club Settings Coming Soon</div>}
                </div>
            </div>
        </div>
    );
};

export default ClubManagementPage;
