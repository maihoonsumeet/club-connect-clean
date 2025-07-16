
import { useEffect, useState } from 'react';
import FanDashboard from './pages/FanDashboard';
import AboutPage from './pages/AboutPage';
import ClubProfilePage from './pages/ClubProfilePage';
import ClubDashboard from './pages/ClubDashboard';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ClubPublicView from './pages/ClubPublicView';
import TabsLayout from './components/TabsLayout';
import RoleChooserPage from './pages/RoleChooserPage';
import { supabase } from './supabaseClient';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [page, setPage] = useState('login');
  const [role, setRole] = useState('fan');
  const [selectedClubId, setSelectedClubId] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata.full_name || 'User';
        const avatar = session.user.user_metadata.avatar_url || `https://placehold.co/100x100/CCCCCC/FFFFFF?text=${name.charAt(0)}`;
        setCurrentUser({ name, email, avatar, role: 'fan' });
        setPage('fanDashboard');
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const email = session.user.email;
        const name = session.user.user_metadata.full_name || 'User';
        const avatar = session.user.user_metadata.avatar_url || `https://placehold.co/100x100/CCCCCC/FFFFFF?text=${name.charAt(0)}`;
        setCurrentUser({ name, email, avatar, role: 'fan' });
        setPage('fanDashboard');
      } else {
        setCurrentUser(null);
        setPage('login');
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return false;
    }
    setCurrentUser(data.user);
    setPage('fanDashboard');
    return true;
  };

  const handleSignUp = async (name, email, password) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });
    if (error) {
      alert(error.message);
      return;
    }
    setPage('roleChooser');
  };

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) alert(error.message);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setPage('login');
  };

  const completeRole = (chosenRole) => {
    setRole(chosenRole);
    setPage(chosenRole === 'fan' ? 'fanDashboard' : 'clubDashboard');
  };

  switch (page) {
    case 'signup':
      return <SignUpPage onInitiateSignUp={handleSignUp} navigateTo={setPage} onGoogleSignIn={handleGoogleSignIn} />;
    case 'roleChooser':
      return <RoleChooserPage onCompleteSignUp={completeRole} />;
    case 'fanDashboard':
      return <TabsLayout setPage={setPage} onLogout={handleLogout}><FanDashboard setPage={setPage} setSelectedClubId={setSelectedClubId} /></TabsLayout>;
    case 'about':
      return <TabsLayout setPage={setPage} onLogout={handleLogout}><AboutPage /></TabsLayout>;
    case 'clubProfile':
      return <TabsLayout setPage={setPage} onLogout={handleLogout}><ClubProfilePage clubId={selectedClubId} /></TabsLayout>;
    case 'clubDashboard':
      return <TabsLayout setPage={setPage} onLogout={handleLogout}><ClubDashboard /></TabsLayout>;
    case 'clubPublicView':
      return <TabsLayout setPage={setPage} onLogout={handleLogout}><ClubPublicView clubId={selectedClubId} /></TabsLayout>;
    default:
      return <LoginPage onLogin={handleLogin} navigateTo={setPage} onGoogleSignIn={handleGoogleSignIn} />;
  }
}
