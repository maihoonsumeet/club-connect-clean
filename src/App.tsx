import React, { useState, useEffect, useRef } from 'react';
import { Shield, Users, DollarSign, Shirt, Plus, ArrowLeft, Sun, Moon, UserPlus, Home, Settings, Edit, Camera, Newspaper, Heart, MessageCircle, Share2, Bookmark, Search, LogOut, UserCircle, Check } from 'lucide-react';
import { supabase } from './supabaseClient'; // Import the Supabase client
import { Session, User } from '@supabase/supabase-js';

// --- Type Definitions ---
type Profile = {
    id: string;
    full_name: string;
    avatar_url: string;
    role: 'fan' | 'creator' | null; // Role can now be null
    bio?: string;
    followed_clubs?: number[];
};

type Club = {
    id: number;
    name: string;
    sport: string;
    logo: string;
    tagline: string;
    description: string;
    creator_id: string;
    players: Player[];
    posts: Post[];
    merch: Merch[];
    funding: Funding[];
};

type Player = { id: number; name: string; position: string; avatar_url: string; };
type Post = { id: number; content: string; image_url?: string; created_at: string; likes: number; comments: Comment[]; };
type Comment = { id: number; content: string; user_id: string; created_at: string; };
type Merch = { id: number; name: string; price: number; image: string; };
type Funding = { id: number; current: number; goal: number; };


// --- MAIN APP COMPONENT ---

export default function App() {
    const [currentUser, setCurrentUser] = useState<Profile & User | null>(null);
    const [page, setPage] = useState('login');
    const [pageContext, setPageContext] = useState({});
    const [history, setHistory] = useState([]);
    
    const [clubs, setClubs] = useState<Club[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // This effect is the single source of truth for handling user sessions.
    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setIsLoading(true);
            if (!session?.user) {
                // If no session, ensure user is logged out.
                setCurrentUser(null);
                setPage('login');
                setHistory([]);
            } else {
                // If there is a session, check for a complete profile.
                const { data: userProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (userProfile && userProfile.role) {
                    // Profile is complete, set the user and navigate to their dashboard.
                    setCurrentUser({ ...session.user, ...userProfile });
                    // Only navigate if not already on a dashboard page to avoid loops.
                    if (page === 'login' || page === 'signup' || page === 'roleChooser') {
                         navigateTo(userProfile.role === 'fan' ? 'fanDashboard' : 'creatorDashboard');
                    }
                } else {
                    // Profile is incomplete (no role), navigate to role chooser.
                    // This happens for all new users (email or OAuth).
                    setCurrentUser(session.user as any); // Set partial user data
                    navigateTo('roleChooser');
                }
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);
    
    useEffect(() => {
        if(currentUser?.role) { // Only fetch data if user has a role
            fetchClubs();
            fetchUsers();
        }
    }, [currentUser]);


    useEffect(() => {
        document.documentElement.classList.toggle('dark', darkMode);
    }, [darkMode]);

    // --- Navigation ---
    const navigateTo = (pageName, context = {}) => {
        setHistory([...history, { page, pageContext }]);
        setPage(pageName);
        setPageContext(context);
    };

    const navigateBack = () => {
        if (history.length > 0) {
            const lastState = history[history.length - 1];
            setPage(lastState.page);
            setPageContext(lastState.pageContext);
            setHistory(history.slice(0, -1));
        }
    };

    // --- Data Fetching ---
    const fetchClubs = async () => {
        const { data, error } = await supabase.from('clubs').select(`*, players(*), posts(*, comments(*))`);
        if (error) console.error('Error fetching clubs:', error);
        else setClubs(data || []);
    };

    const fetchUsers = async () => {
        const { data, error } = await supabase.from('profiles').select('*');
        if (error) console.error('Error fetching users:', error);
        else setUsers(data || []);
    };

    // --- Authentication Handlers ---
    const handleLogin = async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert(error.message);
            return false;
        }
        return true;
    };

    const handleSignUp = async (name, email, password) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    avatar_url: `https://placehold.co/100x100/CCCCCC/FFFFFF?text=${name.charAt(0)}`
                }
            }
        });

        if (authError) {
            alert(authError.message);
            return false;
        }
        
        if (authData.user) {
            alert("Sign-up successful! Please check your email to confirm your account.");
            navigateTo('login');
        }
        return true;
    };

    const handleSetRole = async (role) => {
        if (!currentUser) return;

        const { data, error } = await supabase
            .from('profiles')
            .update({ role: role })
            .eq('id', currentUser.id)
            .select()
            .single();
        
        if (error) {
            alert("Could not set role. Please try again.");
        } else {
            setCurrentUser({ ...currentUser, ...data });
            navigateTo(data.role === 'fan' ? 'fanDashboard' : 'creatorDashboard');
        }
    };

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
        if (error) alert(error.message);
    };
    
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
        setPage('login');
        setPageContext({});
        setHistory([]);
    }
    
    // --- Data Mutation Handlers ---
    const handleUpdateUser = async (updatedProfile) => {
        const { data, error } = await supabase
            .from('profiles')
            .update({ full_name: updatedProfile.full_name, bio: updatedProfile.bio, avatar_url: updatedProfile.avatar_url })
            .eq('id', currentUser.id)
            .select()
            .single();

        if (error) alert(error.message);
        else setCurrentUser({ ...currentUser, ...data });
    }

    const handleToggleFollow = async (clubId) => {
        const isFollowing = currentUser.followed_clubs?.includes(clubId);
        const updatedFollowedClubs = isFollowing
            ? currentUser.followed_clubs.filter(id => id !== clubId)
            : [...(currentUser.followed_clubs || []), clubId];
        
        const { data, error } = await supabase
            .from('profiles')
            .update({ followed_clubs: updatedFollowedClubs })
            .eq('id', currentUser.id)
            .select()
            .single();
        
        if(error) alert(error.message);
        else setCurrentUser({ ...currentUser, ...data });
    };

    const handleAddPost = async (clubId, newPost) => {
        const { error } = await supabase
            .from('posts')
            .insert([{ club_id: clubId, content: newPost.text, image_url: newPost.image, author_id: currentUser.id }]);
        
        if(error) alert(error.message);
        else fetchClubs();
    };
    
    const handleAddComment = async (postId, commentText) => {
        const { error } = await supabase
            .from('comments')
            .insert([{ post_id: postId, user_id: currentUser.id, content: commentText }]);
        
        if(error) alert(error.message);
        else fetchClubs();
    };
    
    const handleAddPlayer = async (clubId, newPlayer) => {
        const { error } = await supabase
            .from('players')
            .insert([{ club_id: clubId, ...newPlayer }]);

        if(error) alert(error.message);
        else fetchClubs();
    };

    const handleUpdateClub = async (updatedClub) => {
        const { error } = await supabase
            .from('clubs')
            .update(updatedClub)
            .eq('id', updatedClub.id);
        
        if(error) alert(error.message);
        else fetchClubs();
    };

    const handleCreateClub = async (newClubData) => {
        const { data, error } = await supabase
            .from('clubs')
            .insert([{ ...newClubData, creator_id: currentUser.id }])
            .select()
            .single();

        if(error) alert(error.message);
        else {
            fetchClubs();
            navigateTo('creatorDashboard');
        }
    };

    // --- Page Router ---
    const renderPage = () => {
        if (isLoading) {
            return <div className="flex justify-center items-center h-screen"><div className="loader"></div></div>;
        }

        if (!currentUser || !currentUser.role) {
            switch (page) {
                case 'signup': return <SignUpPage onSignUp={handleSignUp} navigateTo={navigateTo} onGoogleSignIn={handleGoogleSignIn} />;
                case 'roleChooser': return <RoleChooserPage onSetRole={handleSetRole} />;
                default: return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} onGoogleSignIn={handleGoogleSignIn} />;
            }
        }
        
        const { clubId, postId } = pageContext;
        const selectedClub = clubs.find(c => c.id === clubId);
        const selectedPost = selectedClub?.posts.find(p => p.id === postId);

        switch (page) {
            case 'fanDashboard': return <FanDashboard currentUser={currentUser} clubs={clubs} navigateTo={navigateTo} users={users} onAddComment={handleAddComment} />;
            case 'creatorDashboard': return <CreatorDashboard currentUser={currentUser} clubs={clubs} navigateTo={navigateTo} />;
            case 'createClub': return <CreateClubPage onCreateClub={handleCreateClub} navigateTo={navigateTo} />;
            case 'clubManagement': return <ClubManagementPage club={selectedClub} onAddPost={handleAddPost} onAddPlayer={handleAddPlayer} onUpdateClub={handleUpdateClub}/>;
            case 'clubPublicView': return <ClubPublicView club={selectedClub} navigateTo={navigateTo} users={users} onAddComment={handleAddComment} currentUser={currentUser} onToggleFollow={handleToggleFollow} />;
            case 'fanProfile': return <FanProfilePage user={currentUser} onUpdateUser={handleUpdateUser} />;
            case 'postDetail': return <PostDetailView post={selectedPost} club={selectedClub} navigateBack={navigateBack} users={users} onAddComment={handleAddComment} currentUser={currentUser} />;
            default: return <LoginPage onLogin={handleLogin} navigateTo={navigateTo} />;
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
            {currentUser && <Header user={currentUser} onLogout={handleLogout} navigateTo={navigateTo} darkMode={darkMode} setDarkMode={setDarkMode} />}
            <main className="container mx-auto px-4 py-8">
                {renderPage()}
            </main>
            {currentUser && <Footer />}
        </div>
    );
}

// --- CORE COMPONENTS ---
const Header = ({ user, onLogout, navigateTo, darkMode, setDarkMode }) => {
    const goHome = () => navigateTo(user.role === 'fan' ? 'fanDashboard' : 'creatorDashboard');
    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={goHome}><Shield className="text-blue-500" size={28} /><span className="text-xl font-bold text-gray-800 dark:text-white">ClubConnect</span></div>
                <div className="flex items-center space-x-4">
                    <span className="hidden sm:block font-semibold">Welcome, {user.full_name || user.email}!</span>
                    {user.role === 'fan' && <button onClick={() => navigateTo('fanProfile')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><UserCircle/></button>}
                    <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
                    <button onClick={onLogout} title="Logout" className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow"><LogOut size={20}/></button>
                </div>
            </nav>
        </header>
    );
};
const ThemeToggle = ({ darkMode, setDarkMode }) => (<button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">{darkMode ? <Sun size={20} /> : <Moon size={20} />}</button>);
const Footer = () => (<footer className="bg-white dark:bg-gray-800 mt-16 border-t dark:border-gray-700"><div className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400"><p>&copy; {new Date().getFullYear()} ClubConnect. All rights reserved.</p></div></footer>);

// --- AUTH PAGES ---
const AuthLayout = ({ title, children }) => (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6">
            <div className="text-center"><Shield className="text-blue-500 mx-auto" size={48} /><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">{title}</h1></div>
            {children}
        </div>
    </div>
);

const GoogleButton = ({ onClick, text }) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-2 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 36.49 44 30.881 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
        {text}
    </button>
);

const LoginPage = ({ onLogin, navigateTo, onGoogleSignIn }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        const success = await onLogin(email, password);
        if (!success) {
            setError('Invalid email or password.');
        }
    };
    return (
        <AuthLayout title="Sign In">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">Sign In</button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-600"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span></div></div>
            <GoogleButton onClick={onGoogleSignIn} text="Sign in with Google" />
            <p className="text-center text-sm">Don't have an account? <button onClick={() => navigateTo('signup')} className="text-blue-500 hover:underline">Sign Up</button></p>
        </AuthLayout>
    );
};

const SignUpPage = ({ onSignUp, navigateTo, onGoogleSignIn }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const handleSubmit = (e) => { e.preventDefault(); onSignUp(name, email, password); };

    return (
        <AuthLayout title="Create Account">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm font-medium mb-1">Full Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">Sign Up</button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-600"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or</span></div></div>
            <GoogleButton onClick={onGoogleSignIn} text="Sign up with Google" />
            <p className="text-center text-sm">Already have an account? <button onClick={() => navigateTo('login')} className="text-blue-500 hover:underline">Sign In</button></p>
        </AuthLayout>
    );
};

const RoleChooserPage = ({ onSetRole }) => (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
        <div className="text-center mb-12">
            <Shield className="text-blue-500 mx-auto" size={64} />
            <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mt-4">One Last Step!</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mt-2">How would you like to use ClubConnect?</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <div onClick={() => onSetRole('fan')} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-center transform hover:-translate-y-2"><Users className="text-green-500 mx-auto" size={48} /><h2 className="text-3xl font-bold mt-4">I'm a Fan</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Follow your favorite clubs, get updates, and support your teams.</p></div>
            <div onClick={() => onSetRole('creator')} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer text-center transform hover:-translate-y-2"><Edit className="text-purple-500 mx-auto" size={48} /><h2 className="text-3xl font-bold mt-4">I'm a Creator</h2><p className="text-gray-600 dark:text-gray-400 mt-2">Create and manage your club's page, post updates, and engage with fans.</p></div>
        </div>
    </div>
);


// --- FAN EXPERIENCE ---
// ... (The rest of the components remain largely the same, but now receive live data)
// Note: Some components are simplified for this example.
const FanDashboard = ({ currentUser, clubs, navigateTo, users, onAddComment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const followedClubsPosts = clubs.filter(club => currentUser.followed_clubs?.includes(club.id)).flatMap(club => (club.posts || []).map(post => ({ ...post, club }))).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const filteredClubs = clubs.filter(club => club.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                 <h1 className="text-3xl font-bold">Fan Dashboard</h1>
                 <div className="relative md:w-1/3"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search for any club..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
            </div>
            {searchTerm ? (<div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold mb-4">Search Results</h2><div className="space-y-4">{filteredClubs.length > 0 ? filteredClubs.map(club => (<div key={club.id} onClick={() => navigateTo('clubPublicView', { clubId: club.id })} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{club.name}</p><p className="text-sm text-gray-500">{club.sport}</p></div></div>)) : <p>No clubs found.</p>}</div></div>) : (<div className="grid grid-cols-1 lg:grid-cols-3 gap-8"><div className="lg:col-span-2 space-y-6"><h2 className="text-2xl font-bold">Your Feed</h2>{followedClubsPosts.length > 0 ? (followedClubsPosts.map(post => <PostCard key={`${post.id}`} post={post} club={post.club} navigateTo={navigateTo} users={users} onAddComment={onAddComment} currentUser={currentUser}/>)) : (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl text-center"><h2 className="text-xl font-semibold">Your feed is empty!</h2><p className="mt-2">Follow clubs to see their updates.</p></div>)}</div><aside className="lg:col-span-1 space-y-6"><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold mb-4">Discover Clubs</h2><div className="space-y-4">{clubs.filter(c => !currentUser.followed_clubs?.includes(c.id)).map(club => (<div key={club.id} onClick={() => navigateTo('clubPublicView', { clubId: club.id })} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"><img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold">{club.name}</p><p className="text-sm text-gray-500">{club.sport}</p></div></div>))}</div></div></aside></div>)}
        </div>
    );
};

const PostCard = ({ post, club, navigateTo, users, onAddComment, currentUser, isDetailView = false }) => {
    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(post.likes || 0);
    
    const handleLike = () => { setIsLiked(!isLiked); setLikeCount(isLiked ? likeCount - 1 : likeCount + 1); };
    
    const handleCardClick = (e) => {
        if (e.target.closest('button, a, form')) return;
        if (!isDetailView) {
            navigateTo('postDetail', { postId: post.id, clubId: club.id });
        }
    };

    return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden ${!isDetailView && 'cursor-pointer hover:shadow-xl transition-shadow'}`} onClick={handleCardClick}>
        <div className="p-6">
            <div className="flex items-center mb-4 group" onClick={(e) => { e.stopPropagation(); navigateTo('clubPublicView', { clubId: club.id }); }}>
                <img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover mr-4" />
                <div><h3 className="font-bold text-lg group-hover:underline">{club.name}</h3><p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleString()}</p></div>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{post.content}</p>
        </div>
        {post.image_url && <img src={post.image_url} alt="Post content" className="w-full h-auto object-cover"/>}
        <div className="p-4">
            <div className="flex justify-between items-center text-gray-500 dark:text-gray-400">
                <div className="flex space-x-5">
                    <button onClick={handleLike} className={`flex items-center space-x-2 hover:text-pink-500 ${isLiked ? 'text-pink-500' : ''}`}><Heart fill={isLiked ? 'currentColor' : 'none'} size={20} /><span>{likeCount}</span></button>
                    <button onClick={() => !isDetailView && navigateTo('postDetail', { postId: post.id, clubId: club.id })} className="flex items-center space-x-2 hover:text-blue-500"><MessageCircle size={20} /><span>{post.comments?.length || 0}</span></button>
                    <button className="flex items-center space-x-2 hover:text-green-500"><Share2 size={20} /></button>
                </div>
                <button className="flex items-center space-x-2 hover:text-yellow-500"><Bookmark size={20} /></button>
            </div>
            {isDetailView && <CommentSection post={post} club={club} users={users} onAddComment={onAddComment} currentUser={currentUser} />}
        </div>
    </div>
)};

const CommentSection = ({ post, club, users, onAddComment, currentUser }) => {
    const [commentText, setCommentText] = useState('');
    const handleCommentSubmit = (e) => { e.preventDefault(); if(commentText.trim()){ onAddComment(post.id, commentText); setCommentText(''); }};

    return (
        <div className="mt-4 space-y-3">
            <h3 className="text-lg font-bold border-t pt-4 dark:border-gray-700">Replies</h3>
            {(post.comments || []).map(comment => {
                const commenter = users.find(u => u.id === comment.user_id);
                return (<div key={comment.id} className="flex items-start space-x-3 text-sm"><img src={commenter?.avatar_url} alt={commenter?.full_name} className="w-8 h-8 rounded-full"/><div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg flex-1"><span className="font-semibold">{commenter?.full_name || 'User'}</span>: {comment.content}</div></div>)})}
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2 pt-2">
                <img src={currentUser.avatar_url} alt="your avatar" className="w-8 h-8 rounded-full"/>
                <input type="text" value={commentText} onChange={e=>setCommentText(e.target.value)} placeholder="Write a reply..." className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 text-sm"/>
            </form>
        </div>
    );
};

const PostDetailView = ({ post, club, navigateBack, users, onAddComment, currentUser }) => {
    if (!post || !club) {
        return <div className="text-center">Post not found. <button onClick={navigateBack} className="text-blue-500">Go Back</button></div>;
    }
    return (
        <div className="max-w-3xl mx-auto">
            <button onClick={navigateBack} className="flex items-center space-x-2 text-blue-500 hover:underline mb-4"><ArrowLeft size={20} /><span>Back</span></button>
            <PostCard post={post} club={club} navigateTo={()=>{}} users={users} onAddComment={onAddComment} currentUser={currentUser} isDetailView={true} />
        </div>
    );
};

const ClubPublicView = ({ club, navigateTo, users, onAddComment, currentUser, onToggleFollow }) => {
    const [activeTab, setActiveTab] = useState('posts');
    if (!club) return <div className="loader"></div>;
    const isFollowing = currentUser.followed_clubs?.includes(club.id);
    const tabs = [{ id: 'posts', label: 'Posts', icon: Newspaper }, { id: 'team', label: 'Team', icon: Users }, { id: 'funding', label: 'Funding', icon: DollarSign }, { id: 'merch', label: 'Merch', icon: Shirt }];
    
    return (<div className="space-y-8"><button onClick={() => navigateTo('fanDashboard')} className="flex items-center space-x-2 text-blue-500 hover:underline"><ArrowLeft size={20} /><span>Back to Dashboard</span></button><div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"><header className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left"><img src={club.logo} alt={club.name} className="w-32 h-32 rounded-2xl object-cover shadow-lg" /><div><h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">{club.name}</h1><p className="text-xl text-gray-500 mt-1">{club.description}</p></div>
    <button onClick={() => onToggleFollow(club.id)} className={`mt-4 md:mt-0 md:ml-auto px-6 py-3 rounded-lg font-semibold transition-colors shadow-lg flex items-center gap-2 ${isFollowing ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300' : 'bg-blue-500 text-white hover:bg-blue-600'}`}>
        {isFollowing ? <><Check size={20}/> Following</> : 'Follow Club'}
    </button>
    </header></div><div><div className="border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-6 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${ activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}><tab.icon size={16} /><span>{tab.label}</span></button>))}</nav></div><div className="mt-8">{activeTab === 'posts' && <div className="space-y-6">{(club.posts || []).map(post => <PostCard key={post.id} post={post} club={club} navigateTo={navigateTo} users={users} onAddComment={onAddComment} currentUser={currentUser}/>)}</div>}{activeTab === 'team' && <PlayerRoster club={club} isReadOnly={true} />}{activeTab === 'funding' && <FundingSection funding={club.funding?.[0]} />}{activeTab === 'merch' && <MerchSection merch={club.merch} />}</div></div></div>);
};

const FanProfilePage = ({ user, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.full_name);
    const [bio, setBio] = useState(user.bio);
    const [avatar, setAvatar] = useState(user.avatar_url);
    
    const handleSave = () => {
        onUpdateUser({ ...user, full_name: name, bio, avatar_url: avatar });
        setIsEditing(false);
    }
    
    const handleAvatarChange = () => {
        const newAvatar = `https://placehold.co/150x150/60A5FA/FFFFFF?text=${name.charAt(0)}`;
        setAvatar(newAvatar);
    }

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Your Profile</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">{isEditing ? 'Cancel' : 'Edit Profile'}</button>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <img src={avatar} alt="Profile" className="w-36 h-36 rounded-full border-4 border-white dark:border-gray-700 shadow-lg"/>
                    {isEditing && (<button onClick={handleAvatarChange} className="absolute bottom-1 right-1 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"><Camera size={18}/></button>)}
                </div>
                {!isEditing ? (
                    <>
                        <h1 className="text-3xl font-bold">{name}</h1>
                        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">{bio || "You haven't written a bio yet."}</p>
                    </>
                ) : (
                    <div className="w-full space-y-4 pt-4">
                        <div><label className="block font-medium mb-1">Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600" /></div>
                        <div><label className="block font-medium mb-1">Bio</label><textarea value={bio} onChange={e=>setBio(e.target.value)} rows="3" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea></div>
                        <button onClick={handleSave} className="w-full bg-green-500 text-white py-2 rounded-lg hover:bg-green-600">Save Changes</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- CREATOR EXPERIENCE ---

const CreatorDashboard = ({ currentUser, clubs, navigateTo }) => {
    const managedClubs = clubs.filter(club => club.creator_id === currentUser.id);
    return (<div className="space-y-8"><h1 className="text-3xl font-bold">Creator Dashboard</h1><div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg"><h2 className="text-2xl font-bold mb-4">Your Clubs</h2><div className="space-y-4">{managedClubs.length > 0 ? managedClubs.map(club => (<div key={club.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-700"><div className="flex items-center space-x-4"><img src={club.logo} alt={club.name} className="w-12 h-12 rounded-lg object-cover" /><div><p className="font-bold text-lg">{club.name}</p></div></div><button onClick={() => navigateTo('clubManagement', { clubId: club.id })} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 shadow">Manage</button></div>)) : <p className="text-center text-gray-500 py-4">You haven't created any clubs yet.</p>}</div><button onClick={() => navigateTo('createClub')} className="mt-6 w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg hover:bg-green-600 shadow"><Plus size={20} /><span>Create a New Club</span></button></div></div>);
};

const CreateClubPage = ({ onCreateClub, navigateTo }) => {
    const [name, setName] = useState('');
    const [sport, setSport] = useState('');
    const [tagline, setTagline] = useState('');
    const [description, setDescription] = useState('');
    const [logo, setLogo] = useState('');
    const fileInputRef = useRef(null);

    const handleLogoClick = () => fileInputRef.current.click();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setLogo(event.target.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if(!name || !sport || !tagline || !description || !logo) {
            alert("Please fill all fields and upload a logo.");
            return;
        }
        onCreateClub({ name, sport, tagline, description, logo });
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Set Up Your New Club</h2>
                <button onClick={() => navigateTo('creatorDashboard')} className="text-gray-500 hover:text-gray-800"><ArrowLeft size={24}/></button>
            </div>
            <p className="text-gray-600 dark:text-gray-400">Fill out the details below to get your club's page up and running.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium mb-1">Club Logo</label>
                    <div onClick={handleLogoClick} className="cursor-pointer mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                            {logo ? <img src={logo} alt="Logo Preview" className="mx-auto h-24 w-24 rounded-lg object-cover"/> : <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true"><path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></svg>}
                            <p className="text-sm text-blue-500 hover:underline">Click to upload an image</p>
                            <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                        </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/png, image/jpeg" />
                </div>
                <div><label className="block font-medium mb-1">Club Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Sport</label><input type="text" value={sport} onChange={e=>setSport(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Tagline</label><input type="text" value={tagline} onChange={e=>setTagline(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block font-medium mb-1">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} required rows="3" className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"></textarea></div>
                <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors text-lg font-semibold">Create Club Page</button>
            </form>
        </div>
    );
};

const ClubManagementPage = ({ club, onAddPost, onAddPlayer, onUpdateClub }) => {
    const [activeTab, setActiveTab] = useState('posts');
    const tabs = [{ id: 'posts', label: 'Posts', icon: Newspaper }, { id: 'team', label: 'Team', icon: Users }, { id: 'merch', label: 'Merch', icon: Shirt }, { id: 'funding', label: 'Funding', icon: DollarSign }, { id: 'settings', label: 'Settings', icon: Settings }];
    if (!club) return <div className="loader"></div>;
    return (<div className="space-y-8"><header className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 flex items-center justify-between"><div className="flex items-center gap-6"><img src={club.logo} alt={club.name} className="w-32 h-32 rounded-2xl object-cover shadow-lg" /><div><h1 className="text-4xl font-extrabold">{club.name}</h1><p className="text-xl text-gray-500 mt-1">Club Management</p></div></div></header><div><div className="border-b border-gray-200 dark:border-gray-700"><nav className="-mb-px flex space-x-6 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`${ activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:border-gray-300' } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}><tab.icon size={16} /><span>{tab.label}</span></button>))}</nav></div><div className="mt-8">{activeTab === 'posts' && <PostsManager club={club} onAddPost={onAddPost} />}{activeTab === 'team' && <PlayerRoster club={club} onAddPlayer={onAddPlayer} />}{activeTab === 'merch' && <MerchManager />}{activeTab === 'funding' && <FundingSection funding={club.funding?.[0]} isReadOnly={false} />}{activeTab === 'settings' && <ClubSettings club={club} onUpdateClub={onUpdateClub} />}</div></div></div>);
};

const PostsManager = ({ club, onAddPost }) => {
    const [postText, setPostText] = useState('');
    const [postImage, setPostImage] = useState(null);
    const fileInputRef = useRef(null);

    const handleSubmit = (e) => { e.preventDefault(); if(!postText) return; onAddPost(club.id, { text: postText, image: postImage }); setPostText(''); setPostImage(null); };
    
    const handleImageButtonClick = () => fileInputRef.current.click();
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setPostImage(event.target.result);
            reader.readAsDataURL(file);
        }
    };
    
    return (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg space-y-6"><h3 className="text-2xl font-bold">Manage Posts</h3><form onSubmit={handleSubmit} className="space-y-4"><textarea value={postText} onChange={e => setPostText(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700" rows="4" placeholder="What's new with the team?"></textarea>{postImage && <div className="relative"><img src={postImage} alt="preview" className="rounded-lg w-full"/><button type="button" onClick={() => setPostImage(null)} className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none">&times;</button></div>}<div className="flex justify-between items-center"><button type="button" onClick={handleImageButtonClick} className="flex items-center space-x-2 text-blue-500"><Camera size={20}/><span>Add Image</span></button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" /><button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 shadow">Post Update</button></div></form><div className="space-y-4"><h4 className="font-bold text-lg">Recent Posts</h4>{(club.posts || []).map(post => <div key={post.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">{post.content}</div>)}</div></div>);
};

const PlayerRoster = ({ club, onAddPlayer, isReadOnly = false }) => {
    const [isAdding, setIsAdding] = useState(false);
    return (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"><div className="flex justify-between items-center mb-6"><h3 className="text-2xl font-bold">Team Roster</h3>{!isReadOnly && <button onClick={() => setIsAdding(!isAdding)} className="flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow"><UserPlus size={20} /><span>{isAdding ? 'Cancel' : 'Add Player'}</span></button>}</div>{isAdding && <AddPlayerForm clubId={club.id} onAddPlayer={onAddPlayer} onDone={() => setIsAdding(false)} /> }<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{(club.players || []).length > 0 ? club.players.map(player => (<div key={player.id} className="text-center bg-gray-50 dark:bg-gray-700 p-4 rounded-xl shadow-md"><img src={player.avatar_url} alt={player.name} className="w-24 h-24 rounded-full mx-auto mb-3 border-4 border-white dark:border-gray-600" /><p className="font-bold text-lg">{player.name}</p><p className="text-blue-500 font-semibold">{player.position}</p></div>)) : <p>No players on the roster.</p>}</div></div>);
};

const AddPlayerForm = ({ clubId, onAddPlayer, onDone }) => {
    const [name, setName] = useState(''); 
    const [position, setPosition] = useState('');
    const [avatar, setAvatar] = useState('');
    const fileInputRef = useRef(null);

    const handleAvatarClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setAvatar(event.target.result as string);
            reader.readAsDataURL(file);
        }
    };
    const handleSubmit = (e) => { e.preventDefault(); if (!name || !position) return; onAddPlayer(clubId, { name, position, avatar_url: avatar || `https://placehold.co/100x100/CCCCCC/FFFFFF?text=${name.charAt(0)}` }); onDone(); };
    
    return (
    <form onSubmit={handleSubmit} className="bg-gray-100 dark:bg-gray-900 p-6 rounded-lg mb-8 border border-gray-200 dark:border-gray-700 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Player Name</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full mt-1 p-2 rounded dark:bg-gray-800 border dark:border-gray-600" required /></div>
            <div><label className="block text-sm font-medium mb-1">Position</label><input type="text" value={position} onChange={e => setPosition(e.target.value)} className="w-full mt-1 p-2 rounded dark:bg-gray-800 border dark:border-gray-600" required /></div>
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Player Photo</label>
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    {avatar ? <img src={avatar} alt="avatar" className="w-full h-full rounded-full object-cover" /> : <UserCircle className="text-gray-400" size={32}/>}
                </div>
                <button type="button" onClick={handleAvatarClick} className="bg-white dark:bg-gray-700 text-sm py-1 px-3 rounded-lg border dark:border-gray-600">Upload Photo</button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/>
            </div>
        </div>
        <button type="submit" className="w-full bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600">Add to Roster</button>
    </form>
    );
};


const ClubSettings = ({ club, onUpdateClub }) => {
    const [name, setName] = useState(club.name);
    const [tagline, setTagline] = useState(club.tagline);
    const [description, setDescription] = useState(club.description);
    const [logo, setLogo] = useState(club.logo);
    const fileInputRef = useRef(null);

    const handleSave = () => { onUpdateClub({ id: club.id, name, tagline, description, logo }); alert('Settings Saved!'); }
    const handleLogoClick = () => fileInputRef.current.click();
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => setLogo(event.target.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"><h3 className="text-2xl font-bold mb-4">Club Settings</h3><div className="space-y-4"><p>Manage your club's identity and information here.</p>
    <div><label className="block font-medium mb-1">Club Logo</label><div className="flex items-center gap-4"><img src={logo} alt="logo" className="w-20 h-20 rounded-lg object-cover"/><button onClick={handleLogoClick} className="bg-blue-100 text-blue-700 py-1 px-3 rounded-lg text-sm">Change</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*"/></div></div>
    <div><label className="block font-medium mb-1">Club Name</label><input type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700"/></div><div><label className="block font-medium mb-1">Tagline</label><input type="text" value={tagline} onChange={e=>setTagline(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700"/></div><div><label className="block font-medium mb-1">Description</label><textarea rows="3" value={description} onChange={e=>setDescription(e.target.value)} className="w-full p-2 border rounded-lg dark:bg-gray-700"></textarea></div><button onClick={handleSave} className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600">Save Settings</button></div></div>);
}

const MerchManager = () => (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">Merch management interface coming soon...</div>);
const FundingSection = ({ funding, isReadOnly = true }) => { const percentage = (funding?.current / funding?.goal) * 100 || 0; return (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"><h3 className="text-2xl font-bold mb-2">Team Funding Goal</h3><p className="text-gray-600 dark:text-gray-400 mb-6">Raising funds for new equipment!</p><div className="space-y-4"><div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4"><div className="bg-green-500 h-4 rounded-full" style={{ width: `${percentage}%` }}></div></div><div className="flex justify-between text-sm font-medium"><span>${funding?.current?.toLocaleString() || 0} Raised</span><span>${funding?.goal?.toLocaleString() || 10000} Goal</span></div><button className="w-full bg-green-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-600 shadow-lg text-lg">{isReadOnly ? 'Support Team' : 'Manage Funding'}</button></div></div>);};
const MerchSection = ({ merch }) => (<div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"><h3 className="text-2xl font-bold mb-6">Official Merchandise</h3><div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">{(merch || []).map(item => <MerchCard key={item.id} item={item} />)}</div></div>);
const MerchCard = ({ item }) => (<div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"><img src={item.image} alt={item.name} className="w-full h-56 object-cover" /><div className="p-4"><h4 className="font-bold text-lg">{item.name}</h4><p className="text-gray-500 mb-3">${item.price}</p><button className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600">Add to Cart</button></div></div>);
