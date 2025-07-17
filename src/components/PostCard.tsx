import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Club, Post, Profile, Comment } from '../App';
import { User } from '@supabase/supabase-js';

interface PostCardProps {
    post: Post;
    club: Club;
    users: Profile[];
    currentUser: Profile & User;
    isDetailView?: boolean;
}

const PostCard: React.FC<PostCardProps> = ({ post, club, users, currentUser, isDetailView = false }) => {
    const navigate = useNavigate();
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
        // In a real app, you would call a function here to update the like count in the database.
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (e.target.closest('button, a, form')) return;
        if (!isDetailView) {
            navigate(`/post/${post.id}`);
        }
    };

    return (
        <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${!isDetailView && 'cursor-pointer hover:shadow-xl transition-shadow'}`} onClick={handleCardClick}>
            <div className="p-6">
                <div className="flex items-center mb-4 group" onClick={(e) => { e.stopPropagation(); navigate(`/club/${club.id}`); }}>
                    <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                    <div>
                        <h3 className="font-bold text-lg group-hover:underline">{club.name}</h3>
                        <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p>
                    </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
            </div>
            {post.image_url && <img src={post.image_url} alt="Post content" className="w-full h-auto object-cover"/>}
            <div className="p-4">
                <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                    <div className="flex space-x-5">
                        <button onClick={handleLike} className={`flex items-center space-x-2 hover:text-pink-500 ${isLiked ? 'text-pink-500' : ''}`}>
                            <Heart fill={isLiked ? 'currentColor' : 'none'} size={20} />
                            <span>{likeCount}</span>
                        </button>
                        <button onClick={() => !isDetailView && navigate(`/post/${post.id}`)} className="flex items-center space-x-2 hover:text-blue-500">
                            <MessageCircle size={20} />
                            <span>{post.comments?.length || 0}</span>
                        </button>
                        <button className="flex items-center space-x-2 hover:text-green-500"><Share2 size={20} /></button>
                    </div>
                    <button className="flex items-center space-x-2 hover:text-yellow-500"><Bookmark size={20} /></button>
                </div>
            </div>
        </div>
    );
};

export default PostCard;
