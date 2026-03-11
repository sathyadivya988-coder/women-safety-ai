import React, { useState } from 'react';
import { Database, TrendingUp, ShieldAlert, BarChart3, Users, Map } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
    const [uploadStatus, setUploadStatus] = useState(null);

    const handleUpload = async () => {
        setUploadStatus('Uploading...');
        try {
            // Mock backend call
            await new Promise(resolve => setTimeout(resolve, 500));
            setTimeout(() => {
                setUploadStatus('Data processed and model retrained successfully!');
                setTimeout(() => setUploadStatus(null), 3000);
            }, 1000);
        } catch (error) {
            setUploadStatus('Error parsing data. Is the backend running?');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
            {/* Navbar */}
            <nav className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                    <Database className="text-blue-600" /> System Admin Control Panel
                </h1>
                <div className="flex gap-4 items-center">
                    <div className="px-4 py-2 bg-slate-100 rounded-full text-sm font-medium text-slate-600">
                        AI Model Version: v2.4.1
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                        AD
                    </div>
                </div>
            </nav>

            <div className="flex-1 p-8 max-w-7xl mx-auto w-full flex flex-col gap-8">

                {/* Top Row: Quick Stats (Full Width) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-4">
                        <div className="p-4 bg-indigo-50 rounded-xl">
                            <Users className="text-indigo-600" size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">12.4K</div>
                            <div className="text-sm text-slate-500 font-medium">Active System Users</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-4">
                        <div className="p-4 bg-rose-50 rounded-xl">
                            <ShieldAlert className="text-rose-600" size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">842</div>
                            <div className="text-sm text-slate-500 font-medium">Total SOS Events</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center gap-4">
                        <div className="p-4 bg-emerald-50 rounded-xl">
                            <TrendingUp className="text-emerald-600" size={32} />
                        </div>
                        <div>
                            <div className="text-3xl font-black text-slate-800 tracking-tight">94.2%</div>
                            <div className="text-sm text-slate-500 font-medium">AI Prediction Accuracy</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row: Analytics & Map (Split) */}
                <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800">
                            <BarChart3 className="text-blue-500" /> AI Performance Analytics
                        </h2>
                        <div className="flex-1 w-full bg-slate-50 rounded-xl border border-slate-100 flex flex-col items-center justify-center p-8">
                            {/* Mock Chart Area */}
                            <div className="w-full h-full border-b-2 border-l-2 border-slate-200 relative flex items-end justify-between px-4 pt-8">
                                {[40, 65, 45, 80, 55, 90, 75].map((height, i) => (
                                    <div key={i} className="w-8 bg-blue-500/80 rounded-t-sm hover:bg-blue-600 transition-colors relative group" style={{ height: `${height}%` }}>
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                            {height}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm text-slate-500 font-medium">Weekly AI Detection Rate Trend</p>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                        <h2 className="text-xl font-bold mb-4 text-slate-800 flex items-center gap-2">
                            <Map className="text-orange-500" /> City Risk Heatmap View
                        </h2>
                        <div className="flex-1 bg-slate-200 rounded-xl overflow-hidden relative border border-slate-300">
                            <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/12/2923/1739.png')] bg-cover bg-center opacity-40"></div>

                            {/* Overlay heatmap blobs */}
                            <div className="absolute top-1/4 left-1/3 w-32 h-32 bg-red-500/40 rounded-full blur-2xl"></div>
                            <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-orange-500/30 rounded-full blur-2xl"></div>
                            <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl"></div>

                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs font-medium border border-slate-200">
                                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-red-500 rounded-sm"></div> High Risk</div>
                                <div className="flex items-center gap-2 mb-1"><div className="w-3 h-3 bg-orange-400 rounded-sm"></div> Medium Risk</div>
                                <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded-sm"></div> Safe Zone</div>
                            </div>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
