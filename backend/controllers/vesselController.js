const Vessel = require('../models/Vessel');
const Log = require('../models/Log');

// --- HELPER: Route Generator ---
const generateRouteFromWaypoints = (startLoc, waypoints) => {
    let fullPath = [];
    let currentStart = startLoc;
    const STEPS_PER_LEG = 50; 

    waypoints.forEach(point => {
        const endLat = Number(point.lat);
        const endLng = Number(point.lng);
        for (let i = 0; i <= STEPS_PER_LEG; i++) {
            const lat = currentStart.lat + (endLat - currentStart.lat) * (i / STEPS_PER_LEG);
            const lng = currentStart.lng + (endLng - currentStart.lng) * (i / STEPS_PER_LEG);
            fullPath.push({ latitude: lat, longitude: lng });
        }
        currentStart = { lat: endLat, lng: endLng };
    });
    return fullPath;
};

// --- CONTROLLERS ---

const getVessels = async (req, res) => {
    try {
        const vessels = await Vessel.find();
        res.json(vessels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVessel = async (req, res) => {
    try {
        const { name, imoNumber, type, status, latitude, longitude } = req.body;
        const startLat = Number(latitude) || 13.0;
        const startLng = Number(longitude) || 80.0;

        const vessel = await Vessel.create({
            name, imoNumber, type, status,
            location: { latitude: startLat, longitude: startLng },
            routeHistory: [{ latitude: startLat, longitude: startLng }],
            navigation: { speed: 0, heading: 0, riskLevel: 'Low' },
            weather: { condition: 'Clear', windSpeed: 5, temperature: 25, waveHeight: 0.5 }
        });
        res.status(201).json(vessel);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// --- THIS IS THE FIX FOR DOCKING LOGS ---
const updateVessel = async (req, res) => {
    try {
        const vessel = await Vessel.findById(req.params.id);
        if (!vessel) return res.status(404).json({ message: 'Vessel not found' });

        // 1. DETECT DOCKING EVENT
        // We check if the NEW status is 'Docked' AND the OLD status was NOT 'Docked'
        if (req.body.status === 'Docked' && vessel.status !== 'Docked') {
            console.log(`⚓ DOCKING EVENT DETECTED FOR: ${vessel.name}`);

            try {
                await Log.create({
                    vesselName: vessel.name,
                    vesselType: vessel.type,
                    action: 'Docked',
                    // EXPLICTLY COPY COORDINATES (Prevents DB Errors)
                    location: {
                        latitude: vessel.location.latitude,
                        longitude: vessel.location.longitude
                    },
                    timestamp: new Date()
                });
                console.log("✅ DOCKING LOG SUCCESSFULLY SAVED TO DB");
            } catch (logError) {
                console.error("❌ FAILED TO SAVE LOG:", logError.message);
            }
        }

        // 2. Handle Waypoints (Route Update)
        if (req.body.waypoints && Array.isArray(req.body.waypoints)) {
            const currentLoc = { lat: vessel.location.latitude, lng: vessel.location.longitude };
            const newRoute = generateRouteFromWaypoints(currentLoc, req.body.waypoints);
            vessel.routeHistory = newRoute;
        }

        // 3. Standard Updates
        vessel.name = req.body.name || vessel.name;
        vessel.type = req.body.type || vessel.type;
        vessel.status = req.body.status || vessel.status;

        // 4. Metrics
        if (req.body.manualMetrics) {
            const { temp, rpm, fuel, depth } = req.body.manualMetrics;
            vessel.engineMetrics.push({
                temperature: temp || 80,
                rpm: rpm || 0,
                fuelLevel: fuel || 100,
                timestamp: new Date()
            });
            if (vessel.type === 'Submarine' && depth) {
                if (!vessel.depthLogs) vessel.depthLogs = [];
                vessel.depthLogs.push({ depth: depth, timestamp: new Date() });
            }
        }

        const updatedVessel = await vessel.save();
        res.json(updatedVessel);

    } catch (error) {
        console.error("Update Error:", error);
        res.status(400).json({ message: error.message });
    }
};

const deleteVessel = async (req, res) => {
    try {
        const vessel = await Vessel.findById(req.params.id);
        if (!vessel) return res.status(404).json({ message: 'Vessel not found' });

        await Log.create({
            vesselName: vessel.name,
            vesselType: vessel.type,
            action: 'Decommissioned (Deleted)',
            location: {
                latitude: vessel.location.latitude,
                longitude: vessel.location.longitude
            },
            timestamp: new Date()
        });

        await vessel.deleteOne();
        res.json({ message: 'Vessel removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVessels, createVessel, updateVessel, deleteVessel };