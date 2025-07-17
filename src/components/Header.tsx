import React from 'react';
import { Shield, LogOut, UserCircle, Sun, Moon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { Profile } from '../App'; // Assuming types are exported from App.tsx

interface HeaderProps {
    user: Profile & User;
    setDarkMode: (value: boolean) => void;
    darkMode: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, setDarkMode, darkMode }) => {
    const navigate = (path: string) => {
        // In a real app with react-router-dom, you'd use the useNavigate hook.
        // For this structure, we'll just log it.
        console.log(`Navigating to ${path}`);
        window.location.pathname = path; // Simple navigation for this example
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
            <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
                    <Shield className="text-blue-500" size={28} />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">ClubConnect</span>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="hidden sm:block font-semibold">Welcome, {user.full_name || user.email}!</span>
                    {user.role === 'fan' && <button onClick={() => navigate('/profile')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><UserCircle/></button>}
                    <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button onClick={handleLogout} title="Logout" className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow"><LogOut size={20}/></button>
                </div>
            </nav>
        </header>
    );
};

export default Header;
