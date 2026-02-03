import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, LineChart, Line, CartesianGrid
} from 'recharts';
import { Ship, Activity, AlertTriangle, Zap, Droplet, Gauge, Bell, Wind, AlertCircle } from 'lucide-react';

const Dashboard = ({ onNavigate }) => {
    const [vessels, setVessels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    const fetchData = async () => {
        try {
            const res = await axios.get('/api/vessels');

            setVessels(res.data);
            generateAlerts(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Dashboard Sync Error:", error);
        }
    };

    useEffect(() => {
        // 1. Initial Fetch
        fetchData();

        // 2. Auto-Refresh Interval (Every 5 seconds for faster alerts)
        const interval = setInterval(fetchData, 5000);

        return () => clearInterval(interval);
    }, []);

    // --- SMART ALERTS ENGINE (Fixed) ---
    const generateAlerts = (data) => {
        const newAlerts = [];
        data.forEach(v => {
            const risk = v.navigation?.riskLevel;
            const weather = v.weather?.condition;

            // 1. CRITICAL Weather/Risk Alert (Red)
            if (weather === 'Storm' || risk === 'High' || risk === 'Critical') {
                newAlerts.push({
                    id: v._id + 'storm',
                    type: 'danger',
                    msg: `CRITICAL: ${v.name} in STORM zone. High Risk!`,
                    icon: <Wind size={16}/>
                });
            }
            // 2. MODERATE Warning (Orange) - NOW INCLUDED
            else if (weather === 'Rain' || risk === 'Moderate') {
                newAlerts.push({
                    id: v._id + 'rain',
                    type: 'warning',
                    msg: `ADVISORY: ${v.name} experiencing rough weather.`,
                    icon: <AlertCircle size={16}/>
                });
            }

            // 3. Low Fuel Alert
            const lastMetric = v.engineMetrics?.slice(-1)[0];
            if (lastMetric && lastMetric.fuelLevel < 20) {
                newAlerts.push({
                    id: v._id + 'fuel',
                    type: 'warning',
                    msg: `LOW FUEL: ${v.name} reserves at ${lastMetric.fuelLevel.toFixed(1)}%.`,
                    icon: <Droplet size={16}/>
                });
            }
        });
        setAlerts(newAlerts);
    };

    if (loading) return <div className="p-8 text-slate-500">Loading Command Center...</div>;

    // --- CHART DATA PREP ---
    const statusData = [
        { name: 'Active', value: vessels.filter(v => v.status === 'Active').length, color: '#10b981' },
        { name: 'Maintenance', value: vessels.filter(v => v.status === 'Maintenance').length, color: '#f59e0b' },
        { name: 'Docked', value: vessels.filter(v => v.status === 'Docked').length, color: '#6366f1' },
    ].filter(d => d.value > 0);

    const activeVessel = vessels.find(v => v.status === 'Active') || vessels[0];
    const fuelTrendData = activeVessel?.engineMetrics?.slice(-20).map((m, i) => ({
        time: `T-${20-i}`,
        fuel: m.fuelLevel,
        temp: m.temperature
    })) || [];

    const submarine = vessels.find(v => v.type === 'Submarine');
    const depthData = submarine?.depthLogs?.slice(-20).map((log, i) => ({
        time: `T-${i}`,
        depth: log.depth 
    })) || [];

    return (
        <div className="p-8 bg-slate-50 min-h-full space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Command Dashboard</h1>
                    <p className="text-slate-500">Real-time maritime intelligence & fleet analytics</p>
                </div>
                <div className="text-right">
                   <div className="text-sm font-bold text-slate-400">SYSTEM STATUS</div>
                   <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       LIVE SYNC ACTIVE
                   </div>
                </div>
            </div>

            {/* KPI CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Ship size={24} /></div>
                    <div><p className="text-sm text-slate-500">Total Fleet</p><h3 className="text-2xl font-bold">{vessels.length} Units</h3></div>
                </div>
                
                <div onClick={() => onNavigate('map')} className="bg-indigo-600 text-white p-5 rounded-xl shadow-lg shadow-indigo-200 cursor-pointer hover:bg-indigo-700 transition flex items-center gap-4 group">
                    <div className="p-3 bg-white/20 rounded-lg"><Gauge size={24} /></div>
                    <div><p className="text-indigo-200 text-sm group-hover:text-white">Live Tracking</p><h3 className="text-2xl font-bold">View Map</h3></div>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><AlertTriangle size={24} /></div>
                    <div><p className="text-sm text-slate-500">Active Alerts</p><h3 className="text-2xl font-bold text-amber-600">{alerts.length}</h3></div>
                </div>
                
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Zap size={24} /></div>
                    <div><p className="text-sm text-slate-500">Avg Efficiency</p><h3 className="text-2xl font-bold">94.2%</h3></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CHARTS */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2"><Droplet size={18}/> Fleet Fuel Consumption Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={fuelTrendData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                    <XAxis dataKey="time" hide />
                                    <YAxis yAxisId="left" stroke="#64748b" fontSize={12}/>
                                    <YAxis yAxisId="right" orientation="right" stroke="#ef4444" fontSize={12}/>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}/>
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="fuel" stroke="#3b82f6" strokeWidth={3} dot={false} name="Fuel Level %" />
                                    <Line yAxisId="right" type="monotone" dataKey="temp" stroke="#ef4444" strokeWidth={2} dot={false} name="Engine Temp °C" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-700 mb-4">Fleet Status</h3>
                            <div className="h-48">
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={statusData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36}/>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="font-bold text-slate-700 mb-4">Submarine Depth Profile</h3>
                            <div className="h-48">
                                <ResponsiveContainer>
                                    <AreaChart data={depthData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <YAxis reversed hide />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="depth" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* LIVE ALERTS PANEL */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <Bell size={18} className="text-blue-600"/> Live Alerts
                        </h3>
                        <span className="text-xs font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">{alerts.length} New</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px]">
                        {alerts.length > 0 ? alerts.map(alert => (
                            <div key={alert.id} className={`p-3 rounded-lg border-l-4 text-sm animate-in fade-in slide-in-from-right-2 duration-300 ${
                                alert.type === 'danger' ? 'bg-red-50 border-red-500 text-red-700' : 'bg-amber-50 border-amber-500 text-amber-700'
                            }`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{alert.icon}</div>
                                    <div>
                                        <p className="font-bold text-xs uppercase mb-1">{alert.type === 'danger' ? 'Critical Alert' : 'Advisory'}</p>
                                        <p>{alert.msg}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-10 text-slate-400">
                                <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Bell size={20} className="text-slate-300"/>
                                </div>
                                <p className="text-sm">No active fleet alerts.</p>
                                <p className="text-xs">Systems Nominal.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;