import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User as UserIcon, AlertCircle, Phone, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_BASE = `http://${window.location.hostname}:8000`;

export default function Login() {
    const navigate = useNavigate();

    const [isSignup, setIsSignup] = useState(false);
    const [role, setRole] = useState('user'); 
    const [username, setUsername] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');

        if (isSignup && !username) {
            setError('Please enter your full name.');
            return;
        }
        if (!phone || !password) {
            setError('Please enter both phone number and password.');
            return;
        }

        if (!termsAccepted) {
            setError('You must accept the terms and conditions regarding location sharing.');
            return;
        }

        setLoading(true);
        try {
            if (isSignup) {
                await axios.post(`${API_BASE}/signup`, {
                    name: username,
                    phone: phone,
                    password: password,
                    role: role
                });
                alert("Account created successfully! Please sign in.");
                setIsSignup(false);
            } else {
                const res = await axios.post(`${API_BASE}/login`, {
                    phone: phone,
                    password: password
                });
                const user = res.data.user;
                localStorage.setItem('user', JSON.stringify(user));
                
                const role = user.role?.toLowerCase();
                if (role === 'admin') navigate('/admin');
                else if (role === 'police') navigate('/police');
                else navigate('/user');
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Authentication failed. Make sure Backend is running.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
            <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                    <Shield size={32} className="text-white" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-white">
                    {isSignup ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    {isSignup ? 'Join the SafePath Ecosystem' : 'Sign in to access your secure dashboard'}
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-slate-800 py-8 px-4 shadow sm:rounded-3xl sm:px-10 border border-slate-700">
                    <form className="space-y-6" onSubmit={handleAuth}>
                        
                        {isSignup && (
                           <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Select Account Type</label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button type="button" onClick={() => setRole('user')} className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${role === 'user' ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>User</button>
                                    <button type="button" onClick={() => setRole('police')} className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${role === 'police' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Police</button>
                                    <button type="button" onClick={() => setRole('admin')} className={`py-2 px-3 rounded-xl text-sm font-semibold transition-all ${role === 'admin' ? 'bg-rose-600 text-white' : 'bg-slate-700 text-slate-400'}`}>Admin</button>
                                </div>
                           </div>
                        )}

                        {isSignup && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300">Full Name</label>
                                <div className="mt-1 relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <UserIcon className="h-5 w-5 text-slate-500" />
                                    </div>
                                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="block w-full pl-10 py-3 border border-slate-600 bg-slate-900 rounded-xl text-white focus:ring-indigo-500" placeholder="John Doe" />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Phone className="h-5 w-5 text-slate-500" />
                                </div>
                                <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} className="block w-full pl-10 py-3 border border-slate-600 bg-slate-900 rounded-xl text-white focus:ring-indigo-500" placeholder="9876543210" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <div className="mt-1 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-slate-500" />
                                </div>
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 py-3 border border-slate-600 bg-slate-900 rounded-xl text-white focus:ring-indigo-500" placeholder="••••••••" />
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-start gap-2 text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20 text-sm">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4">
                            <div className="flex items-start">
                                <input id="terms" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} className="w-5 h-5 mt-1 text-indigo-600 bg-slate-900 border-slate-600 rounded" />
                                <label htmlFor="terms" className="ml-3 text-sm text-slate-200">
                                    I agree to keep location services ON for emergency safety features.
                                </label>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                            {loading ? 'Processing...' : (isSignup ? 'Create Account' : 'Sign In Securely')}
                        </button>

                        <div className="text-center">
                            <button type="button" onClick={() => setIsSignup(!isSignup)} className="text-sm font-medium text-indigo-400 hover:text-indigo-300">
                                {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

