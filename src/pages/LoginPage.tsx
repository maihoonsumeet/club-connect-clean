import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Shield } from 'lucide-react';

const GoogleButton = ({ onClick, text }) => (
    <button type="button" onClick={onClick} className="w-full flex items-center justify-center gap-2 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
        <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 36.49 44 30.881 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
        {text}
    </button>
);

const AuthLayout = ({ title, children }) => (
    <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6">
            <div className="text-center"><Shield className="text-blue-500 mx-auto" size={48} /><h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">{title}</h1></div>
            {children}
        </div>
    </div>
);

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            const { error } = await supabase.auth.signInWithPassword({ 
                email, 
                password 
            });
            
            if (error) {
                setError(error.message);
            }
            // Don't navigate here - let App.tsx handle it via auth state change
        } catch (err) {
            console.error('Login error:', err);
            setError('An unexpected error occurred');
        }
        
        setLoading(false);
    };

    const handleGoogleSignIn = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({ 
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/dashboard`
                }
            });
            
            if (error) {
                setError(error.message);
            }
        } catch (err) {
            console.error('Google sign-in error:', err);
            setError('An unexpected error occurred');
        }
    };

    return (
        <AuthLayout title="Sign In">
            <form onSubmit={handleLogin} className="space-y-4">
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"/></div>
                <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                    {loading ? 'Signing In...' : 'Sign In'}
                </button>
            </form>
            <div className="relative my-4"><div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-600"></span></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-800 px-2 text-gray-500">Or continue with</span></div></div>
            <GoogleButton onClick={handleGoogleSignIn} text="Sign in with Google" />
            <p className="text-center text-sm">Don't have an account? <button onClick={() => navigate('/signup')} className="text-blue-500 hover:underline">Sign Up</button></p>
        </AuthLayout>
    );
};

export default LoginPage;