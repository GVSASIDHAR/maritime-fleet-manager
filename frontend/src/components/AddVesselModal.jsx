import { useState } from 'react';
import axios from 'axios';
import { X, Anchor, MapPin, Save } from 'lucide-react';

const AddVesselModal = ({ isOpen, onClose, onVesselAdded }) => {
    const [formData, setFormData] = useState({
        name: '',
        imoNumber: '',
        type: 'Cargo',
        status: 'Active',
        latitude: '',  // New Field
        longitude: ''  // New Field
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:5001/api/vessels', formData);
            alert('✅ Vessel Registered Successfully!');
            onVesselAdded(); // Refresh the list
            setFormData({ name: '', imoNumber: '', type: 'Cargo', status: 'Active', latitude: '', longitude: '' }); // Reset
            onClose();
        } catch (error) {
            alert('Error adding vessel: ' + error.response?.data?.message);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Header */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h2 className="font-bold text-lg flex items-center gap-2">
                        <Anchor size={20} className="text-blue-400" /> Register New Vessel
                    </h2>
                    <button onClick={onClose} className="hover:text-red-400 transition"><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    
                    {/* Basic Info */}
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vessel Name</label>
                            <input required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                placeholder="e.g. RSS Vengeance"
                                value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">IMO Number</label>
                                <input required className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                                    placeholder="IMO 9876543"
                                    value={formData.imoNumber} onChange={e => setFormData({...formData, imoNumber: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Vessel Type</label>
                                <select className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                    value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                                    <option>Cargo</option>
                                    <option>Tanker</option>
                                    <option>Submarine</option>
                                    <option>Frigate</option>
                                    <option>Destroyer</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* LOCATION INPUTS */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2">
                            <MapPin size={14}/> Initial Deployment Coordinates
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Latitude</label>
                                <input type="number" step="any" required
                                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                                    placeholder="13.0827"
                                    value={formData.latitude} onChange={e => setFormData({...formData, latitude: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-500 mb-1">Longitude</label>
                                <input type="number" step="any" required
                                    className="w-full p-2 border border-slate-300 rounded focus:border-blue-500 outline-none"
                                    placeholder="80.2707"
                                    value={formData.longitude} onChange={e => setFormData({...formData, longitude: e.target.value})} />
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-lg mt-2">
                        <Save size={18} /> Confirm Registration
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddVesselModal;