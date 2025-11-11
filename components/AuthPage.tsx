import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import Spinner from './Spinner';

const AuthPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        setLoading(true);
        setError(null);

        // SECURITY WARNING: Hardcoding credentials is a significant security risk.
        // This is for demonstration purposes only and should NEVER be used in production.
        const email = 'abdullahalsadman58@gmail.com';
        const password = 'Sadman2010';

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });
            if (error) throw error;
        } catch (error: any) {
             if (error.message.includes('Email not confirmed')) {
                setError('Login Failed: Please confirm your email address. Check your inbox for a confirmation link, or manually confirm the user in your Supabase project dashboard under Authentication > Users.');
            } else if (error.message.includes('Invalid login credentials')) {
                setError('Login failed. Please check your email and password.');
            } else {
                setError(error.error_description || error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-8 space-y-8 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-xl">
                <div className="text-center">
                    <span className="text-5xl">🛠️</span>
                    <h1 className="mt-4 text-3xl font-bold font-display text-gray-900 dark:text-white">
                        Crypto Trading Toolkit
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Please sign in to continue.
                    </p>
                </div>
                
                <div className="space-y-6">
                    {error && <p role="alert" className="text-sm text-red-500 text-center bg-red-500/10 p-3 rounded-md">{error}</p>}
                    
                    <div>
                        <button
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? <Spinner /> : 'Login'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;