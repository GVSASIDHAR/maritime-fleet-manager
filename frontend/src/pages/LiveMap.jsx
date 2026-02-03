import { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import * as turf from '@turf/turf'; // Used for the gentle route curvature
import { Wind, Navigation, AlertTriangle, Droplet, Gauge, X, ShieldCheck, Thermometer, Anchor } from 'lucide-react';

// --- CUSTOM ICONS ---
const getVesselIcon = (type, status) => {
    let colorClass = 'bg-blue-600'; // Cargo
    let iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`; 

    if (type === 'Submarine') {
        colorClass = 'bg-indigo-700';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="M2 12h2"/><path d="M20 12h2"/></svg>`;
    } else if (type === 'Tanker') {
        colorClass = 'bg-amber-500';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;
    } else if (type === 'Frigate' || type === 'Destroyer') {
        colorClass = 'bg-red-600';
        iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-4 h-4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
    }

    if (status === 'Decommissioned') colorClass = 'bg-slate-400';

    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div class="${colorClass} text-white p-2 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.3)] border-2 border-white flex items-center justify-center transition-transform hover:scale-110">
                 ${iconSvg}
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
    });
};

// --- REALISTIC CURVE GENERATOR ---
const getSmoothRoute = (points) => {
    if (points.length < 3) return points.map(p => [p.latitude, p.longitude]);

    // Convert to Turf format
    const line = turf.lineString(points.map(p => [p.longitude, p.latitude]));
    
    // Sharpness 0.3 creates a gentle, realistic naval curve instead of a loop
    const curved = turf.bezierSpline(line, { resolution: 10000, sharpness: 0.3 });

    return curved.geometry.coordinates.map(coord => [coord[1], coord[0]]);
};


const LiveMap = () => {
    const [vessels, setVessels] = useState([]);
    const [selectedVesselId, setSelectedVesselId] = useState(null);

    const fetchVesselData = async () => {
        try {
            const response = await axios.get('/api/vessels');
            setVessels(response.data);
        } catch (error) {
            console.error("Error fetching vessel positions:", error);
        }
    };

    useEffect(() => {
        fetchVesselData();
        const interval = setInterval(fetchVesselData, 5000);
        return () => clearInterval(interval);
    }, []);

    const selectedVessel = vessels.find(v => v._id === selectedVesselId);
    const latestMetric = selectedVessel?.engineMetrics?.slice(-1)[0] || { temperature: 85, rpm: 1200, fuelLevel: 90 };

    const getRouteColor = (risk) => {
        if (risk === 'High' || risk === 'Critical') return '#ef4444'; // Red
        if (risk === 'Moderate') return '#f59e0b'; // Amber
        return '#10b981'; // Green (Safe)
    };

    return (
        <div className="h-full w-full relative z-0 flex bg-slate-100"> 
            
            {/* RESTORED: BRIGHT PROFESSIONAL BASE MAP */}
            <MapContainer center={[13.0, 80.0]} zoom={5} style={{ height: "100%", width: "100%" }} zoomControl={false}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; CartoDB & OpenStreetMap'
                />

                {vessels.map(vessel => (
                    <div key={vessel._id}>
                        {vessel.location && vessel.location.latitude && (
                            <Marker 
                                position={[vessel.location.latitude, vessel.location.longitude]}
                                icon={getVesselIcon(vessel.type, vessel.status)}
                                eventHandlers={{
                                    click: () => setSelectedVesselId(vessel._id),
                                }}
                            />
                        )}

                        {/* SUBTLE CURVED ROUTE LINE */}
                        {vessel.routeHistory && vessel.routeHistory.length > 0 && (
                            <Polyline 
                                positions={getSmoothRoute(vessel.routeHistory)}
                                color={getRouteColor(vessel.navigation?.riskLevel)}
                                weight={4}
                                opacity={0.8}
                            />
                        )}
                    </div>
                ))}
            </MapContainer>

            {/* FLOATING COMMAND PANEL OVERLAY */}
            {selectedVessel && (
                <div className="absolute top-4 right-4 z-[1000] w-96 bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-right-10 fade-in duration-200">
                    
                    {/* Header */}
                    <div className="bg-slate-900 text-white p-5 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Anchor size={16} className="text-blue-400"/>
                                <h2 className="text-xl font-bold">{selectedVessel.name}</h2>
                            </div>
                            <span className="text-xs text-slate-400 font-mono tracking-wider">IMO: {selectedVessel.imoNumber} • {selectedVessel.type}</span>
                        </div>
                        <button onClick={() => setSelectedVesselId(null)} className="text-slate-400 hover:text-white transition">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-5 space-y-6">
                        {/* Status Banner */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                                selectedVessel.status === 'Active' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'
                            }`}>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Current Status</span>
                                <span className="font-bold flex items-center gap-1"><ShieldCheck size={14}/> {selectedVessel.status}</span>
                            </div>
                            <div className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
                                selectedVessel.navigation?.riskLevel === 'High' ? 'bg-red-50 border-red-100 text-red-700 animate-pulse' : 
                                selectedVessel.navigation?.riskLevel === 'Moderate' ? 'bg-amber-50 border-amber-100 text-amber-700' :
                                'bg-emerald-50 border-emerald-100 text-emerald-700'
                            }`}>
                                <span className="text-[10px] uppercase font-bold text-slate-400">Risk Level</span>
                                <span className="font-bold flex items-center gap-1"><AlertTriangle size={14}/> {selectedVessel.navigation?.riskLevel || 'Low'}</span>
                            </div>
                        </div>

                        {/* Navigation Grid */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Navigation Telemetry</h3>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                                    <Navigation size={14} className="mx-auto text-blue-500 mb-1"/>
                                    <span className="text-lg font-bold text-slate-800">{selectedVessel.navigation?.speed?.toFixed(1) || 0}</span>
                                    <span className="text-[10px] text-slate-400 block">KNOTS</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                                    <Gauge size={14} className="mx-auto text-blue-500 mb-1"/>
                                    <span className="text-lg font-bold text-slate-800">{selectedVessel.navigation?.heading?.toFixed(0) || 0}°</span>
                                    <span className="text-[10px] text-slate-400 block">HEADING</span>
                                </div>
                                <div className="bg-slate-50 p-2 rounded-lg text-center border border-slate-100">
                                    <Wind size={14} className="mx-auto text-blue-500 mb-1"/>
                                    <span className="text-lg font-bold text-slate-800">{selectedVessel.weather?.windSpeed?.toFixed(0) || 0}</span>
                                    <span className="text-[10px] text-slate-400 block">KM/H WIND</span>
                                </div>
                            </div>
                        </div>

                        {/* Engine Health */}
                        <div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Engine Health</h3>
                            <div className="space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span className="flex items-center gap-1"><Droplet size={12}/> Fuel Level</span>
                                        <span>{latestMetric.fuelLevel.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${latestMetric.fuelLevel < 20 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${latestMetric.fuelLevel}%` }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold text-slate-600 mb-1">
                                        <span className="flex items-center gap-1"><Thermometer size={12}/> Engine Temp</span>
                                        <span>{latestMetric.temperature.toFixed(1)}°C</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${latestMetric.temperature > 90 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (latestMetric.temperature/120)*100)}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-900/5 p-3 rounded-lg text-xs font-mono text-slate-600 flex justify-between border border-slate-200">
                            <span>LAT: {selectedVessel.location.latitude.toFixed(4)}</span>
                            <span>LNG: {selectedVessel.location.longitude.toFixed(4)}</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveMap;