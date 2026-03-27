const mongoose = require('mongoose');

const zoneSchema = new mongoose.Schema({
  zoneId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  area: { type: String, required: true },
  type: {
    type: String,
    enum: ['percolation_pond', 'recharge_trench', 'check_dam', 'rooftop_harvesting', 'stagnation_risk', 'road_gap'],
    required: true
  },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  coordinates: [{
    lat: { type: Number },
    lng: { type: Number }
  }],
  center: {
    lat: { type: Number },
    lng: { type: Number }
  },
  soilType: { type: String },
  rainfallIndex: { type: Number }, // mm/year
  capacityLiters: { type: Number },
  aiConfidence: { type: Number }, // 0-100
  description: { type: String },
  status: { type: String, enum: ['proposed', 'approved', 'under_construction', 'active'], default: 'proposed' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Zone', zoneSchema);
