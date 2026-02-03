import { Ship, Map, LogOut, LayoutDashboard, ClipboardList } from 'lucide-react'; // Import LayoutDashboard Icon
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activePage, setActivePage }) => {
    const { logout, user } = useAuth();

    return (
        <div className="w-64 bg-slate-900 text-white h-screen flex flex-col p-4 sticky top-0">
            {/* Header */}
            <div className="flex items-center gap-3 mb-10 px-2 mt-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                    <Ship size={24} />
                </div>
                <div>
                    <h1 className="text-lg font-bold">NaviCom</h1>
                    <p className="text-xs text-slate-400">Command Center</p>
                </div>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-2">
                
                {/* NEW: DASHBOARD LINK */}
                <button 
                    onClick={() => setActivePage('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                        activePage === 'dashboard' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                >
                    <LayoutDashboard size={20} />
                    <span className="font-medium">Dashboard</span>
                    
                    {/* NOTIFICATION BADGE (Static for now, simulates live alerts) */}
                    <span className="absolute right-4 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                </button>

                <button 
                    onClick={() => setActivePage('fleet')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activePage === 'fleet' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                >
                    <Ship size={20} />
                    <span className="font-medium">Fleet Manager</span>
                </button>

                <button 
                    onClick={() => setActivePage('map')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activePage === 'map' ? 'bg-blue-600 shadow-lg shadow-blue-900/20' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                >
                    <Map size={20} />
                    <span className="font-medium">Live Map</span>
                </button>
                <button 
                    onClick={() => setActivePage('logs')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activePage === 'logs' ? 'bg-blue-600 shadow-lg' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                >
                    <ClipboardList size={20} /> {/* Import ClipboardList from lucide-react */}
                    <span className="font-medium">Docking Logs</span>
                </button>
            </nav>

            {/* User Profile & Logout */}
            <div className="mt-auto pt-6 border-t border-slate-800">
                <div className="px-2 mb-4">
                    <p className="text-sm font-semibold">{user?.name || 'User'}</p>
                    <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-blue-400 border border-slate-700">
                        {user?.role || 'VIEWER'}
                    </span>
                </div>
                <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-all"
                >
                    <LogOut size={20} />
                    <span className="font-medium">Logout System</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;