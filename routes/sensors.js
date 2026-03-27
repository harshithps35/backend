const express = require('express');
const router = express.Router();
const Sensor = require('../models/Sensor');

// GET /api/sensors - Get all sensors (with latest reading)
router.get('/', async (req, res) => {
  try {
    const sensors = await Sensor.find({});
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sensors/:id - Get single sensor with all readings
router.get('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findOne({ sensorId: req.params.id });
    if (!sensor) return res.status(404).json({ message: 'Sensor not found' });
    res.json(sensor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sensors/area/:area - Get sensors for a specific area
router.get('/area/:area', async (req, res) => {
  try {
    const sensors = await Sensor.find({ area: { $regex: req.params.area, $options: 'i' } });
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/sensors/reading/:id - Simulate new IoT reading
router.post('/reading/:sensorId', async (req, res) => {
  try {
    const sensor = await Sensor.findOne({ sensorId: req.params.sensorId });
    if (!sensor) return res.status(404).json({ message: 'Sensor not found' });

    sensor.readings.push(req.body);
    sensor.lastUpdated = Date.now();
    await sensor.save();
    res.json({ message: 'Reading added', sensor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/sensors/stats/summary - Dashboard summary stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await Sensor.countDocuments();
    const active = await Sensor.countDocuments({ status: 'active' });
    const critical = await Sensor.countDocuments({ status: 'critical' });
    const warning = await Sensor.countDocuments({ status: 'warning' });
    res.json({ total, active, critical, warning });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
