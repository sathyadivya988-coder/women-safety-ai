import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, MapPin, Activity, Shield, Users, Radio, Navigation, Phone, Heart, Clock, CheckCircle, Truck, User as UserIcon } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const API_BASE = `http://${window.location.hostname}:8000`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, shadowUrl: markerShadow });

const getRiskColor = (score) => {
    if (!score) return '#f97316';
    if (score > 70) return '#ef4444';
    if (score > 40) return '#f97316';
    return '#22c55e';
};

const getRiskLabel = (score) => {
    if (!score) return { label: 'MEDIUM RISK', cls: 'bg-orange-500/10 border-orange-500/30 text-orange-400' };
    if (score > 70) return { label: 'HIGH RISK', cls: 'bg-rose-500/10 border-rose-500/30 text-rose-400' };
    if (score > 40) return { label: 'MEDIUM RISK', cls: 'bg-orange-500/10 border-orange-500/30 text-orange-400' };
    return { label: 'LOW RISK', cls: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
};

const createRiskIcon = (score) => {
    const color = getRiskColor(score);
    return L.divIcon({
        className: '',
        html: `<div style="background:${color};width:16px;height:16px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px ${color};"></div>`,
        iconSize: [16, 16], iconAnchor: [8, 8]
    });
};

const patrolIcon = L.divIcon({
    className: '',
    html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:3px;border:2px solid white;transform:rotate(45deg);box-shadow:0 0 10px #3b82f6;"></div>`,
    iconSize: [14, 14], iconAnchor: [7, 7]
});

function MapHandler({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) { map.invalidateSize(); map.setView(center, map.getZoom()); }
    }, [center, map]);
    return null;
}

// Available patrol units for dispatch selection
const AVAILABLE_UNITS = [
    { id: 'P-101', name: 'Alpha Unit', eta: '4 min', status: 'Available' },
    { id: 'P-102', name: 'Bravo Unit', eta: '7 min', status: 'Available' },
    { id: 'P-103', name: 'Delta Squad', eta: '12 min', status: 'Patrolling' },
];

export default function PoliceDashboard() {
    const [alerts, setAlerts] = useState([]);
    const [activeTab, setActiveTab] = useState('sos');
    const [patrolUnits, setPatrolUnits] = useState([
        { id: 101, lat: 28.6139, lng: 77.2090, sector: 'North Sector', status: 'Available' },
        { id: 102, lat: 28.5355, lng: 77.3910, sector: 'East Zone', status: 'Patrolling' },
        { id: 103, lat: 28.7041, lng: 77.1025, sector: 'Central City', status: 'Busy' },
    ]);
    const [dispatchState, setDispatchState] = useState({}); // alertId -> { status, unit }
    const [selectedUnit, setSelectedUnit] = useState({}); // alertId -> unitId
    const prevAlertCount = useRef(0);

    const fetchAlerts = async () => {
        try {
            const res = await axios.get(`${API_BASE}/alerts`);
            const data = res.data || [];
            if (data.length > prevAlertCount.current) console.log('🚨 NEW SOS ALERT');
            prevAlertCount.current = data.length;
            setAlerts(data);
        } catch (e) { console.error('Fetch alerts failed', e); }
    };

    useEffect(() => {
        fetchAlerts();
        const alertInterval = setInterval(fetchAlerts, 5000);
        const patrolInterval = setInterval(() => {
            setPatrolUnits(p => p.map(u => ({ ...u, lat: u.lat + (Math.random() - 0.5) * 0.002, lng: u.lng + (Math.random() - 0.5) * 0.002 })));
        }, 3000);
        return () => { clearInterval(alertInterval); clearInterval(patrolInterval); };
    }, []);

    const handleDispatch = async (alertId) => {
        const unit = selectedUnit[alertId] || AVAILABLE_UNITS[0].id;
        try {
            await axios.post(`${API_BASE}/dispatch`, { alert_id: alertId });
            setDispatchState(prev => ({ ...prev, [alertId]: { status: 'dispatched', unit } }));
            fetchAlerts();
        } catch (e) {
            console.error('Dispatch fail', e);
        }
    };

    const isDispatched = (id) => dispatchState[id]?.status === 'dispatched';

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-6">
                <div className="flex items-center gap-3 mb-12">
                    <div className="bg-rose-600 p-2.5 rounded-2xl shadow-lg shadow-rose-900/40 border border-rose-500/30">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tight italic">GUARD COMMAND</h1>
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Sector 47 HQ</span>
                    </div>
                </div>

                <nav className="space-y-3 flex-1">
                    {[
                        { id: 'sos', label: 'Live SOS Alerts', icon: <Radio size={16}/>, activeClass: 'bg-rose-600/10 border-rose-500/40 text-rose-400' },
                        { id: 'patrol', label: 'Patrol Units', icon: <Navigation size={16}/>, activeClass: 'bg-blue-600/10 border-blue-500/40 text-blue-400' },
                        { id: 'risk', label: 'City Risk Map', icon: <Activity size={16}/>, activeClass: 'bg-emerald-600/10 border-emerald-500/40 text-emerald-400' },
                    ].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all border ${activeTab === tab.id ? tab.activeClass : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'}`}>
                            {tab.icon} {tab.label}
                        </button>
                    ))}
                </nav>

                <button onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                    className="mt-6 w-full py-3 text-[10px] font-black uppercase text-slate-600 hover:text-rose-500 tracking-[0.3em] transition-colors border-t border-slate-800 pt-4">
                    Terminate Session
                </button>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="h-20 border-b border-slate-800/60 bg-slate-950/80 flex items-center justify-between px-10 flex-shrink-0">
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2 text-xs font-black"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>ALL SYSTEMS NOMINAL</span>
                        {alerts.length > 0 && (
                            <span className="flex items-center gap-2 text-xs font-black text-rose-400 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span>{alerts.length} ACTIVE SOS
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-sm font-black italic">Inspector HQ-01</p>
                            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Duty Commander</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-black">HQ</div>
                    </div>
                </header>

                {/* Body */}
                <div className="flex-1 overflow-hidden flex gap-6 p-6">

                    {/* === LIVE SOS TAB === */}
                    {activeTab === 'sos' && (
                        <>
                            {/* Scrollable Alert Cards */}
                            <div className="w-[440px] flex-shrink-0 flex flex-col gap-4 overflow-y-auto pr-2" style={{scrollbarWidth:'thin', scrollbarColor:'#334155 transparent'}}>
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex items-center gap-2 flex-shrink-0">
                                    <Activity size={14} className="text-rose-500" /> Response Queue ({alerts.length})
                                </h2>

                                {alerts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center text-slate-600 py-20 space-y-3">
                                        <Shield size={40} strokeWidth={1}/>
                                        <p className="text-[10px] uppercase tracking-widest text-center">No active emergencies.</p>
                                    </div>
                                ) : alerts.map(alert => {
                                    const risk = getRiskLabel(alert.risk_score);
                                    const dispatched = isDispatched(alert.id);
                                    const unitId = selectedUnit[alert.id] || AVAILABLE_UNITS[0].id;
                                    const chosenUnit = AVAILABLE_UNITS.find(u => u.id === unitId) || AVAILABLE_UNITS[0];

                                    return (
                                        <div key={alert.id}
                                            className={`rounded-2xl border-2 transition-all ${dispatched ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-rose-500/20 bg-slate-900 hover:border-rose-500/40'}`}>

                                            {/* Card Header */}
                                            <div className="flex items-start justify-between p-4 pb-3 border-b border-slate-800">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center ${dispatched ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`}>
                                                        {dispatched ? <CheckCircle size={18} className="text-emerald-400"/> : <AlertTriangle size={18} className="text-rose-400"/>}
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{dispatched ? 'Dispatch Confirmed' : 'SOS — Active Emergency'}</p>
                                                        <p className="text-xs font-black text-white mt-0.5">Alert #{alert.id}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full border ${risk.cls}`}>
                                                    {risk.label}
                                                </span>
                                            </div>

                                            {/* User Info */}
                                            <div className="p-4 space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-indigo-600/20 flex items-center justify-center">
                                                        <UserIcon size={15} className="text-indigo-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Victim Name</p>
                                                        <p className="text-sm font-black text-white">{alert.user_name || 'Unknown User'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center">
                                                        <Phone size={14} className="text-blue-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Contact Number</p>
                                                        <p className="text-sm font-bold text-blue-300">{alert.user_phone || 'Not Available'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-rose-600/20 flex items-center justify-center">
                                                        <Heart size={14} className="text-rose-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Emergency Contact</p>
                                                        <p className="text-sm font-bold text-rose-300">{alert.emergency_contact || 'None Registered'}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-slate-700 flex items-center justify-center">
                                                        <MapPin size={14} className="text-slate-300"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">GPS Coordinates</p>
                                                        <p className="text-[11px] font-mono text-slate-300">{alert.latitude?.toFixed(5)}, {alert.longitude?.toFixed(5)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-amber-600/20 flex items-center justify-center">
                                                        <Clock size={14} className="text-amber-400"/>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Reported At</p>
                                                        <p className="text-[11px] font-mono text-amber-300">
                                                            {alert.created_at ? new Date(alert.created_at).toLocaleTimeString() : 'Just Now'}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Risk Score Badge */}
                                                <div className="bg-slate-800/60 rounded-xl p-3 flex items-center justify-between">
                                                    <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">AI Risk Assessment</span>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-2 h-2 rounded-full" style={{background: getRiskColor(alert.risk_score), boxShadow: `0 0 8px ${getRiskColor(alert.risk_score)}`}}></div>
                                                        <span className="font-black text-sm">{alert.risk_score?.toFixed(0) ?? '—'} / 100</span>
                                                    </div>
                                                </div>

                                                {/* Unit Dispatch Selector */}
                                                {!dispatched && (
                                                    <div className="pt-2">
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Assign Patrol Unit</p>
                                                        <div className="space-y-2">
                                                            {AVAILABLE_UNITS.map(u => (
                                                                <label key={u.id}
                                                                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${(selectedUnit[alert.id] || AVAILABLE_UNITS[0].id) === u.id ? 'border-indigo-500/60 bg-indigo-600/10' : 'border-slate-700 hover:border-slate-600'}`}>
                                                                    <div className="flex items-center gap-3">
                                                                        <input type="radio" name={`unit-${alert.id}`} value={u.id}
                                                                            checked={(selectedUnit[alert.id] || AVAILABLE_UNITS[0].id) === u.id}
                                                                            onChange={() => setSelectedUnit(p => ({...p, [alert.id]: u.id}))}
                                                                            className="w-3.5 h-3.5 accent-indigo-500"/>
                                                                        <div>
                                                                            <p className="text-xs font-black">{u.name}</p>
                                                                            <p className="text-[9px] text-slate-500 uppercase">{u.status}</p>
                                                                        </div>
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">ETA {u.eta}</span>
                                                                </label>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Dispatch Button */}
                                                <button
                                                    onClick={() => handleDispatch(alert.id)}
                                                    disabled={dispatched}
                                                    className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${dispatched
                                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-default'
                                                        : 'bg-rose-600 hover:bg-rose-500 text-white active:scale-95 shadow-lg shadow-rose-900/30'}`}>
                                                    {dispatched
                                                        ? <><CheckCircle size={16}/> {dispatchState[alert.id]?.unit} Dispatched</>
                                                        : <><Truck size={16}/> Deploy {chosenUnit.name}</>}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Live Map */}
                            <div className="flex-1 rounded-3xl border-2 border-slate-800 overflow-hidden relative shadow-2xl">
                                <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {alerts.filter(a => a?.latitude).map(alert => (
                                        <React.Fragment key={alert.id}>
                                            <Marker position={[alert.latitude, alert.longitude]} icon={createRiskIcon(alert.risk_score)}>
                                                <Popup><div className="font-sans font-bold text-sm p-1">🆘 {alert.user_name || 'Unknown'}<br/><span className="text-xs text-slate-500">Risk: {alert.risk_score?.toFixed(0) ?? '?'}</span></div></Popup>
                                            </Marker>
                                            <Circle center={[alert.latitude, alert.longitude]} radius={800} pathOptions={{ color: getRiskColor(alert.risk_score), fillOpacity: 0.15, weight: 1.5 }} />
                                        </React.Fragment>
                                    ))}
                                    {alerts.length > 0 && <MapHandler center={[alerts[0].latitude, alerts[0].longitude]} />}
                                </MapContainer>

                                {/* Legend */}
                                <div className="absolute top-5 right-5 z-[500] bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl text-xs space-y-2.5">
                                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mb-3">Risk Legend</p>
                                    {[['#ef4444', 'High Priority (>70)'], ['#f97316', 'Medium Risk (40-70)'], ['#22c55e', 'Low Risk (<40)']].map(([c, l]) => (
                                        <div key={l} className="flex items-center gap-2 font-bold">
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background: c, boxShadow: `0 0 8px ${c}`}}></span> {l}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* === PATROL UNITS TAB === */}
                    {activeTab === 'patrol' && (
                        <div className="flex w-full gap-6 overflow-hidden">
                            <div className="w-64 flex-shrink-0 flex flex-col gap-4 overflow-y-auto">
                                <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 flex-shrink-0 flex items-center gap-2">
                                    <Users size={14} className="text-blue-400"/> Field Units ({patrolUnits.length})
                                </h2>
                                {patrolUnits.map(unit => (
                                    <div key={unit.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-blue-600/20 rounded-xl flex items-center justify-center"><Navigation size={15} className="text-blue-400"/></div>
                                                <div>
                                                    <p className="font-black text-sm">Unit #{unit.id}</p>
                                                    <p className="text-[9px] uppercase font-black text-slate-500">{unit.sector}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full border ${unit.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-orange-500/10 text-orange-400 border-orange-500/30'}`}>
                                                {unit.status}
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-mono text-slate-500 mt-2">{unit.lat.toFixed(4)}, {unit.lng.toFixed(4)}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex-1 rounded-3xl border-2 border-slate-800 overflow-hidden relative shadow-2xl">
                                <MapContainer center={[28.6139, 77.2090]} zoom={12} scrollWheelZoom style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {patrolUnits.map(u => (
                                        <Marker key={u.id} position={[u.lat, u.lng]} icon={patrolIcon}>
                                            <Popup><div className="font-sans font-bold text-sm">Unit #{u.id} — {u.status}</div></Popup>
                                        </Marker>
                                    ))}
                                </MapContainer>
                                <div className="absolute top-5 left-5 z-[500] bg-blue-600 text-white px-5 py-2 rounded-xl font-black italic text-xs shadow-lg shadow-blue-900/40">
                                    ● LIVE TRACKING ACTIVE
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === CITY RISK MAP TAB === */}
                    {activeTab === 'risk' && (
                        <div className="flex-1 rounded-3xl border-2 border-slate-800 overflow-hidden relative shadow-2xl">
                            <MapContainer center={[28.6139, 77.2090]} zoom={11} scrollWheelZoom style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Circle center={[28.7041, 77.1025]} radius={3000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.2, weight: 2 }}>
                                    <Popup><strong>High Risk Zone</strong><br/>North Delhi Sector</Popup>
                                </Circle>
                                <Circle center={[28.5355, 77.3910]} radius={2500} pathOptions={{ color: '#f97316', fillColor: '#f97316', fillOpacity: 0.2, weight: 2 }}>
                                    <Popup><strong>Medium Risk Zone</strong><br/>Noida Sector</Popup>
                                </Circle>
                                <Circle center={[28.5562, 77.1000]} radius={4500} pathOptions={{ color: '#22c55e', fillColor: '#22c55e', fillOpacity: 0.2, weight: 2 }}>
                                    <Popup><strong>Low Risk Zone</strong><br/>South Delhi Sector</Popup>
                                </Circle>
                            </MapContainer>

                            {/* Legend */}
                            <div className="absolute top-5 left-5 z-[500] bg-slate-900/95 border border-slate-700 p-5 rounded-2xl shadow-2xl space-y-3 max-w-xs">
                                <h3 className="font-black italic text-base">City Risk Topology</h3>
                                <p className="text-[10px] text-slate-400 leading-relaxed">AI-predicted crime risk zones based on historical data. Patrol allocation should prioritize Red zones.</p>
                                <div className="space-y-2 pt-2 border-t border-slate-800">
                                    {[['#ef4444','High Risk Zone'], ['#f97316','Medium Risk Zone'], ['#22c55e','Low Risk Zone']].map(([c, l]) => (
                                        <div key={l} className="flex items-center gap-2 text-[10px] font-bold">
                                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{background: c, boxShadow: `0 0 8px ${c}`}}></span> {l}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
