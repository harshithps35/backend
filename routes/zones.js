const express = require('express');
const router = express.Router();
const Zone = require('../models/Zone');

// GET /api/zones - Get all zones
router.get('/', async (req, res) => {
  try {
    const zones = await Zone.find({});
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/zones/type/:type
router.get('/type/:type', async (req, res) => {
  try {
    const zones = await Zone.find({ type: req.params.type });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/zones/priority/:level
router.get('/priority/:level', async (req, res) => {
  try {
    const zones = await Zone.find({ priority: req.params.level }).sort({ aiConfidence: -1 });
    res.json(zones);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
