import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const VesselCharts = ({ vessel }) => {
    if (!vessel || !vessel.engineMetrics) return null;

    // Take the last 20 data points so the chart doesn't get too crowded
    const recentMetrics = vessel.engineMetrics.slice(-20);
    const labels = recentMetrics.map((m) => 
        new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );

    // 1. RPM Chart Configuration
    const rpmData = {
        labels,
        datasets: [
            {
                label: 'Engine RPM',
                data: recentMetrics.map((m) => m.rpm),
                borderColor: 'rgb(59, 130, 246)', // Blue
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4, // Smooth curves
                fill: true,
            },
        ],
    };

    // 2. Fuel Chart Configuration
    const fuelData = {
        labels,
        datasets: [
            {
                label: 'Fuel Level (%)',
                data: recentMetrics.map((m) => m.fuelLevel),
                borderColor: 'rgb(239, 68, 68)', // Red
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                tension: 0.4,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
        },
        scales: {
            x: { display: false } // Hide time labels to keep it clean
        }
    };

    return (
        <div className="space-y-4 mt-4">
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Engine Performance</h4>
                <div className="h-32">
                    <Line options={{...options, maintainAspectRatio: false}} data={rpmData} />
                </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Fuel Consumption</h4>
                <div className="h-32">
                    <Line options={{...options, maintainAspectRatio: false}} data={fuelData} />
                </div>
            </div>
        </div>
    );
};

export default VesselCharts;