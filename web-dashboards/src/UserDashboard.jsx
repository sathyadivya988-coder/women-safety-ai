import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, MapPin, Shield, Phone, Navigation, User, Bell, ChevronRight, Activity, Search, X, Map as MapIcon, PhoneIncoming, PhoneOff, Mic, Video, Volume2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Circle, Polyline, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import L from 'leaflet';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const API_BASE = `http://${window.location.hostname}:8000`;

// Standardize marker icon
let customIcon = null;
try {
    customIcon = new L.Icon({
        iconUrl: markerIcon,
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
} catch (e) {
    console.error("Leaflet icon init failed", e);
}

// Custom landmark icons
const policeIcon = L.divIcon({
    className: '',
    html: `<div style="background:#1e3a8a;border:2px solid #3b82f6;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 12px rgba(59,130,246,0.7);">🚔</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
});

const hospitalIcon = L.divIcon({
    className: '',
    html: `<div style="background:#7f1d1d;border:2px solid #ef4444;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 0 12px rgba(239,68,68,0.7);">🏥</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
});

// Generate nearby landmarks relative to user's location
const getNearbyLandmarks = (lat, lng) => ([
    // Police Stations
    { type: 'police', lat: lat + 0.009, lng: lng + 0.006, name: 'Local Police Station', dist: '~900m' },
    { type: 'police', lat: lat - 0.012, lng: lng + 0.010, name: 'Central Police Station', dist: '~1.5km' },
    // Hospitals
    { type: 'hospital', lat: lat + 0.006, lng: lng - 0.008, name: 'City General Hospital', dist: '~700m' },
    { type: 'hospital', lat: lat - 0.008, lng: lng - 0.012, name: 'Emergency Care Center', dist: '~1.2km' },
]);

// Robust Map Handler for 'Partial Render' fix
function MapHandler({ center, zoom = 15 }) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        
        const triggerInvalidate = () => {
            map.invalidateSize();
            if (center?.lat && center?.lng) {
                map.setView([center.lat, center.lng], map.getZoom());
            }
        };

        triggerInvalidate();
        const t = setTimeout(triggerInvalidate, 500);
        return () => clearTimeout(t);
    }, [map, center, zoom]);

    return null;
}

// Realistic Fake Call Overlay Component
function FakeCallOverlay({ onEnd }) {
    const [duration, setDuration] = useState(0);
    const [callState, setCallState] = useState("Incoming...");

    useEffect(() => {
        let interval;
        if (callState === "Connected") {
            interval = setInterval(() => setDuration(d => d + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [callState]);

    const formatTime = (s) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[5000] bg-slate-900 flex flex-col items-center justify-between p-12 animate-in fade-in duration-500">
            <div className="text-center mt-20 space-y-4">
                <div className="w-32 h-32 rounded-full bg-slate-800 border-4 border-slate-700 mx-auto flex items-center justify-center text-slate-400">
                    <User size={64} />
                </div>
                <h2 className="text-3xl font-bold text-white">Dad (Home)</h2>
                <p className={`text-lg font-medium tracking-wide transition-colors ${callState === "Connected" ? "text-emerald-400" : "text-slate-400 animate-pulse"}`}>
                    {callState === "Connected" ? formatTime(duration) : "Incoming Safety Call..."}
                </p>
            </div>

            <div className="w-full max-w-sm space-y-12 mb-20">
                {callState === "Incoming..." ? (
                    <div className="flex justify-around items-center">
                        <button onClick={onEnd} className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl hover:bg-rose-700 active:scale-90 transition-all">
                            <PhoneOff size={32} />
                        </button>
                        <button onClick={() => setCallState("Connected")} className="w-20 h-20 rounded-full bg-emerald-600 flex items-center justify-center text-white shadow-2xl hover:bg-emerald-700 active:scale-95 animate-bounce">
                            <PhoneIncoming size={32} />
                        </button>
                    </div>
                ) : (
                    <div className="space-y-12">
                         <div className="grid grid-cols-3 gap-8">
                            {[ {icon: <Mic size={24}/>, label: "Mute"}, {icon: <Video size={24}/>, label: "Video"}, {icon: <Volume2 size={24}/>, label: "Speaker"} ].map((tool, i) => (
                                <div key={i} className="flex flex-col items-center gap-2">
                                    <button className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 hover:bg-slate-700 transition-colors">
                                        {tool.icon}
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{tool.label}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <button onClick={onEnd} className="w-20 h-20 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-2xl hover:bg-rose-700 active:scale-90 transition-all">
                                <PhoneOff size={32} />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">SafePath AI Calling Service</p>
        </div>
    );
}

export default function UserDashboard() {
    const [sosActive, setSosActive] = useState(false);
    const [riskScore, setRiskScore] = useState(15); 
    const [location, setLocation] = useState({ lat: 28.7041, lng: 77.1025 });
    const [locationError, setLocationError] = useState(null);
    const [userData, setUserData] = useState(null);
    const [liveStatus, setLiveStatus] = useState("Scanning...");
    
    // Emergency Contacts State (max 3)
    const [emergencyContacts, setEmergencyContacts] = useState([]);
    const [newContactInput, setNewContactInput] = useState('');
    const [contactSaveStatus, setContactSaveStatus] = useState(null);
    const MAX_CONTACTS = 3;
    
    // Safe Route States
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [destination, setDestination] = useState("");
    const [routePath, setRoutePath] = useState(null);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);

    // Fake Call State
    const [showFakeCall, setShowFakeCall] = useState(false);

    const fetchRisk = useCallback(async (lat, lng) => {
        if (!lat || !lng) return;
        try {
            const res = await axios.post(`${API_BASE}/predict-risk`, {
                latitude: lat,
                longitude: lng,
                STATE_UT: "DELHI", 
                DISTRICT: "CENTRAL",
                YEAR: 2026,
                MURDER: 1, RAPE: 2, KIDNAPPING: 5, ROBBERY: 4, BURGLARY: 2, THEFT: 10, RIOTS: 0, ASSAULT: 5, CRUELTY: 5
            });
            if (res.data && res.data["Safety Score"] !== undefined) {
                const s = res.data["Safety Score"];
                setRiskScore(100 - s);
                setLiveStatus(s > 70 ? "Safe Zone" : s > 40 ? "Take Caution" : "High Danger Zone");
            }
        } catch (error) {
            console.error("Risk API fail", error);
        }
    }, []);

    useEffect(() => {
        try {
            const stored = localStorage.getItem('user');
            if (stored && stored !== "undefined") {
                const parsedUser = JSON.parse(stored);
                setUserData(parsedUser);
                if (parsedUser.emergency_contact) {
                    try {
                        const parsed = JSON.parse(parsedUser.emergency_contact);
                        setEmergencyContacts(Array.isArray(parsed) ? parsed.slice(0, 3) : [parsedUser.emergency_contact]);
                    } catch {
                        // Old format: single string
                        setEmergencyContacts([parsedUser.emergency_contact]);
                    }
                }
            }
        } catch (e) { console.error(e); }

        let watchId = null;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                pos => {
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    setLocation({ lat, lng });
                    setLocationError(null);
                    fetchRisk(lat, lng);
                },
                err => setLocationError("GPS Signal Weak"),
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        }
        return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
    }, [fetchRisk]);

    const handleSafeRouteRequest = () => {
        if (!destination) return;
        setIsCalculatingRoute(true);
        
        setTimeout(() => {
            const mockPath = [
                [location.lat, location.lng],
                [location.lat + 0.005, location.lng + 0.003],
                [location.lat + 0.012, location.lng + 0.008],
                [location.lat + 0.018, location.lng + 0.015]
            ];
            setRoutePath(mockPath);
            setIsCalculatingRoute(false);
            setShowRouteModal(false);
            setLiveStatus("Safest Route Calculated");
            setRiskScore(prev => Math.max(10, prev - 20)); 
            alert(`Safe Route to ${destination} optimized via High-Patrol areas.`);
        }, 1500);
    };

    const handleSOS = async () => {
        setSosActive(true);
        try {
            await axios.post(`${API_BASE}/sos-alert`, {
                user_id: userData?.id || 1,
                latitude: location.lat,
                longitude: location.lng
            });
        } catch (e) { console.error("SOS failed", e); }
        setTimeout(() => setSosActive(false), 5000);
    };

    const handleSaveEmergencyContacts = async (updatedContacts) => {
        setContactSaveStatus('saving');
        const jsonStr = JSON.stringify(updatedContacts);
        try {
            await axios.patch(`${API_BASE}/user/${userData?.id}/emergency-contact`, {
                emergency_contact: jsonStr
            });
            try {
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                stored.emergency_contact = jsonStr;
                localStorage.setItem('user', JSON.stringify(stored));
            } catch(e) {}
            setContactSaveStatus('saved');
            setTimeout(() => setContactSaveStatus(null), 2500);
        } catch (e) {
            console.error('Failed to save emergency contacts', e);
            setContactSaveStatus('error');
            setTimeout(() => setContactSaveStatus(null), 3000);
        }
    };

    const handleAddContact = () => {
        const trimmed = newContactInput.trim();
        if (!trimmed || emergencyContacts.length >= MAX_CONTACTS) return;
        const updated = [...emergencyContacts, trimmed];
        setEmergencyContacts(updated);
        setNewContactInput('');
        handleSaveEmergencyContacts(updated);
    };

    const handleRemoveContact = (index) => {
        const updated = emergencyContacts.filter((_, i) => i !== index);
        setEmergencyContacts(updated);
        handleSaveEmergencyContacts(updated);
    };

    const safetyValue = 100 - riskScore;
    const safetyColorClass = safetyValue > 70 ? 'text-emerald-400' : safetyValue > 40 ? 'text-amber-400' : 'text-rose-400';
    const safetyBorderClass = safetyValue > 70 ? 'border-emerald-500' : safetyValue > 40 ? 'border-amber-500' : 'border-rose-500';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
            {showFakeCall && <FakeCallOverlay onEnd={() => setShowFakeCall(false)} />}
            
            {/* Header */}
            <header className="sticky top-0 z-[1000] w-full border-b border-slate-800/60 bg-slate-900/80 backdrop-blur-xl px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 p-2.5 rounded-2xl text-white shadow-lg shadow-indigo-500/20">
                            <Shield size={22} strokeWidth={2.5} />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent italic">SafePath AI</h1>
                            <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                </span>
                                Dark Guardian Active
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Bell size={20} />
                        </button>
                        <div className="hidden sm:flex items-center gap-4 border-l border-slate-800 pl-6">
                            <div className="text-right">
                                <p className="text-sm font-bold text-white">{userData?.name || "Cyber Guard"}</p>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{userData?.role || "Citizen"}</p>
                            </div>
                            <button 
                                onClick={() => { localStorage.removeItem('user'); window.location.href = '/'; }}
                                className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-slate-700 transition-all border border-slate-700"
                            >
                                <User size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Score & Controls */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="glass-card rounded-[2.5rem] p-10 relative group overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-[60px]" />
                        <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-12">Security Index</h3>
                        <div className="flex flex-col items-center">
                            <div className={`relative w-52 h-52 rounded-full border-[14px] flex items-center justify-center shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-1000 ${safetyBorderClass} bg-slate-900 group-hover:scale-105`}>
                                <div className="flex flex-col items-center">
                                    <span className="text-7xl font-black text-white tracking-tighter tabular-nums">{safetyValue}</span>
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Safety Score</span>
                                </div>
                            </div>
                            <div className="mt-10 text-center space-y-2">
                                <p className={`text-xl font-black italic ${safetyColorClass}`}>{liveStatus}</p>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Autonomous Risk Assessment</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => setShowRouteModal(true)}
                            className="glass-card p-6 rounded-3xl flex flex-col items-center gap-3 text-slate-400 hover:text-white hover:neon-border transition-all group"
                        >
                            <div className="bg-slate-800 p-3.5 rounded-2xl group-hover:bg-indigo-600/20 group-hover:text-indigo-400 transition-colors"><Navigation size={24} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Safe Route</span>
                        </button>
                        <button 
                            onClick={() => setShowFakeCall(true)}
                            className="glass-card p-6 rounded-3xl flex flex-col items-center gap-3 text-slate-400 hover:text-white hover:neon-border transition-all group"
                        >
                            <div className="bg-slate-800 p-3.5 rounded-2xl group-hover:bg-slate-700 transition-colors"><Phone size={24} /></div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Fake Call</span>
                        </button>
                    </div>

                    {/* Emergency Contact Panel — max 3 */}
                    <div className="glass-card rounded-3xl p-6 border border-rose-500/10">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-[11px] font-black text-rose-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Phone size={13}/> Emergency Contacts
                            </h4>
                            <span className={`text-[9px] font-black px-2 py-1 rounded-full border ${
                                emergencyContacts.length >= MAX_CONTACTS
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                    : 'bg-slate-800 border-slate-700 text-slate-500'
                            }`}>
                                {emergencyContacts.length}/{MAX_CONTACTS}
                            </span>
                        </div>

                        {/* Saved Contacts List */}
                        <div className="space-y-2 mb-4">
                            {emergencyContacts.length === 0 && (
                                <p className="text-[10px] text-slate-600 text-center py-3 italic">No contacts added yet.</p>
                            )}
                            {emergencyContacts.map((contact, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800 group">
                                    <div className="w-7 h-7 rounded-lg bg-rose-600/20 flex items-center justify-center flex-shrink-0">
                                        <span className="text-rose-400 font-black text-xs">{idx + 1}</span>
                                    </div>
                                    <p className="text-sm font-bold text-white flex-1 truncate">{contact}</p>
                                    <button
                                        onClick={() => handleRemoveContact(idx)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-400 flex-shrink-0 p-1">
                                        <X size={14}/>
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Add New Contact Input */}
                        {emergencyContacts.length < MAX_CONTACTS ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newContactInput}
                                    onChange={e => setNewContactInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleAddContact()}
                                    placeholder={`Contact ${emergencyContacts.length + 1}: e.g. Mom - 9876543210`}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                                />
                                <button
                                    onClick={handleAddContact}
                                    disabled={!newContactInput.trim() || contactSaveStatus === 'saving'}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                                    {contactSaveStatus === 'saving' ? 'Saving...' : '+ Add Contact'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-2">
                                <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Maximum 3 contacts reached</p>
                                <p className="text-[9px] text-slate-600 mt-1">Remove a contact to add a new one.</p>
                            </div>
                        )}

                        {/* Status feedback */}
                        {contactSaveStatus === 'saved' && (
                            <p className="text-[10px] text-emerald-400 font-bold text-center mt-2">✓ Contacts saved to your profile</p>
                        )}
                        {contactSaveStatus === 'error' && (
                            <p className="text-[10px] text-rose-400 font-bold text-center mt-2">Failed to save. Check connection.</p>
                        )}
                        <p className="text-[9px] text-slate-600 italic mt-3">Contacts are shared with police during SOS.</p>
                    </div>

                    <div className="glass-card rounded-3xl p-8">
                        <h4 className="text-[11px] font-black text-indigo-400 uppercase mb-6 tracking-[0.2em]">Priority SOS Hub</h4>
                        <div className="space-y-4">
                            {[ {name: "Emergency Police", num: "100", icon: <Shield size={16}/>}, {name: "Women Safety Line", num: "1091", icon: <Phone size={16}/>} ].map((c, i) => (
                                <a key={i} href={`tel:${c.num}`} className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/40 hover:bg-slate-800/80 transition-all border border-slate-800 group">
                                    <div className="flex items-center gap-4">
                                        <div className="text-indigo-400">{c.icon}</div>
                                        <div>
                                            <p className="text-sm font-bold text-white">{c.name}</p>
                                            <p className="text-xs text-slate-500 font-mono tracking-wider">{c.num}</p>
                                        </div>
                                    </div>
                                    <ChevronRight size={18} className="text-slate-600 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Viewport */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="glass-card rounded-[3rem] h-[480px] relative shadow-2xl overflow-hidden border-2 border-slate-800/40">
                        <div className="absolute inset-0 z-0">
                            {location?.lat && (
                                <MapContainer center={[location.lat, location.lng]} zoom={15} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[location.lat, location.lng]} icon={customIcon}>
                                        <Popup><div className="font-sans font-bold text-sm">📍 You are here</div></Popup>
                                    </Marker>
                                    {routePath && <Polyline positions={routePath} color="#6366f1" weight={6} opacity={1} />}
                                    {/* Police Stations & Hospitals */}
                                    {getNearbyLandmarks(location.lat, location.lng).map((lm, i) => (
                                        <Marker key={i} position={[lm.lat, lm.lng]} icon={lm.type === 'police' ? policeIcon : hospitalIcon}>
                                            <Popup>
                                                <div className="font-sans p-1">
                                                    <strong className="text-sm">{lm.type === 'police' ? '🚔 ' : '🏥 '}{lm.name}</strong>
                                                    <p className="text-xs text-gray-600 mt-1">Distance: {lm.dist}</p>
                                                    <p className="text-xs text-blue-600 font-bold mt-1">{lm.type === 'police' ? 'Call: 100' : 'Call: 108'}</p>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    ))}
                                    <MapHandler center={location} />
                                </MapContainer>
                            )}
                        </div>
                        
                        {/* Map HUD */}
                        <div className="absolute top-8 left-8 z-[500] bg-white/90 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-2xl min-w-[220px]">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-500/30"><MapPin size={16} /></div>
                                <span className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Coords</span>
                            </div>
                            <div className="space-y-1 font-mono text-[10px] text-indigo-600 font-bold">
                                <p>LAT: {location.lat.toFixed(6)}</p>
                                <p>LNG: {location.lng.toFixed(6)}</p>
                            </div>
                        </div>

                        {/* SOS COMMAND */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <button 
                                onClick={handleSOS} 
                                className={`pointer-events-auto group h-48 w-48 rounded-full flex flex-col items-center justify-center border-[14px] transition-all duration-500 active:scale-90 ${sosActive ? 'bg-rose-800 border-rose-900 sos-glow scale-110' : 'bg-rose-600 border-white shadow-2xl hover:bg-rose-500'}`}
                            >
                                <span className="text-white text-5xl font-black italic tracking-tighter drop-shadow-2xl">SOS</span>
                                <span className="text-white/40 text-[9px] font-black uppercase tracking-widest mt-2 group-hover:text-white/80 transition-colors">Emergency Protocol</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="glass-card rounded-[2.5rem] p-8 h-[280px] flex flex-col">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Activity size={14} className="text-emerald-400"/> Perimeter Activity
                                </h3>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-black tracking-widest border border-emerald-500/20">
                                    ENCRYPTED LIVE
                                </div>
                            </div>
                            <div className="flex-1 rounded-2xl overflow-hidden border border-slate-800 relative group">
                                {location?.lat && (
                                    <MapContainer center={[location.lat, location.lng]} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl={false} dragging={false}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <Circle 
                                            center={[location.lat, location.lng]} 
                                            radius={2500} 
                                            pathOptions={{ fillColor: '#6366f1', color: '#6366f1', fillOpacity: 0.1, weight: 1.5 }} 
                                        />
                                        <MapHandler center={location} zoom={12} />
                                    </MapContainer>
                                )}
                            </div>
                        </div>

                        <div className="glass-card rounded-[2.5rem] p-8 h-[280px] flex flex-col">
                            <h3 className="font-black text-white text-xs uppercase tracking-[0.2em] mb-6">Security Logs</h3>
                            <div className="space-y-4 overflow-y-auto pr-2 custom-scroll">
                                <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shadow-[0_0_8px_indigo]" />
                                    <div>
                                        <p className="text-[11px] font-black text-indigo-400 uppercase tracking-wider">AI Guard Analysis</p>
                                        <p className="text-xs text-slate-300 font-medium leading-relaxed">High-patrol frequency detected in current sector.</p>
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-800/30 border border-slate-800/50 rounded-2xl flex gap-4 opacity-70">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 mt-1.5" />
                                    <div>
                                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Nearby Landmark</p>
                                        <p className="text-xs text-slate-500 font-medium leading-relaxed">Safe haven identified: Central Mall (400m)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Safe Route Modal */}
            {showRouteModal && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-6">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowRouteModal(false)} />
                    <div className="relative glass-card w-full max-w-md p-8 rounded-[2rem] border-2 border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-300">
                        <button onClick={() => setShowRouteModal(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"><X size={24}/></button>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-500/20"><Navigation size={24}/></div>
                            <h3 className="text-xl font-black italic tracking-tight">Safe Route Navigator</h3>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-1">Destination Address</label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={18}/>
                                    <input 
                                        type="text" 
                                        placeholder="Where are you heading?" 
                                        value={destination}
                                        onChange={(e) => setDestination(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-6 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleSafeRouteRequest}
                                disabled={isCalculatingRoute || !destination}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-xl shadow-indigo-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {isCalculatingRoute ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <MapIcon size={18}/>}
                                {isCalculatingRoute ? "Optimizing..." : "Analyze Safest Route"}
                            </button>
                            <p className="text-[10px] text-center text-slate-500 font-bold px-4">AI will analyze high-lighting areas and police patrol availability to create your path.</p>
                        </div>
                    </div>
                </div>
            )}
            
            {locationError && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[3000] bg-rose-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom duration-500">
                    <AlertTriangle size={20} />
                    <span className="text-xs uppercase tracking-widest">{locationError}</span>
                </div>
            )}
        </div>
    );
}

