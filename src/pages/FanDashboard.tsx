import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Club, Post, Profile } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';

interface Props {
  currentUser: Profile;
}

export default function FanDashboard({ currentUser }: Props) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('clubs')
        .select('*, posts(*, comments(*, profiles(*)))');

      if (error) {
        console.error('Error fetching clubs:', error);
      } else {
        setClubs(data || []);
      }
      setLoading(false);
    };

    fetchClubs();
  }, []);

  if (loading) return <LoadingSpinner />;

  const followedClubsPosts = clubs
    .filter(club => currentUser.followed_clubs?.includes(club.id))
    .flatMap(club =>
      (club.posts ?? []).map(post => ({
        ...post,
        club,
      }))
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Feed</h1>
      {followedClubsPosts.length === 0 ? (
        <p className="text-gray-500">No posts from followed clubs yet.</p>
      ) : (
        followedClubsPosts.map(post => (
          <PostCard key={post.id} post={post} club={post.club} currentUser={currentUser} />
        ))
      )}
    </div>
  );
}
