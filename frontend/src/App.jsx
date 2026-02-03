import { useState } from 'react';
import Sidebar from "./components/Sidebar";
import Fleet from "./pages/Fleet";
import LiveMap from "./pages/LiveMap";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider, useAuth } from './context/AuthContext';
import Logs from "./pages/Logs";


axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const AppContent = () => {
    const { user, loading } = useAuth();
    const [activePage, setActivePage] = useState('dashboard');
    const [authMode, setAuthMode] = useState('login');
    
    // 1. Loading State
    if (loading) return <div className="h-screen flex items-center justify-center text-slate-500">Loading Command Center...</div>;
    
    // 2. Auth Check (Login/Register)
    if (!user) {
        if (authMode === 'register') {
            return <Register onSwitchToLogin={() => setAuthMode('login')} />;
        }
        return <Login onSwitchToRegister={() => setAuthMode('register')} />;
    }

    // 3. Main Dashboard Layout
    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar controls the 'activePage' state */}
            <Sidebar activePage={activePage} setActivePage={setActivePage} />
            
            <div className="flex-1 overflow-auto">
                {/* We just switch the component based on the state */}
                {activePage === 'dashboard' && <Dashboard onNavigate={setActivePage} />}
                {activePage === 'fleet' && <Fleet />}
                {activePage === 'map' && <LiveMap />}
                
                {/* 👇 ADDED LOGS HERE 👇 */}
                {activePage === 'logs' && <Logs />}
            </div>
        </div>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;