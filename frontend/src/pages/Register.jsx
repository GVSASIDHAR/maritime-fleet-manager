import { useState } from 'react';
import axios from 'axios';
import { Anchor, UserPlus, ArrowLeft } from 'lucide-react';

const Register = ({ onSwitchToLogin }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Viewer' // Default role
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            await axios.post('/api/auth/register', formData);
            setSuccess('Registration Successful! Redirecting to login...');
            setTimeout(() => {
                onSwitchToLogin(); // Auto-switch to login after 1.5s
            }, 1500);
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-3">
                        <UserPlus className="text-blue-600" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Create Account</h1>
                    <p className="text-slate-500 text-sm">Join the Fleet Command Center</p>
                </div>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm text-center font-medium">{error}</div>}
                {success && <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mb-4 text-sm text-center font-medium">{success}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                        <input required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="John Doe"
                            value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input required type="email" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="officer@navicom.com"
                            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                        <input required type="password" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                            placeholder="••••••••"
                            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
                    </div>
                    
                    {/* ROLE SELECTION DROPDOWN */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Access Level (Role)</label>
                        <select className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})}>
                            <option value="Viewer">Viewer (Read Only)</option>
                            <option value="Operator">Operator (Update Status)</option>
                            <option value="Admin">Admin (Full Control)</option>
                        </select>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-lg transition-all shadow-lg mt-2">
                        Register User
                    </button>
                </form>

                <div className="mt-6 text-center border-t border-slate-100 pt-4">
                    <button onClick={onSwitchToLogin} className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-2 mx-auto">
                        <ArrowLeft size={16} /> Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Register;