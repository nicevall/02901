// routes/locationRoutes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.Controller');

// POST /api/location/update
router.post('/update', locationController.updateUserLocation);

module.exports = router;
