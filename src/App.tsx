// App.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

// Import Pages
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

// Types
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

  // Helper function to handle navigation based on user state
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

    // User has a role - redirect from auth pages to dashboard
    if (currentPath === '/login' || currentPath === '/signup' || currentPath === '/') {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      setIsLoading(true);

      try {
        if (session?.user) {
          const user = session.user;
          
          // Try to get existing profile
          const { data: userProfile, error: fetchError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          let profile = userProfile;

          // Create profile if it doesn't exist
          if (!userProfile && fetchError?.code === 'PGRST116') {
            console.log('Creating new profile for user:', user.id);
            
            const defaultUsername = user.user_metadata.full_name || user.email?.split('@')[0] || 'user';
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                id: user.id,
                email: user.email,
                username: defaultUsername,
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

            // Fetch the newly created profile
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
            
            // Only navigate after initial load is complete
            if (initialLoadComplete) {
              handleUserNavigation(userWithProfile, location.pathname);
            }
          }
        } else {
          setCurrentUser(null);
          
          // Only navigate after initial load is complete
          if (initialLoadComplete) {
            handleUserNavigation(null, location.pathname);
          }
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setCurrentUser(null);
      }

      setIsLoading(false);
      
      // Mark initial load as complete after first auth check
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname, initialLoadComplete]);

  // Handle navigation after initial load is complete
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
      {currentUser && currentUser.role && (
        <Header user={currentUser} setDarkMode={setDarkMode} darkMode={darkMode} />
      )}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {currentUser && (
            <>
              <Route path="/choose-role" element={<RoleChooserPage user={currentUser} />} />
              <Route path="/dashboard" element={currentUser.role === 'fan' ? <FanDashboard currentUser={currentUser} /> : <CreatorDashboard currentUser={currentUser} />} />
              <Route path="/profile" element={<FanProfilePage user={currentUser} />} />
              <Route path="/club/:clubId" element={<ClubPublicView currentUser={currentUser} />} />
              <Route path="/post/:postId" element={<PostDetailView currentUser={currentUser} />} />
              <Route path="/create-club" element={<CreateClubPage currentUser={currentUser} />} />
              <Route path="/manage/club/:clubId" element={<ClubManagementPage currentUser={currentUser} />} />
            </>
          )}

          <Route path="*" element={
            currentUser ? 
              (currentUser.role ? <div>Page not found</div> : <RoleChooserPage user={currentUser} />) 
              : <LoginPage />
          } />
        </Routes>
      </main>
      {currentUser && currentUser.role && <Footer />}
    </div>
  );
}