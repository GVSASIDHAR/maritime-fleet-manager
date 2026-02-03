const Log = require('../models/Log');

const getLogs = async (req, res) => {
    try {
        // Fetch all logs and sort by newest first (-1)
        const logs = await Log.find().sort({ timestamp: -1 });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLogs };