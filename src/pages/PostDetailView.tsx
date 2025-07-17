import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Club, Profile, Post, Comment } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import { ArrowLeft } from 'lucide-react';

interface PostDetailViewProps {
    currentUser: Profile;
}

const PostDetailView: React.FC<PostDetailViewProps> = ({ currentUser }) => {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState<Post | null>(null);
    const [club, setClub] = useState<Club | null>(null);
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPostData = async () => {
            if (!postId) return;
            setIsLoading(true);
            
            const { data: postData, error: postError } = await supabase
                .from('posts')
                .select('*, comments(*, profiles(*))')
                .eq('id', postId)
                .single();

            if (postError || !postData) {
                console.error('Error fetching post:', postError);
                setIsLoading(false);
                return;
            }
            
            setPost(postData as any);

            const { data: clubData, error: clubError } = await supabase
                .from('clubs')
                .select('*')
                .eq('id', postData.club_id)
                .single();
            
            if (clubError) console.error('Error fetching club:', clubError);
            else setClub(clubData);

             const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
            if (usersError) console.error(usersError);
            else setUsers(usersData || []);

            setIsLoading(false);
        };
        fetchPostData();
    }, [postId]);

    if (isLoading) return <LoadingSpinner />;
    if (!post || !club) return <div className="text-center">Post not found.</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-blue-500 hover:underline mb-4">
                <ArrowLeft size={20} /><span>Back</span>
            </button>
            <PostCard post={post} club={club} users={users} currentUser={currentUser} isDetailView={true} />
        </div>
    );
};

export default PostDetailView;
