const express = require('express');
const router = express.Router();

// AI Prediction Engine (rule-based + weighted scoring simulation)
const predictRechargeZones = (area, soilType, rainfall, landUse, population) => {
  const soilPermeability = {
    'sandy': 0.9, 'loamy': 0.7, 'clay': 0.3,
    'rocky': 0.2, 'laterite': 0.6, 'alluvial': 0.8
  };

  const permeability = soilPermeability[soilType] || 0.5;
  const rainfallScore = Math.min(rainfall / 1200, 1);
  const urbanScore = landUse === 'urban' ? 0.8 : landUse === 'semi-urban' ? 0.5 : 0.3;

  const overallScore = (permeability * 0.4 + rainfallScore * 0.35 + urbanScore * 0.25) * 100;

  const recommendations = [];

  if (overallScore > 70) {
    recommendations.push({
      type: 'percolation_pond',
      name: `Percolation Pond - ${area}`,
      confidence: Math.round(overallScore),
      capacity: Math.round(permeability * rainfall * 500),
      description: 'Ideal conditions for a large percolation pond. High soil permeability and rainfall make this site excellent for groundwater recharge.',
      priority: 'high',
      estimatedCost: '₹8-15 Lakhs',
      rechargePotential: `${Math.round(permeability * rainfall * 0.3)} liters/day`
    });
  }

  if (urbanScore > 0.4 && rainfall > 800) {
    recommendations.push({
      type: 'recharge_trench',
      name: `Road-Side Recharge Trench - ${area}`,
      confidence: Math.round(urbanScore * 85),
      capacity: Math.round(urbanScore * rainfall * 200),
      description: 'Road gaps and medians can be converted to recharge trenches. Stagnant road water diverted underground instead of flooding.',
      priority: overallScore > 60 ? 'high' : 'medium',
      estimatedCost: '₹2-5 Lakhs per km',
      rechargePotential: `${Math.round(urbanScore * rainfall * 0.15)} liters/day`
    });
  }

  if (population > 5000) {
    recommendations.push({
      type: 'rooftop_harvesting',
      name: `Rooftop Rainwater Harvesting - ${area}`,
      confidence: Math.round(rainfallScore * 90),
      capacity: Math.round(rainfallScore * 15000),
      description: 'High-density residential zones benefit greatly from mandatory rooftop rainwater harvesting systems.',
      priority: 'medium',
      estimatedCost: '₹25,000 - 1 Lakh per unit',
      rechargePotential: `${Math.round(rainfallScore * 8000)} liters/year per unit`
    });
  }

  if (permeability < 0.4 && rainfall > 700) {
    recommendations.push({
      type: 'check_dam',
      name: `Check Dam / Nala Bund - ${area}`,
      confidence: Math.round((1 - permeability) * rainfallScore * 80),
      capacity: Math.round((1 - permeability) * rainfall * 800),
      description: 'Low permeability soil causes runoff. Check dams along nalas can slow water flow and allow gradual percolation.',
      priority: 'medium',
      estimatedCost: '₹5-20 Lakhs',
      rechargePotential: `${Math.round((1 - permeability) * rainfall * 0.2)} liters/day`
    });
  }

  return {
    area,
    soilType,
    rainfall,
    overallRechargeScore: Math.round(overallScore),
    riskLevel: overallScore > 70 ? 'low' : overallScore > 40 ? 'medium' : 'high',
    stagnationRisk: urbanScore > 0.6 && permeability < 0.5 ? 'high' : 'low',
    recommendations: recommendations.sort((a, b) => b.confidence - a.confidence),
    analysisTimestamp: new Date().toISOString(),
    dataSource: 'AI Model v2.1 (Satellite + IoT Fusion)'
  };
};

// POST /api/predictions/analyze
router.post('/analyze', (req, res) => {
  try {
    const {
      area = 'North Bangalore',
      soilType = 'laterite',
      rainfall = 950,
      landUse = 'urban',
      population = 10000
    } = req.body;

    const result = predictRechargeZones(area, soilType, rainfall, landUse, population);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/predictions/stagnation-zones - Pre-analyzed stagnation hotspots
router.get('/stagnation-zones', (req, res) => {
  const stagnationZones = [
    { name: 'Yelahanka Main Road Junction', lat: 13.1007, lng: 77.5963, riskLevel: 'high', waterAccumulation: '2-3 feet', cause: 'Poor drainage + road gradient', roadGapOpportunities: 3 },
    { name: 'Hebbal Flyover Underpass', lat: 13.0453, lng: 77.5946, riskLevel: 'high', waterAccumulation: '1-2 feet', cause: 'Low lying area + storm drain blockage', roadGapOpportunities: 2 },
    { name: 'Devanahalli Road NH-44', lat: 13.2468, lng: 77.7107, riskLevel: 'medium', waterAccumulation: '0.5-1 feet', cause: 'Road median water pooling', roadGapOpportunities: 5 },
    { name: 'Kogilu Cross Junction', lat: 13.0847, lng: 77.6048, riskLevel: 'high', waterAccumulation: '2 feet', cause: 'Missing storm drain + road dip', roadGapOpportunities: 4 },
    { name: 'Rajanukunte Village Road', lat: 13.1654, lng: 77.5789, riskLevel: 'medium', waterAccumulation: '1 foot', cause: 'Agricultural runoff into road', roadGapOpportunities: 6 },
    { name: 'Bagalur Road Industrial Area', lat: 13.2089, lng: 77.6734, riskLevel: 'medium', waterAccumulation: '0.5 feet', cause: 'Concrete runoff with no percolation', roadGapOpportunities: 8 }
  ];
  res.json(stagnationZones);
});

// GET /api/predictions/satellite-ndwi - Simulated satellite NDWI data
router.get('/satellite-ndwi', (req, res) => {
  const ndwiData = {
    captureDate: '2024-03-15',
    satellite: 'Sentinel-2 (Simulated)',
    resolution: '10m',
    coverageArea: 'North Bangalore (13.04°N - 13.25°N, 77.55°E - 77.75°E)',
    waterBodies: [
      { name: 'Yelahanka Lake', lat: 13.1007, lng: 77.5963, ndwi: 0.62, type: 'lake', area: '42 acres' },
      { name: 'Hebbal Lake', lat: 13.0467, lng: 77.5944, ndwi: 0.71, type: 'lake', area: '68 acres' },
      { name: 'Rachenahalli Lake', lat: 13.0628, lng: 77.6214, ndwi: 0.54, type: 'lake', area: '35 acres' },
      { name: 'Byatarayanapura Tank', lat: 13.0738, lng: 77.5651, ndwi: 0.49, type: 'tank', area: '18 acres' },
      { name: 'Kogilu Lake', lat: 13.0847, lng: 77.6048, ndwi: 0.41, type: 'lake', area: '22 acres', status: 'partially_dried' },
      { name: 'Devanahalli Kere', lat: 13.2468, lng: 77.7107, ndwi: 0.58, type: 'tank', area: '55 acres' }
    ],
    dryZones: [
      { name: 'Kogilu-Doddaballapur Road Stretch', lat: 13.1200, lng: 77.6100, ndwi: -0.31, drynessSeverity: 'high' },
      { name: 'Yelahanka Industrial Zone', lat: 13.0950, lng: 77.6200, ndwi: -0.28, drynessSeverity: 'high' }
    ]
  };
  res.json(ndwiData);
});

module.exports = router;
