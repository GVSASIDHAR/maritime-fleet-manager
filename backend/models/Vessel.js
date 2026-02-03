const mongoose = require('mongoose');

const vesselSchema = mongoose.Schema({
    name: { type: String, required: true },
    imoNumber: { type: String, required: true, unique: true },
    type: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['Active', 'Maintenance', 'Decommissioned', 'Docked'], 
        default: 'Active' 
    },
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    // --- NEW INTELLIGENCE FIELDS ---
    navigation: {
        speed: { type: Number, default: 0 }, // Knots
        heading: { type: Number, default: 0 }, // Degrees
        riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', 'Critical'], default: 'Low' }
    },
    weather: {
        condition: { type: String, default: 'Clear' }, // Clear, Rain, Storm, Fog
        windSpeed: { type: Number, default: 10 }, // km/h
        temperature: { type: Number, default: 25 }, // Celsius
        waveHeight: { type: Number, default: 1.0 } // Meters
    },
    // -------------------------------
    routeHistory: [{
        latitude: Number,
        longitude: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    engineMetrics: [{
        temperature: Number,
        rpm: Number,
        fuelLevel: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    depthLogs: [{
        depth: Number,
        timestamp: { type: Date, default: Date.now }
    }] // For Submarines
}, {
    timestamps: true
});

// Helper for Password (kept from previous steps)
const bcrypt = require('bcryptjs');
vesselSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Vessel', vesselSchema);