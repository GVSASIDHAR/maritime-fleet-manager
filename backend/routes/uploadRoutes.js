const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadRoute } = require('../controllers/uploadController');
const { protect, authorize } = require('../middleware/authMiddleware'); // Import Auth

const upload = multer({ dest: 'uploads/' });

// Only Admins can upload route files
router.post('/routes/:id', 
    protect, 
    authorize('Admin'), 
    upload.single('routeFile'), 
    uploadRoute
);

module.exports = router;