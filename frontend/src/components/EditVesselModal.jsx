import { useState, useRef } from 'react';
import axios from 'axios';
import { X, Save, UploadCloud, Activity, MapPin, Plus, Trash } from 'lucide-react';

const EditVesselModal = ({ isOpen, onClose, vessel, onUpdate }) => {
    if (!isOpen || !vessel) return null;

    const [formData, setFormData] = useState({
        name: vessel.name,
        type: vessel.type,
        status: vessel.status
    });

    const [metrics, setMetrics] = useState({
        temp: 85, rpm: 1200, fuel: 90, depth: 0
    });

    // --- NEW: Dynamic Waypoints List ---
    const [waypoints, setWaypoints] = useState([
        { lat: '', lng: '' } // Start with one empty slot (Destination)
    ]);

    const fileInputRef = useRef(null);

    // Add a new intermediate stop
    const addWaypoint = () => {
        setWaypoints([...waypoints, { lat: '', lng: '' }]);
    };

    // Remove a stop
    const removeWaypoint = (index) => {
        const newList = [...waypoints];
        newList.splice(index, 1);
        setWaypoints(newList);
    };

    // Update lat/lng inputs
    const handleWaypointChange = (index, field, value) => {
        const newList = [...waypoints];
        newList[index][field] = value;
        setWaypoints(newList);
    };

    const handleSave = async () => {
        try {
            // Filter out empty waypoints
            const validWaypoints = waypoints.filter(wp => wp.lat && wp.lng);

            await axios.put(`http://localhost:5001/api/vessels/${vessel._id}`, {
                ...formData,
                manualMetrics: metrics,
                waypoints: validWaypoints // Send the list to backend
            });
            
            alert("✅ Route & Vessel Updated!");
            onUpdate();
            onClose();
        } catch (error) {
            alert("Update Failed: " + error.message);
        }
    };

    const handleRouteUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const uploadData = new FormData();
        uploadData.append('routeFile', file);
        try {
            await axios.post(`http://localhost:5001/api/upload/routes/${vessel._id}`, uploadData);
            alert("✅ Route File Uploaded!");
            onUpdate();
        } catch (error) { alert("Upload Failed"); }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center shrink-0">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Activity size={20} /> Edit: {vessel.name}
                    </h2>
                    <button onClick={onClose}><X size={20} /></button>
                </div>

                {/* Scrollable Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    
                    {/* 1. Basic Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500">Vessel Name</label>
                            <input className="w-full p-2 border rounded" value={formData.name} 
                                onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500">Vessel Type</label>
                            <select className="w-full p-2 border rounded" value={formData.type} 
                                onChange={e => setFormData({...formData, type: e.target.value})}>
                                <option>Cargo</option>
                                <option>Tanker</option>
                                <option>Submarine</option>
                                <option>Frigate</option>
                            </select>
                        </div>
                    </div>

                    {/* 2. Metrics */}
                    <div className="bg-slate-50 p-3 rounded border border-slate-200 grid grid-cols-3 gap-2">
                        <input type="number" placeholder="Temp" className="p-1 border rounded" value={metrics.temp} onChange={e => setMetrics({...metrics, temp: e.target.value})} />
                        <input type="number" placeholder="RPM" className="p-1 border rounded" value={metrics.rpm} onChange={e => setMetrics({...metrics, rpm: e.target.value})} />
                        <input type="number" placeholder="Fuel" className="p-1 border rounded" value={metrics.fuel} onChange={e => setMetrics({...metrics, fuel: e.target.value})} />
                    </div>

                    {/* 3. MANUAL ROUTE PLANNER */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-sm font-bold text-blue-700 uppercase flex items-center gap-2">
                                <MapPin size={16}/> Manual Route Planner
                            </h3>
                            <button onClick={addWaypoint} className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 flex items-center gap-1">
                                <Plus size={12}/> Add Stop
                            </button>
                        </div>
                        
                        <p className="text-xs text-blue-600 mb-2">
                            Current Location: <span className="font-mono font-bold">{vessel.location.latitude.toFixed(2)}, {vessel.location.longitude.toFixed(2)}</span>
                        </p>

                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                            {waypoints.map((wp, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                    <span className="text-xs font-bold text-blue-400 w-4">{index + 1}.</span>
                                    <input type="number" placeholder="Lat" className="w-1/3 p-1.5 text-xs border rounded focus:border-blue-500"
                                        value={wp.lat} onChange={e => handleWaypointChange(index, 'lat', e.target.value)} />
                                    <input type="number" placeholder="Lng" className="w-1/3 p-1.5 text-xs border rounded focus:border-blue-500"
                                        value={wp.lng} onChange={e => handleWaypointChange(index, 'lng', e.target.value)} />
                                    
                                    {waypoints.length > 1 && (
                                        <button onClick={() => removeWaypoint(index)} className="text-red-400 hover:text-red-600">
                                            <Trash size={14}/>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2 text-center">Add intermediate stops to avoid land.</p>
                    </div>

                    {/* 4. File Upload */}
                    <div className="text-center pt-2 border-t border-slate-100">
                        <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.json" onChange={handleRouteUpload} />
                        <button onClick={() => fileInputRef.current.click()} className="text-xs text-slate-400 hover:text-blue-600 flex items-center justify-center gap-1 w-full">
                            <UploadCloud size={14} /> or upload route file
                        </button>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 shrink-0">
                    <button onClick={handleSave} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2">
                        <Save size={18} /> Update Route & Status
                    </button>
                </div>

            </div>
        </div>
    );
};

export default EditVesselModal;