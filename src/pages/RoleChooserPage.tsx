import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Shield, Users, Edit } from 'lucide-react';
import { User } from '@supabase/supabase-js';

interface RoleChooserPageProps {
  user: User;
}

const RoleChooserPage: React.FC<RoleChooserPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching role:', error.message);
      } else {
        if (data?.role) {
          navigate('/dashboard');
        } else {
          setRole(null); // role is not set
        }
      }

      setIsLoading(false);
    };

    fetchRole();
  }, [user, navigate]);

  const handleSetRole = async (newRole: 'fan' | 'creator') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
      alert(error.message);
    } else {
      navigate('/dashboard');
    }
  };

  if (isLoading) {
    return <div className="text-center mt-20 text-lg">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
      <div className="text-center mb-12">
        <Shield className="text-blue-500 mx-auto" size={64} />
        <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mt-4">One Last Step!</h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-2">How would you like to use ClubConnect?</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div onClick={() => handleSetRole('fan')} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-center transform hover:-translate-y-2">
          <Users className="text-green-500 mx-auto" size={48} />
          <h2 className="text-3xl font-bold mt-4">I'm a Fan</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Follow your favorite clubs, get updates, and support your teams.</p>
        </div>
        <div onClick={() => handleSetRole('creator')} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-center transform hover:-translate-y-2">
          <Edit className="text-purple-500 mx-auto" size={48} />
          <h2 className="text-3xl font-bold mt-4">I'm a Creator</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your club's page, post updates, and engage with fans.</p>
        </div>
      </div>
    </div>
  );
};

export default RoleChooserPage;
