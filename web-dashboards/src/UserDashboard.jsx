import React, { useState } from 'react';
import { AlertTriangle, MapPin, Shield, Phone, Navigation } from 'lucide-react';

export default function UserDashboard() {
    const [sosActive, setSosActive] = useState(false);
    const [riskScore, setRiskScore] = useState(12); // Safe zone by default

    const handleSOS = async () => {
        setSosActive(true);
        // Mock SOS trigger delay
        await new Promise(resolve => setTimeout(resolve, 800));
        alert("SOS Triggered! Emergency contacts and nearby police have been notified with your live location. Help is on the way.");
        setTimeout(() => setSosActive(false), 5000); // Reset after 5s for demo
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col items-center">
            {/* Header */}
            <header className="w-full bg-white shadow-sm px-6 py-4 flex items-center justify-between border-b border-slate-200">
                <div className="flex items-center gap-2 text-[var(--primary)] font-bold text-xl">
                    <Shield size={28} />
                    SafePath App
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-slate-800">Hi, Priya</p>
                        <p className="text-xs text-slate-500">Premium User</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 border-2 border-white shadow-sm overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Priya" alt="Profile" />
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 w-full max-w-4xl p-6 space-y-6 flex flex-col md:flex-row gap-6">

                {/* Left Column: Safety Score & Quick Actions */}
                <div className="w-full md:w-1/3 flex flex-col space-y-6">
                    {/* Safety Score Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 flex flex-col items-center text-center relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50 opacity-50"></div>
                        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-4 z-10">Live Safety Score</h2>
                        <div className="relative w-40 h-40 rounded-full bg-white shadow-inner flex items-center justify-center mb-4 z-10 border-8 border-green-400 group-hover:scale-105 transition-transform duration-500">
                            <div className="flex flex-col items-center">
                                <span className="text-5xl font-black text-slate-800">{100 - riskScore}</span>
                                <span className="text-sm font-medium text-slate-400">/ 100</span>
                            </div>
                        </div>
                        <div className="z-10 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold flex items-center gap-2">
                            <Shield size={16} /> Safe Area
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-[var(--primary)] group">
                            <div className="bg-slate-50 p-3 rounded-full group-hover:bg-pink-50 transition-colors">
                                <Navigation size={24} />
                            </div>
                            <span className="text-sm font-medium">Safe Route</span>
                        </button>
                        <button className="bg-white p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col items-center justify-center gap-3 text-slate-600 hover:text-blue-600 group">
                            <div className="bg-slate-50 p-3 rounded-full group-hover:bg-blue-50 transition-colors">
                                <Phone size={24} />
                            </div>
                            <span className="text-sm font-medium">Fake Call</span>
                        </button>
                    </div>
                </div>

                {/* Right Column: SOS and Map placeholder */}
                <div className="w-full md:w-2/3 flex flex-col space-y-6">
                    {/* Giant SOS Button Area */}
                    <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                        <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/12/2923/1739.png')] bg-cover bg-center opacity-20 filter grayscale blur-[2px]"></div>

                        <button
                            onClick={handleSOS}
                            className={`relative z-10 w-48 h-48 rounded-full flex flex-col items-center justify-center border-[8px] transition-all duration-300 transform active:scale-95 ${sosActive ? 'bg-red-700 border-red-800 scale-95 shadow-[0_0_60px_rgba(220,38,38,0.6)]' : 'bg-red-500 hover:bg-red-600 border-red-400 shadow-[0_20px_50px_rgba(220,38,38,0.4)] hover:shadow-[0_20px_60px_rgba(220,38,38,0.6)]'}`}
                        >
                            {sosActive ? (
                                <AlertTriangle className="text-white mb-2 animate-bounce" size={48} />
                            ) : (
                                <Shield className="text-white/20 absolute w-full h-full p-4" />
                            )}
                            <span className="text-white text-5xl font-black tracking-widest z-10">SOS</span>
                            <span className="text-red-200 text-sm font-semibold mt-2 z-10 uppercase tracking-widest">
                                {sosActive ? 'Alert Sent' : 'Hold to Alert'}
                            </span>
                        </button>

                        <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 flex items-center justify-between z-10">
                            <div className="flex items-center gap-3 text-white">
                                <div className="p-2 bg-white/20 rounded-full">
                                    <MapPin size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">Current Location Sharing</p>
                                    <p className="text-xs text-slate-300">Connaught Place, New Delhi</p>
                                </div>
                            </div>
                            <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"></div>
                        </div>
                    </div>

                    {/* Nearby Activity Mini-Map Card */}
                    <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 flex-1 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <AlertTriangle className="text-[var(--secondary)]" size={20} /> Nearby Reports (24h)
                        </h3>
                        <div className="flex-1 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center relative overflow-hidden group hover:border-blue-400 transition-colors">
                            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/14/11693/6956.png')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>

                            {/* Fake pins */}
                            <div className="absolute top-1/4 left-1/3 text-orange-500 drop-shadow-md"><MapPin size={24} /></div>
                            <div className="absolute bottom-1/3 right-1/4 text-red-500 drop-shadow-md"><MapPin size={24} /></div>

                            <div className="z-10 bg-white/90 backdrop-blur px-4 py-2 rounded-full font-medium text-slate-700 shadow-sm border border-slate-200 pointer-events-none">
                                Interactive Map View
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

