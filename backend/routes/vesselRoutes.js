const express = require('express');
const router = express.Router();
const { 
    getVessels, 
    createVessel, 
    updateVessel, 
    deleteVessel 
} = require('../controllers/vesselController');

// Standard CRUD Routes
router.route('/').get(getVessels).post(createVessel);
router.route('/:id').put(updateVessel).delete(deleteVessel);

module.exports = router;