const express = require('express');
const router = express.Router();
const { updateUserLocation } = require('../controllers/location.Controller');

// POST /api/location/update
router.post('/update', updateUserLocation);

module.exports = router;
