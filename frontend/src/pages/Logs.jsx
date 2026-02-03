import { useState, useEffect } from 'react';
import axios from 'axios';
import { Anchor, Trash2, MapPin, Clock, Search, Ship } from 'lucide-react';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // Ensure this matches your backend port (5001)
                const response = await axios.get('/api/logs');
                setLogs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch logs:", error);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) return <div className="p-8 text-slate-500">Loading Black Box Data...</div>;

    return (
        <div className="p-8 bg-slate-50 min-h-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Docking & Decommission Logs</h1>
                    <p className="text-slate-500">Permanent historical records of fleet arrivals and removals.</p>
                </div>
                <div className="flex gap-2 text-sm text-slate-400 font-mono">
                    Total Records: {logs.length}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-900 text-white text-sm uppercase tracking-wider">
                            <th className="p-4 font-medium">Event Type</th>
                            <th className="p-4 font-medium">Vessel Name</th>
                            <th className="p-4 font-medium">Vessel Type</th>
                            <th className="p-4 font-medium">Coordinates</th>
                            <th className="p-4 font-medium">Timestamp</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-slate-100">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="p-8 text-center text-slate-400">
                                    No docking logs found. Try docking a ship in the Fleet Manager.
                                </td>
                            </tr>
                        ) : (
                            logs.map((log) => (
                                <tr key={log._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        {log.action === 'Docked' ? (
                                            <span className="flex items-center gap-2 text-purple-700 bg-purple-100 px-3 py-1 rounded-full w-fit font-bold">
                                                <Anchor size={14} /> DOCKED
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full w-fit font-bold">
                                                <Trash2 size={14} /> DECOMMISSIONED
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 font-bold text-slate-800 flex items-center gap-2">
                                        <Ship size={14} className="text-slate-400"/> {log.vesselName}
                                    </td>
                                    <td className="p-4 text-slate-500">{log.vesselType}</td>
                                    <td className="p-4 text-slate-500 font-mono text-xs flex items-center gap-1">
                                        <MapPin size={12} className="text-blue-500"/> 
                                        {log.location.latitude.toFixed(4)}, {log.location.longitude.toFixed(4)}
                                    </td>
                                    <td className="p-4 text-slate-500 flex items-center gap-1">
                                        <Clock size={14}/> {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Logs;