import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Club, Profile } from '../App';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';

interface Props {
  currentUser: Profile;
}

export default function CreatorDashboard({ currentUser }: Props) {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClubs = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('clubs')
        .select('*, posts(*), players(*)')
        .eq('creator_id', currentUser.id);

      if (error) {
        console.error('Error fetching creator clubs:', error);
      } else {
        setClubs(data || []);
      }
      setLoading(false);
    };

    fetchClubs();
  }, [currentUser.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">My Clubs</h1>
      {clubs.length === 0 ? (
        <p className="text-gray-500">You haven't created any clubs yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {clubs.map(club => (
            <div key={club.id} className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{club.name}</h2>
                <Link to={`/manage/club/${club.id}`} className="text-blue-500 hover:underline text-sm">
                  Manage
                </Link>
              </div>
              <p className="text-sm text-gray-500">
                {(club.players ?? []).length} Players · {(club.posts ?? []).length} Posts
              </p>
              <p className="mt-2 text-gray-700 dark:text-gray-300">{club.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
