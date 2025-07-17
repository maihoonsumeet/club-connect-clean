import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Club, Profile, Post, Comment } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import { Newspaper, Users, DollarSign, Shirt, Check, ArrowLeft } from 'lucide-react';

interface ClubPublicViewProps {
    currentUser: Profile;
}

const ClubPublicView: React.FC<ClubPublicViewProps> = ({ currentUser }) => {
    const { clubId } = useParams();
    const navigate = useNavigate();
    const [club, setClub] = useState<Club | null>(null);
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('posts');

    useEffect(() => {
        const fetchClubData = async () => {
            if (!clubId) return;
            setIsLoading(true);
            const { data, error } = await supabase
                .from('clubs')
                .select('*, players(*), posts(*, comments(*, profiles(*))), merch(*), funding(*)')
                .eq('id', clubId)
                .single();
            
            if (error) {
                console.error('Error fetching club data:', error);
            } else {
                setClub(data);
            }
            setIsLoading(false);
        };
        fetchClubData();
    }, [clubId]);

    if (isLoading) return <LoadingSpinner />;
    if (!club) return <div className="text-center">Club not found.</div>;

    const isFollowing = currentUser.followed_clubs?.includes(club.id);

    const handleToggleFollow = async () => {
        const updatedFollowedClubs = isFollowing
            ? currentUser.followed_clubs.filter(id => id !== club.id)
            : [...(currentUser.followed_clubs || []), club.id];
        
        const { error } = await supabase
            .from('profiles')
            .update({ followed_clubs: updatedFollowedClubs })
            .eq('id', currentUser.id);

        if (error) alert(error.message);
        else window.location.reload(); // Simple way to refresh state
    };

    const tabs = [{ id: 'posts', label: 'Posts', icon: Newspaper }, { id: 'team', label: 'Team', icon: Users }];

    return (
        <div className="space-y-8">
            <button onClick={() => navigate('/dashboard')} className="flex items-center space-x-2 text-blue-500 hover:underline">
                <ArrowLeft size={20} /><span>Back to Dashboard</span>
            </button>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
                <header className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                    <img src={club.logo} alt={club.name} className="w-32 h-32 rounded-2xl object-cover shadow-lg" />
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{club.name}</h1>
                        <p className="text-xl text-gray-500 mt-1">{club.description}</p>
                    </div>
                    <button onClick={handleToggleFollow} className={`mt-4 md:mt-0 md:ml-auto px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2 ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
                        {isFollowing ? <><Check size={20}/> Following</> : 'Follow Club'}
                    </button>
                </header>
            </div>
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
                    {activeTab === 'posts' && <div className="space-y-6">{(club.posts || []).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(post => <PostCard key={post.id} post={post} club={club} users={users} currentUser={currentUser}/>)}</div>}
                    {activeTab === 'team' && <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"><div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{(club.players || []).length > 0 ? club.players.map(player => (<div key={player.id} className="text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md"><img src={player.avatar_url} alt={player.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white dark:border-gray-600" /><p className="font-bold text-lg">{player.name}</p><p className="text-blue-500 font-semibold">{player.position}</p></div>)) : <p>No players on the roster.</p>}</div></div>}
                </div>
            </div>
        </div>
    );
};

export default ClubPublicView;
