import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Ship, Anchor, Activity, Edit, Trash2, UploadCloud, Loader2 } from 'lucide-react';
import AddVesselModal from '../components/AddVesselModal';
import EditVesselModal from '../components/EditVesselModal';
import { useAuth } from '../context/AuthContext';

const Fleet = () => {
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVessel, setSelectedVessel] = useState(null);

    // Upload State
    const [uploadingId, setUploadingId] = useState(null);
    const fileInputRef = useRef(null); 

    const { user } = useAuth();

    const fetchVessels = async () => {
        try {
            const response = await axios.get('/api/vessels')
            setVessels(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching fleet:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVessels();
    }, []);

    // --- 1. STATUS CHANGE LOGIC (Restored) ---
    const handleStatusChange = async (vessel, newStatus) => {
        // RULE: Cannot set "Docked" unless at destination
        if (newStatus === 'Docked') {
            if (!vessel.routeHistory || vessel.routeHistory.length === 0) {
                alert("❌ Cannot Dock: This vessel has no route!");
                return;
            }

            const current = vessel.location;
            const destination = vessel.routeHistory[vessel.routeHistory.length - 1];

            const latDiff = Math.abs(current.latitude - destination.latitude);
            const lngDiff = Math.abs(current.longitude - destination.longitude);

            if (latDiff > 0.05 || lngDiff > 0.05) {
                alert(`⚠️ Cannot Dock: Vessel is still en route!`);
                return; 
            }
        }

        try {
            // Optimistic Update
            setVessels(vessels.map(v => 
                v._id === vessel._id ? { ...v, status: newStatus } : v
            ));

            await axios.put(`/api/vessels/${vessel._id}`, {
                status: newStatus
            });
            
        } catch (error) {
            console.error("Update failed:", error);
            alert("Failed to update status.");
            fetchVessels();
        }
    };

    // --- 2. DELETE HANDLER ---
    const handleDelete = async (id) => {
        if (confirm("⚠️ Are you sure you want to decommission and delete this vessel?")) {
            try {
                await axios.delete(`/api/vessels/${id}`);
                setVessels(vessels.filter(v => v._id !== id));
            } catch (error) {
                alert("Delete failed");
            }
        }
    };

    // --- 3. EDIT HANDLER ---
    const handleEditClick = (vessel) => {
        setSelectedVessel(vessel);
        setIsEditModalOpen(true);
    };

    // --- 4. QUICK UPLOAD HANDLER ---
    const handleUploadClick = (vesselId) => {
        setUploadingId(vesselId);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file || !uploadingId) {
            setUploadingId(null);
            return;
        }
        const formData = new FormData();
        formData.append('routeFile', file);

        try {
            await axios.post(`/api/upload/routes/${uploadingId}`, formData);
            alert('✅ Route Uploaded!');
            fetchVessels(); 
        } catch (error) {
            alert('Upload Failed');
        } finally {
            setUploadingId(null);
        }
    };

    // Helper for Colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'Maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'Docked': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'Decommissioned': return 'bg-slate-100 text-slate-600 border-slate-200';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                        <Ship className="text-blue-600" size={32} />
                        Fleet Management
                    </h1>
                    <p className="text-slate-500 mt-1">Monitor and manage your maritime assets</p>
                </div>
                
                {user?.role === 'Admin' && (
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-all shadow-sm font-medium" 
                        onClick={() => setIsAddModalOpen(true)}>
                        <Anchor size={18} />
                        Add New Vessel
                    </button>
                )}
            </div>

            <input type="file" ref={fileInputRef} className="hidden" accept=".csv,.json" onChange={handleFileChange} />

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-slate-500">Loading fleet data...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold tracking-wider">
                            <tr>
                                <th className="p-4 border-b border-slate-200">Vessel Name</th>
                                <th className="p-4 border-b border-slate-200">Type</th>
                                <th className="p-4 border-b border-slate-200">Status</th>
                                <th className="p-4 border-b border-slate-200 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-700">
                            {vessels.map((vessel) => (
                                <tr key={vessel._id} className="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
                                    <td className="p-4 font-medium text-slate-900">
                                        {vessel.name}
                                        <div className="text-xs text-slate-400 font-mono">{vessel.imoNumber}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                                            vessel.type === 'Submarine' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-cyan-50 text-cyan-700 border-cyan-200'
                                        }`}>
                                            {vessel.type}
                                        </span>
                                    </td>
                                    
                                    {/* --- STATUS COLUMN (RESTORED DROPDOWN) --- */}
                                    <td className="p-4">
                                        {(user?.role === 'Admin' || user?.role === 'Operator') ? (
                                            <select 
                                                value={vessel.status}
                                                onChange={(e) => handleStatusChange(vessel, e.target.value)}
                                                className={`px-2 py-1 rounded-full text-xs font-medium border cursor-pointer outline-none focus:ring-2 focus:ring-blue-400 ${getStatusColor(vessel.status)}`}
                                            >
                                                <option value="Active">Active</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="Docked">Docked</option>
                                                <option value="Decommissioned">Decommissioned</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(vessel.status)}`}>
                                                <Activity size={12} className="inline mr-1 mb-0.5" />
                                                {vessel.status}
                                            </span>
                                        )}
                                    </td>

                                    {/* --- ACTIONS COLUMN (MERGED) --- */}
                                    <td className="p-4 text-right flex justify-end gap-2">
                                        {user?.role === 'Admin' && (
                                            <>
                                                {/* 1. Quick Upload Button */}
                                                <button 
                                                    onClick={() => handleUploadClick(vessel._id)}
                                                    disabled={uploadingId === vessel._id}
                                                    className={`p-2 rounded-lg transition-all ${
                                                        uploadingId === vessel._id ? "text-blue-600 bg-blue-50" : "text-slate-400 hover:text-blue-600 hover:bg-blue-50"
                                                    }`}
                                                    title="Quick Route Upload"
                                                >
                                                    {uploadingId === vessel._id ? <Loader2 size={18} className="animate-spin" /> : <UploadCloud size={18} />}
                                                </button>

                                                {/* 2. Edit Button */}
                                                <button 
                                                    onClick={() => handleEditClick(vessel)}
                                                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                                    title="Edit Configuration"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                
                                                {/* 3. Delete Button */}
                                                <button 
                                                    onClick={() => handleDelete(vessel._id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                                    title="Decommission Vessel"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modals */}
            <AddVesselModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onVesselAdded={fetchVessels} />
            
            <EditVesselModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                vessel={selectedVessel} 
                onUpdate={fetchVessels} 
            />
        </div>
    );
};

export default Fleet;