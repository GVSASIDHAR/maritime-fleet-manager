const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Vessel = require('./models/Vessel');

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to Simulator DB'))
    .catch(err => console.error(err));

// CHANGE THIS: 10000ms = 10 seconds per update (Much Slower)
const SIMULATION_SPEED = 10000; 

const runSimulation = async () => {
    try {
        const vessel = await Vessel.findOne({ 'routeHistory.0': { $exists: true } });

        if (!vessel) {
            console.log('❌ No vessel with a route found! Upload a CSV route first.');
            process.exit();
        }

        console.log(`🚀 Starting Slow Simulation for: ${vessel.name}`);
        console.log(`📍 Total Waypoints: ${vessel.routeHistory.length}`);
        console.log(`⏱  Updating every ${SIMULATION_SPEED / 1000} seconds...`);

        let currentIndex = 0;
        const totalPoints = vessel.routeHistory.length;

        const interval = setInterval(async () => {
            // LOOP LOGIC: If we reach the end, go back to start (Patrol Mode)
            if (currentIndex >= totalPoints) {
                console.log('🏁 Destination Reached! Restarting patrol...');
                currentIndex = 0; 
            }

            const point = vessel.routeHistory[currentIndex];

            // Update Location
            await Vessel.findByIdAndUpdate(vessel._id, {
                location: {
                    latitude: point.latitude,
                    longitude: point.longitude
                },
                $push: {
                    engineMetrics: {
                        temperature: 82 + Math.random() * 2, // Stable temp
                        rpm: 1500 + Math.random() * 100,     // Slower/Stable RPM
                        fuelLevel: Math.max(0, 100 - (currentIndex * 0.5)), // Fuel drops slowly
                        timestamp: new Date()
                    }
                }
            });

            console.log(`🚢 [${new Date().toLocaleTimeString()}] Moving to Step ${currentIndex + 1}: ${point.latitude.toFixed(4)}, ${point.longitude.toFixed(4)}`);
            currentIndex++;

        }, SIMULATION_SPEED);

    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

runSimulation();