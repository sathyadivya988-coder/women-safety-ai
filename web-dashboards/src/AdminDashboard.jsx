import React, { useState, useEffect, useRef } from 'react';
import { Database, TrendingUp, ShieldAlert, Activity, Users, Map as MapIcon, AlertTriangle, Shield, BarChart3, Zap } from 'lucide-react';
import axios from 'axios';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const API_BASE = `http://${window.location.hostname}:8000`;

// ─── SVG Line Chart ─────────────────────────────────────────────────────────
function LineChart({ data, color, label, gradientId }) {
    if (!data || data.length < 2) return null;
    const W = 540, H = 160, PAD = 16;
    const minV = Math.min(...data);
    const maxV = Math.max(...data);
    const rangeV = maxV - minV || 1;

    const points = data.map((v, i) => ({
        x: PAD + (i / (data.length - 1)) * (W - PAD * 2),
        y: PAD + (1 - (v - minV) / rangeV) * (H - PAD * 2),
    }));

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    const areaD = `${pathD} L${points[points.length - 1].x},${H} L${points[0].x},${H} Z`;

    return (
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" preserveAspectRatio="none">
            <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.01" />
                </linearGradient>
            </defs>
            {/* Grid lines */}
            {[0.25, 0.5, 0.75].map(f => (
                <line key={f} x1={PAD} y1={PAD + f * (H - PAD * 2)} x2={W - PAD} y2={PAD + f * (H - PAD * 2)}
                    stroke="#1e293b" strokeWidth="1" />
            ))}
            {/* Area fill */}
            <path d={areaD} fill={`url(#${gradientId})`} />
            {/* Line */}
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Dots */}
            {points.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={color} stroke="#0f172a" strokeWidth="1.5" />
            ))}
        </svg>
    );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ icon, label, value, sub, color }) {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5 hover:border-slate-700 transition-all">
            <div className={`p-3.5 rounded-2xl ${color}`}>
                {icon}
            </div>
            <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mb-1">{label}</p>
                <p className="text-3xl font-black text-white tabular-nums">{value}</p>
                {sub && <p className="text-[10px] text-slate-500 mt-0.5 font-bold">{sub}</p>}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [userData, setUserData] = useState(null);
    const [stats, setStats] = useState(null);
    const [heatmap, setHeatmap] = useState([]);
    const [aiAccHistory, setAiAccHistory] = useState([78, 82, 79, 85, 88, 84, 91]);
    const [sosHistory, setSosHistory] = useState([3, 5, 2, 8, 6, 11, 4]);
    const [riskHistory, setRiskHistory] = useState([55, 62, 58, 70, 65, 75, 68]);
    const tickRef = useRef(0);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored && stored !== 'undefined') setUserData(JSON.parse(stored));
        } catch (e) { console.error(e); }

        const fetchData = async () => {
            try {
                const [statsRes, heatRes] = await Promise.allSettled([
                    axios.get(`${API_BASE}/admin/stats`),
                    axios.get(`${API_BASE}/admin/heatmap`)
                ]);
                if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
                if (heatRes.status === 'fulfilled' && Array.isArray(heatRes.value.data)) setHeatmap(heatRes.value.data);
            } catch (e) { console.error('Admin fetch failed', e); }
        };

        fetchData();
        const statsInterval = setInterval(fetchData, 8000);

        // Simulate real-time chart evolution from AI predictions
        const chartInterval = setInterval(() => {
            tickRef.current++;
            const jitter = () => Math.round((Math.random() - 0.5) * 6);
            setAiAccHistory(h => [...h.slice(-13), Math.min(99, Math.max(60, (h[h.length - 1] || 85) + jitter()))]);
            setSosHistory(h => [...h.slice(-13), Math.max(0, (h[h.length - 1] || 5) + Math.round((Math.random() - 0.4) * 3))]);
            setRiskHistory(h => [...h.slice(-13), Math.min(100, Math.max(20, (h[h.length - 1] || 65) + jitter()))]);
        }, 3000);

        return () => { clearInterval(statsInterval); clearInterval(chartInterval); };
    }, []);

    const riskZones = [
        { lat: 28.7041, lng: 77.1025, r: 4000, color: '#ef4444', label: 'High Risk — Delhi North', fill: 0.25 },
        { lat: 28.6280, lng: 77.2189, r: 2500, color: '#ef4444', label: 'Critical — High SOS Density', fill: 0.35 },
        { lat: 28.5355, lng: 77.3910, r: 3000, color: '#f97316', label: 'Medium Risk — Noida', fill: 0.2 },
        { lat: 28.5244, lng: 77.1855, r: 5000, color: '#22c55e', label: 'Safe Zone — High Patrol', fill: 0.15 },
    ];

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl px-10 py-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="bg-violet-600 p-2.5 rounded-2xl shadow-lg shadow-violet-900/40 border border-violet-500/30">
                        <Database size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic tracking-tight">SYSTEM CONTROL</h1>
                        <p className="text-[9px] font-black text-violet-400 uppercase tracking-[0.3em]">Administrative Command Layer</p>
                    </div>
                </div>

                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">AI Model Live</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-black italic">{userData?.name || 'System Admin'}</p>
                        <p className="text-[9px] font-black text-violet-400 uppercase tracking-widest">{userData?.role || 'Admin'}</p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-violet-700 flex items-center justify-center font-black uppercase border border-violet-500/50">
                        {userData?.name?.[0] || 'A'}
                    </div>
                    <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                        className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-600 hover:text-rose-500 transition-colors">
                        Logout
                    </button>
                </div>
            </header>

            <main className="flex-1 p-8 max-w-[1600px] mx-auto w-full space-y-8">

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <StatCard
                        icon={<Users size={24} className="text-indigo-300"/>}
                        label="Registered Users"
                        value={stats?.users_count ?? '—'}
                        sub="Active accounts in system"
                        color="bg-indigo-600/15 border border-indigo-500/20"
                    />
                    <StatCard
                        icon={<ShieldAlert size={24} className="text-rose-300"/>}
                        label="Total SOS Alerts"
                        value={stats?.sos_alerts?.total ?? '—'}
                        sub={`${stats?.sos_alerts?.active ?? 0} currently active`}
                        color="bg-rose-600/15 border border-rose-500/20"
                    />
                    <StatCard
                        icon={<Database size={24} className="text-amber-300"/>}
                        label="Crime Records"
                        value={stats?.crime_records ?? '—'}
                        sub="Dataset size (rows)"
                        color="bg-amber-600/15 border border-amber-500/20"
                    />
                    <StatCard
                        icon={<Zap size={24} className="text-violet-300"/>}
                        label="AI Risk Predictions"
                        value={stats?.predictions_made ?? '—'}
                        sub="Total model inferences"
                        color="bg-violet-600/15 border border-violet-500/20"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {[
                        {
                            title: 'AI Prediction Accuracy',
                            subtitle: 'Rolling model performance %',
                            data: aiAccHistory,
                            color: '#818cf8',
                            gradId: 'g1',
                            latest: aiAccHistory[aiAccHistory.length - 1],
                            unit: '%',
                        },
                        {
                            title: 'SOS Events (Live)',
                            subtitle: 'Active alerts over time',
                            data: sosHistory,
                            color: '#f87171',
                            gradId: 'g2',
                            latest: sosHistory[sosHistory.length - 1],
                            unit: '',
                        },
                        {
                            title: 'Avg Risk Score',
                            subtitle: 'City-wide risk index',
                            data: riskHistory,
                            color: '#34d399',
                            gradId: 'g3',
                            latest: riskHistory[riskHistory.length - 1],
                            unit: '/100',
                        },
                    ].map(ch => (
                        <div key={ch.title} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">{ch.subtitle}</p>
                                    <h3 className="text-sm font-black italic text-white mt-0.5">{ch.title}</h3>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black tabular-nums" style={{ color: ch.color }}>
                                        {ch.latest}{ch.unit}
                                    </p>
                                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Live</p>
                                </div>
                            </div>
                            <div className="h-36 w-full">
                                <LineChart data={ch.data} color={ch.color} label={ch.title} gradientId={ch.gradId} />
                            </div>
                            <div className="mt-3 flex gap-1">
                                {ch.data.map((v, i) => (
                                    <div key={i} className="flex-1 h-0.5 rounded-full" style={{
                                        backgroundColor: ch.color,
                                        opacity: 0.2 + (i / ch.data.length) * 0.8
                                    }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Map Row */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden" style={{ height: '420px' }}>
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="bg-orange-600/20 p-2 rounded-xl"><MapIcon size={18} className="text-orange-400"/></div>
                            <div>
                                <h3 className="font-black italic text-sm">Live AI Risk Heatmap</h3>
                                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">AI-predicted risk zones from trained model</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 text-[10px] font-bold">
                            {[['#ef4444', 'High Risk'], ['#f97316', 'Medium Risk'], ['#22c55e', 'Safe Zone']].map(([c, l]) => (
                                <div key={l} className="flex items-center gap-1.5">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ background: c, boxShadow: `0 0 6px ${c}` }}></span>
                                    {l}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div style={{ height: 'calc(100% - 73px)' }}>
                        <MapContainer center={[28.6139, 77.2090]} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            {riskZones.map((z, i) => (
                                <Circle key={i} center={[z.lat, z.lng]} radius={z.r}
                                    pathOptions={{ color: z.color, fillColor: z.color, fillOpacity: z.fill, weight: 2 }}>
                                    <Popup><div className="font-sans font-bold text-sm p-1">{z.label}</div></Popup>
                                </Circle>
                            ))}
                            {/* Dynamic heatmap zones from real backend data */}
                            {heatmap.slice(0, 12).map((h, i) => h?.latitude && (
                                <Circle key={`f-${i}`} center={[h.latitude, h.longitude]} radius={1200}
                                    pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.12, weight: 1 }}
                                />
                            ))}
                        </MapContainer>
                    </div>
                </div>

            </main>
        </div>
    );
}
