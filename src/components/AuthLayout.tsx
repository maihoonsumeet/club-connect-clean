import React from 'react';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
    title: string;
    children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, children }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen -mt-20">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-8 space-y-6">
                <div className="text-center">
                    <Shield className="text-blue-500 mx-auto" size={48} />
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-4">{title}</h1>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AuthLayout;
