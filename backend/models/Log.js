const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
    vesselName: { type: String, required: true },
    vesselType: { type: String, required: true },
    action: { type: String, required: true }, // 'Docked' or 'Decommissioned'
    location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Log', logSchema);