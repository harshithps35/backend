const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
  sensorId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  area: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  type: { type: String, enum: ['borewell', 'surface', 'recharge'], default: 'borewell' },
  readings: [{
    timestamp: { type: Date, default: Date.now },
    waterLevel: { type: Number }, // in meters
    depth: { type: Number },      // borewell depth in meters
    ph: { type: Number },
    tds: { type: Number },        // Total Dissolved Solids ppm
    rechargeRate: { type: Number }, // liters/hour
    temperature: { type: Number }
  }],
  status: { type: String, enum: ['active', 'inactive', 'warning', 'critical'], default: 'active' },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Sensor', sensorSchema);
