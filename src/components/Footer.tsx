import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-white dark:bg-gray-800 mt-16 border-t dark:border-gray-700">
            <div className="container mx-auto px-4 py-6 text-center text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} ClubConnect. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
