import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Search } from 'lucide-react';
import { Club, Profile, Post, Comment } from '../App';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';

interface FanDashboardProps {
    currentUser: Profile;
}

const FanDashboard: React.FC<FanDashboardProps> = ({ currentUser }) => {
    const navigate = useNavigate();
    const [clubs, setClubs] = useState<Club[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const { data: clubsData, error: clubsError } = await supabase.from('clubs').select(`*, posts(*, comments(*))`);
            if (clubsError) console.error(clubsError);
            else setClubs(clubsData || []);

            const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
            if (usersError) console.error(usersError);
            else setUsers(usersData || []);
            
            setIsLoading(false);
        };
        fetchData();
    }, []);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    const followedClubsPosts = clubs.filter(club => currentUser.followed_clubs?.includes(club.id)).flatMap(club => (club.posts || []).map(post => ({ ...post, club }))).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const filteredClubs = clubs.filter(club => club.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <h1 className="text-3xl font-bold">Fan Dashboard</h1>
                 <div className="relative md:w-1/3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search for any club..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
            </div>
            {searchTerm ? (<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold mb-4">Search Results</h2><div className="space-y-4">{filteredClubs.length > 0 ? filteredClubs.map(club => (<div key={club.id} onClick={() => navigate(`/club/${club.id}`)} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{club.name}</p><p className="text-sm text-gray-500">{club.sport}</p></div></div>)) : <p>No clubs found.</p>}</div></div>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-6"><h2 className="text-2xl font-bold">Your Feed</h2>{followedClubsPosts.length > 0 ? (followedClubsPosts.map(post => <PostCard key={`${post.id}`} post={post} club={post.club} users={users} currentUser={currentUser}/>)) : (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold">Your feed is empty!</h2><p className="mt-2">Follow clubs to see their updates.</p></div>)}</div><aside className="lg:col-span-1 space-y-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold mb-4">Discover Clubs</h2><div className="space-y-4">{clubs.filter(c => !currentUser.followed_clubs?.includes(c.id)).map(club => (<div key={club.id} onClick={() => navigate(`/club/${club.id}`)} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{club.name}</p><p className="text-sm text-gray-500">{club.sport}</p></div></div>))}</div></div></aside></div>)}
        </div>
    );
};

export default FanDashboard;
