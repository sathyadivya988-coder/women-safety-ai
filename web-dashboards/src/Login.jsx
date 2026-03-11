import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();

    const [role, setRole] = useState('user'); // 'user', 'admin', 'police'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Please enter both username and password.');
            return;
        }

        if (!termsAccepted) {
            setError('You must accept the terms and conditions regarding location sharing to use this app.');
            return;
        }

        // Mock authentication success
        setTimeout(() => {
            if (role === 'admin') navigate('/admin');
            else if (role === 'police') navigate('/police');
            else navigate('/user');
        }, 500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
            {/* Subtle background texture */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-4 border border-indigo-400/30">
                    <Shield size={32} className="text-white" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-100">
                    SafePath Ecosystem
                </h2>
                <p className="mt-2 text-center text-sm text-indigo-200/60 max-w">
                    Sign in to access your dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-slate-800/80 backdrop-blur-xl py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-slate-700/50">
                    <form className="space-y-6" onSubmit={handleLogin}>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Select Role</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('user')}
                                    className={`py-2 px-3 flex justify-center items-center rounded-xl text-sm font-semibold transition-all ${role === 'user' ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    User
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('police')}
                                    className={`py-2 px-3 flex justify-center items-center rounded-xl text-sm font-semibold transition-all ${role === 'police' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Police
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('admin')}
                                    className={`py-2 px-3 flex justify-center items-center rounded-xl text-sm font-semibold transition-all ${role === 'admin' ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}
                                >
                                    Admin
                                </button>
                            </div>
                        </div>

                        {/* Username Input */}
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    id="username"
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        {/* Password Input */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-3 border border-slate-600 bg-slate-900/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-start gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Terms & Conditions Checkbox */}
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="terms"
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="w-5 h-5 text-indigo-600 bg-slate-900 border-slate-600 rounded focus:ring-indigo-500 cursor-pointer accent-indigo-500"
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="terms" className="font-medium text-slate-200 cursor-pointer flex flex-col gap-1">
                                        Accept Terms & Conditions
                                        <span className="text-slate-400 font-normal leading-relaxed">
                                            I agree to keep my location services ON while using this app. I authorize SafePath to share my live location with emergency contacts and nearby authorities during an SOS activation.
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-900 transition-all active:scale-[0.98]"
                            >
                                Sign In Securely
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}
