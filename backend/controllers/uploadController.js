const Vessel = require('../models/Vessel');
const fs = require('fs');
const csv = require('csv-parser');

// Helper function to save to DB (Logic for Phase 4)
const saveRouteToVessel = async (id, data, res) => {
    try {
        const vessel = await Vessel.findById(id);
        if(!vessel) return res.status(404).json({ message: 'Vessel not found' });

        // 1. Update current location to the last point in the file
        const lastPoint = data[data.length - 1];
        if (lastPoint) {
            vessel.location = {
                latitude: lastPoint.latitude || lastPoint.lat,
                longitude: lastPoint.longitude || lastPoint.lng
            };
        }
        
        // 2. Overwrite the route history with the new file data
        vessel.routeHistory = data.map(point => ({
            latitude: point.latitude || point.lat,
            longitude: point.longitude || point.lng,
            timestamp: new Date()
        }));
        
        await vessel.save();
        res.json({ message: 'Route processed successfully', points: data.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Upload Route File (CSV/JSON)
// @route   POST /api/upload/routes/:id
const uploadRoute = async (req, res) => {
    try {
        const vesselId = req.params.id;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const filePath = file.path;
        let routeData = [];

        // CASE 1: JSON File
        if (file.mimetype === 'application/json') {
            const data = fs.readFileSync(filePath, 'utf8');
            const jsonData = JSON.parse(data);
            routeData = jsonData;
            
            fs.unlinkSync(filePath); // Cleanup
            await saveRouteToVessel(vesselId, routeData, res);
        } 
        
        // CASE 2: CSV File
        else if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel') {
            fs.createReadStream(filePath)
                .pipe(csv())
                .on('data', (row) => {
                    if(row.latitude && row.longitude) {
                        routeData.push({
                            latitude: parseFloat(row.latitude),
                            longitude: parseFloat(row.longitude),
                            timestamp: new Date()
                        });
                    }
                })
                .on('end', async () => {
                    fs.unlinkSync(filePath); // Cleanup
                    await saveRouteToVessel(vesselId, routeData, res);
                });
        } else {
            fs.unlinkSync(filePath);
            return res.status(400).json({ message: 'Invalid file format. Use JSON or CSV.' });
        }

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { uploadRoute };