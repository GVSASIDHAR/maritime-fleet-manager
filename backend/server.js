const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const vesselRoutes = require('./routes/vesselRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const startSimulation = require('./simulationService');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

const app = express();
app.use(cors());

// Middleware
app.use(express.json()); // Allows us to accept JSON data in the body
app.use('/api/auth', authRoutes);
app.use('/api/vessels', vesselRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/logs', require('./routes/logRoutes'));
// Basic Route for Testing
app.get('/', (req, res) => {
    res.send('⚓ Maritime Fleet Manager API is running...');
});

// Define Port
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    startSimulation();
});