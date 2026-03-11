import React, { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Search, Bell, Activity } from 'lucide-react';
// For MVP, we use lucide-react for icons instead of complex map setups

import { io } from 'socket.io-client';

export default function PoliceDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('sos'); // 'sos', 'risk', 'patrol'

    useEffect(() => {
        // Mock initial active alerts
        setAlerts([
            { id: '1', userId: 'USR-891', latitude: 28.7041, longitude: 77.1025 },
            { id: '2', userId: 'USR-442', latitude: 28.5355, longitude: 77.3910 }
        ]);

        // Mock real-time live SOS push after a delay
        const timer = setTimeout(() => {
            setAlerts(prev => [{ id: '3', userId: 'USR-999', latitude: 28.6139, longitude: 77.2090 }, ...prev]);
        }, 10000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex h-screen bg-slate-900 text-white font-sans">
            {/* Sidebar */}
            <div className="w-64 bg-slate-800 border-r border-slate-700 p-6 flex flex-col">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent flex items-center gap-2">
                    <AlertTriangle /> Police Panel
                </h1>
                <div className="mt-10 space-y-4">
                    <button
                        onClick={() => setActiveTab('sos')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'sos' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Live SOS Alerts
                    </button>
                    <button
                        onClick={() => setActiveTab('risk')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'risk' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Risk Zone Map
                    </button>
                    <button
                        onClick={() => setActiveTab('patrol')}
                        className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${activeTab === 'patrol' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
                    >
                        Patrol Units
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-slate-800 flex items-center justify-end px-10">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <Bell className="text-slate-400 hover:text-white cursor-pointer" />
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-slate-900"></span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full capitalize flex items-center justify-center font-bold">
                                HQ
                            </div>
                            <span className="font-medium text-slate-300">Central Command</span>
                        </div>
                    </div>
                </header>

                {/* Dashboard Body */}
                <div className="p-10 overflow-y-auto flex-1 flex gap-8 h-full">

                    {activeTab === 'sos' && (
                        <>
                            {/* Active Alerts List */}
                            <div className="w-1/3">
                                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                    <Activity className="text-red-500" /> Active Emergencies
                                </h2>
                                <div className="space-y-4">
                                    {alerts.length === 0 ? (
                                        <p className="text-slate-500 italic">No active emergencies.</p>
                                    ) : alerts.map(alert => (
                                        <div key={alert.id} className="bg-slate-800 p-5 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/5 relative overflow-hidden">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-bold rounded uppercase tracking-wider">
                                                    SOS Alert
                                                </span>
                                                <span className="text-slate-400 text-sm">Now</span>
                                            </div>
                                            <h3 className="font-medium text-lg text-white mb-1">User ID: {alert.userId}</h3>
                                            <p className="text-slate-400 text-sm flex items-center gap-1">
                                                <MapPin size={14} /> Lat: {alert.latitude.toFixed(4)}, Lng: {alert.longitude.toFixed(4)}
                                            </p>
                                            <button className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition-colors">
                                                Dispatch Unit
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Map Area Mockup */}
                            <div className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden relative shadow-2xl">
                                <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2923/1739.png')] bg-cover bg-center filter grayscale contrast-125"></div>

                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="p-4 bg-red-500/20 rounded-full animate-ping absolute"></div>
                                    <div className="w-6 h-6 bg-red-500 rounded-full border-4 border-slate-900 z-10 relative shadow-xl"></div>
                                    <div className="mt-2 bg-slate-900 border border-slate-700 px-4 py-2 rounded-lg shadow-2xl relative z-10 whitespace-nowrap">
                                        <p className="font-bold text-red-500">SOS Active</p>
                                        <p className="text-xs text-slate-400">Priya Sharma</p>
                                    </div>
                                </div>

                                <div className="absolute bottom-6 right-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-2xl">
                                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Live Status</h4>
                                    <div className="flex gap-4 text-sm">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-red-500">2</div>
                                            <div className="text-slate-500 text-xs">Active SOS</div>
                                        </div>
                                        <div className="w-px bg-slate-700"></div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-orange-500">5</div>
                                            <div className="text-slate-500 text-xs">High Warnings</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {activeTab === 'risk' && (
                        <div className="flex flex-col w-full h-full">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Activity className="text-orange-500" /> City Risk Zones (AI Predicted)
                            </h2>
                            <div className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden relative shadow-2xl">
                                <div className="absolute inset-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/12/2923/1739.png')] bg-cover bg-center filter grayscale contrast-125"></div>
                                {/* Heatmap overlays */}
                                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500/40 rounded-full blur-3xl mix-blend-screen"></div>
                                <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-orange-500/40 rounded-full blur-2xl mix-blend-screen"></div>
                                <div className="absolute top-1/2 left-2/3 w-32 h-32 bg-yellow-500/30 rounded-full blur-2xl mix-blend-screen"></div>

                                <div className="absolute bottom-6 left-6 bg-slate-900/90 backdrop-blur border border-slate-700 p-4 rounded-xl flex items-center gap-4">
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span> High Risk</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]"></span> Med. Risk</div>
                                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span> Low Risk</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'patrol' && (
                        <div className="flex flex-col w-full h-full">
                            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                                <Activity className="text-blue-500" /> Active Patrol Units
                            </h2>
                            <div className="flex gap-8 h-full">
                                <div className="w-1/3 space-y-4 overflow-y-auto pr-2">
                                    {[1, 2, 3].map(unit => (
                                        <div key={unit} className="bg-slate-800 p-5 rounded-2xl border border-blue-500/20 shadow-lg relative overflow-hidden flex items-center justify-between">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                            <div>
                                                <h3 className="font-bold text-white mb-1">Unit #{100 + unit}</h3>
                                                <p className="text-sm text-slate-400 flex items-center gap-1"><MapPin size={12} /> Sector {unit * 2}</p>
                                            </div>
                                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">Available</span>
                                        </div>
                                    ))}
                                    <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-lg relative overflow-hidden flex items-center justify-between opacity-60">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                        <div>
                                            <h3 className="font-bold text-white mb-1">Unit #104</h3>
                                            <p className="text-sm text-slate-400 flex items-center gap-1"><MapPin size={12} /> Sector 9</p>
                                        </div>
                                        <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full">Busy</span>
                                    </div>
                                </div>
                                <div className="flex-1 bg-slate-800 rounded-3xl border border-slate-700 overflow-hidden relative shadow-2xl">
                                    <div className="absolute inset-0 opacity-30 bg-[url('https://maps.wikimedia.org/osm-intl/12/2923/1739.png')] bg-cover bg-center filter grayscale contrast-125"></div>
                                    <div className="absolute top-1/3 left-1/3 p-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-slate-900 z-10"></div>
                                    <div className="absolute top-1/4 right-1/3 p-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-slate-900 z-10"></div>
                                    <div className="absolute bottom-1/3 right-1/4 p-2 bg-blue-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.8)] border-2 border-slate-900 z-10"></div>
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
