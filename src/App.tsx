// App.tsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

// Pages
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import RoleChooserPage from './pages/RoleChooserPage';
import FanDashboard from './pages/FanDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import ClubPublicView from './pages/ClubPublicView';
import PostDetailView from './pages/PostDetailView';
import FanProfilePage from './pages/FanProfilePage';
import CreateClubPage from './pages/CreateClubPage';
import ClubManagementPage from './pages/ClubManagementPage';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string;
  role: 'fan' | 'creator' | null;
  bio?: string;
  followed_clubs?: number[];
};

export type Club = {
  id: number;
  name: string;
  sport: string;
  logo: string;
  tagline: string;
  description: string;
  creator_id: string;
  players: Player[];
  posts: Post[];
};

export type Player = { id: number; name: string; position: string; avatar_url: string };
export type Post = { id: number; content: string; image_url?: string; created_at: string; likes: number; comments: Comment[] };
export type Comment = { id: number; content: string; user_id: string; created_at: string; profiles: Profile };

export default function App() {
  const [currentUser, setCurrentUser] = useState<Profile & User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handleUserNavigation = (user: Profile & User | null, currentPath: string) => {
    if (!user) {
      if (currentPath !== '/login' && currentPath !== '/signup') {
        navigate('/login');
      }
      return;
    }

    if (!user.role) {
      if (currentPath !== '/choose-role') {
        navigate('/choose-role');
      }
      return;
    }

    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      try {
        if (session?.user) {
          const user = session.user;

          const { data: userProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          let profile = userProfile;

          if (!userProfile && fetchError?.code === 'PGRST116') {
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                id: user.id,
                full_name: user.user_metadata.full_name || '',
                avatar_url: user.user_metadata.avatar_url || '',
                role: null
              }
            ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              setCurrentUser(null);
              setIsLoading(false);
              return;
            }

            const { data: insertedProfile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id)
              .single();

            profile = insertedProfile;
          }

          if (profile) {
            const userWithProfile = { ...user, ...profile };
            setCurrentUser(userWithProfile);

            if (initialLoadComplete) {
              handleUserNavigation(userWithProfile, location.pathname);
            }
          } else {
            setCurrentUser(null);
          }
        } else {
          setCurrentUser(null);
          if (initialLoadComplete) {
            handleUserNavigation(null, location.pathname);
          }
        }
      } catch (err) {
        console.error('Auth error:', err);
        setCurrentUser(null);
      }

      setIsLoading(false);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, initialLoadComplete]);

  useEffect(() => {
    if (initialLoadComplete && !isLoading) {
      handleUserNavigation(currentUser, location.pathname);
    }
  }, [initialLoadComplete, isLoading, currentUser, location.pathname]);

  if (isLoading || !initialLoadComplete) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans">
      {currentUser?.role && (
        <Header user={currentUser} setDarkMode={setDarkMode} darkMode={darkMode} />
      )}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {currentUser && (
            <>
              <Route path="/choose-role" element={<RoleChooserPage user={currentUser} />} />
              <Route path="/dashboard" element={
                currentUser.role === 'fan'
                  ? <FanDashboard currentUser={currentUser} />
                  : <CreatorDashboard currentUser={currentUser} />
              } />
              <Route path="/profile" element={<FanProfilePage user={currentUser} />} />
              <Route path="/club/:clubId" element={<ClubPublicView currentUser={currentUser} />} />
              <Route path="/post/:postId" element={<PostDetailView currentUser={currentUser} />} />
              <Route path="/create-club" element={<CreateClubPage currentUser={currentUser} />} />
              <Route path="/manage/club/:clubId" element={<ClubManagementPage currentUser={currentUser} />} />
            </>
          )}

          <Route path="*" element={
            currentUser
              ? (currentUser.role
                ? <div>Page not found</div>
                : <RoleChooserPage user={currentUser} />)
              : <LoginPage />
          } />
        </Routes>
      </main>
      {currentUser?.role && <Footer />}
    </div>
  );
}

useEffect(() => {
  const getSessionAndProfile = async () => {
    setIsLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
      const user = session.user;

      // Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      const userWithProfile = { ...user, ...profile };
      setCurrentUser(userWithProfile);

    } else {
      setCurrentUser(null);
    }

    setIsLoading(false);
    setInitialLoadComplete(true);
  };

  getSessionAndProfile();

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log("Auth state change →", _event);
    if (!session) {
      setCurrentUser(null);
    } else {
      // optional: you could call getSessionAndProfile() again
    }
  });

  return () => subscription.unsubscribe();
}, []);

if (isLoading || !initialLoadComplete) {
  return <LoadingSpinner />;
}
