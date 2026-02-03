const Vessel = require('./models/Vessel');

const SIMULATION_SPEED = 10000; // 10 seconds

const calculateHeading = (lat1, lon1, lat2, lon2) => {
    const y = Math.sin(lon2 - lon1) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360; 
};

const generateWeather = () => {
    const rand = Math.random();
    if (rand > 0.85) return { condition: 'Storm', wind: 80 + Math.random() * 40, wave: 4 + Math.random() * 3, risk: 'High' };
    if (rand > 0.65) return { condition: 'Rain', wind: 40 + Math.random() * 20, wave: 2 + Math.random() * 2, risk: 'Moderate' };
    if (rand > 0.50) return { condition: 'Fog', wind: 10 + Math.random() * 10, wave: 1, risk: 'Moderate' };
    return { condition: 'Clear', wind: 5 + Math.random() * 15, wave: 0.5 + Math.random(), risk: 'Low' };
};

const startSimulation = () => {
    console.log('🌐 Smart Simulation Service Started...');

    setInterval(async () => {
        try {
            const vessels = await Vessel.find({ 'routeHistory.0': { $exists: true } });

            vessels.forEach(async (vessel) => {
                
                // Do not simulate if already Docked, Maintained, or Decommissioned
                if (['Docked', 'Maintenance', 'Decommissioned'].includes(vessel.status)) return; 

                const totalPoints = vessel.routeHistory.length;
                if (totalPoints <= 1) return; // Cannot move with only 1 point

                let currentIndex = vessel.routeHistory.findIndex(p => 
                    Math.abs(p.latitude - vessel.location.latitude) < 0.0001 && 
                    Math.abs(p.longitude - vessel.location.longitude) < 0.0001
                );

                // --- THE FIX: STOP AT DESTINATION ---
                // If the ship is at the very last point, do NOT loop back to 0. Just stop.
                if (currentIndex === totalPoints - 1) {
                    return; // Ship has arrived. Waiting for Admin to "Dock" it.
                }

                let nextIndex = currentIndex + 1;
                if (currentIndex === -1) nextIndex = 0; // Failsafe

                const currentPoint = vessel.routeHistory[currentIndex] || vessel.routeHistory[0];
                const nextPoint = vessel.routeHistory[nextIndex];

                const heading = calculateHeading(
                    currentPoint.latitude * Math.PI / 180, currentPoint.longitude * Math.PI / 180,
                    nextPoint.latitude * Math.PI / 180, nextPoint.longitude * Math.PI / 180
                );

                const weather = generateWeather();

                let speed = 25; 
                if (weather.condition === 'Storm') speed = 10;
                else if (weather.condition === 'Rain') speed = 18;
                
                const engineTemp = weather.condition === 'Storm' ? 95 + Math.random() * 5 : 82 + Math.random() * 3;

                const updateQuery = {
                    location: { latitude: nextPoint.latitude, longitude: nextPoint.longitude },
                    navigation: { speed: speed, heading: heading, riskLevel: weather.risk },
                    weather: { condition: weather.condition, windSpeed: weather.wind, temperature: 20 + Math.random() * 10, waveHeight: weather.wave },
                    $push: {
                        engineMetrics: {
                            temperature: engineTemp,
                            rpm: (speed * 100) + Math.random() * 50,
                            fuelLevel: Math.max(0, 95 - (nextIndex * 0.1)),
                            timestamp: new Date()
                        }
                    }
                };

                if (vessel.type === 'Submarine') {
                    updateQuery.$push.depthLogs = { depth: -50 - (Math.random() * 350), timestamp: new Date() };
                }

                await Vessel.findByIdAndUpdate(vessel._id, updateQuery);
            });

        } catch (error) {
            console.error("Simulation Tick Error:", error.message);
        }
    }, SIMULATION_SPEED);
};

module.exports = startSimulation;