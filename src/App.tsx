import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';

// Import Page Components
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

// Import Shared Components
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';

// --- Type Definitions ---
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

export type Player = { id: number; name: string; position: string; avatar_url: string; };
export type Post = { id: number; content: string; image_url?: string; created_at: string; likes: number; comments: Comment[]; };
export type Comment = { id: number; content: string; user_id: string; created_at: string; profiles: Profile };


export default function App() {
    const [currentUser, setCurrentUser] = useState<Profile & User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setIsLoading(true);
            if (session?.user) {
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();
                
                if (userProfile) {
                    const userWithProfile = { ...session.user, ...userProfile };
                    setCurrentUser(userWithProfile);
                    if (!userProfile.role) {
                        navigate('/choose-role');
                    } else if (location.pathname === '/login' || location.pathname === '/signup' || location.pathname === '/') {
                        navigate('/dashboard');
                    }
                }
            } else {
                setCurrentUser(null);
                navigate('/login');
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, [navigate, location.pathname]);

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans`}>
            {currentUser && currentUser.role && <Header user={currentUser} setDarkMode={setDarkMode} darkMode={darkMode} />}
            <main className="container mx-auto px-4 py-8">
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignUpPage />} />

                    {/* Authenticated Routes */}
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
                    
                    {/* Default Route */}
                    <Route path="*" element={currentUser ? (currentUser.role ? <div/> : <RoleChooserPage user={currentUser} />) : <LoginPage />} />
                </Routes>
            </main>
            {currentUser && currentUser.role && <Footer />}
        </div>
    );
}
