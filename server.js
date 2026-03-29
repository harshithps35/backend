const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// More flexible CORS handling: allow listed dev origins and support requests without an Origin header
// Add any front-end origins that need access here
const whitelist = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://under-water-prediction-frontend2.onrender.com'
];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow server-to-server or curl requests
    if (process.env.NODE_ENV === 'development' || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/sensors', require('./routes/sensors'));
app.use('/api/zones', require('./routes/zones'));
app.use('/api/predictions', require('./routes/predictions'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AquaSense API Running', timestamp: new Date().toISOString() });
});

// Simulate live sensor updates (broadcasts new readings every 10s)
const Sensor = require('./models/Sensor');
setInterval(async () => {
  try {
    const sensors = await Sensor.find({ status: { $ne: 'inactive' } });
    for (const sensor of sensors) {
      const lastReading = sensor.readings[sensor.readings.length - 1] || {};
      const newLevel = Math.max(1, (lastReading.waterLevel || 15) + (Math.random() - 0.5) * 0.3);
      sensor.readings.push({
        timestamp: new Date(),
        waterLevel: parseFloat(newLevel.toFixed(2)),
        depth: lastReading.depth || 50,
        ph: parseFloat((7.0 + (Math.random() - 0.5) * 0.5).toFixed(2)),
        tds: Math.round(300 + Math.random() * 350),
        rechargeRate: parseFloat((Math.random() * 180).toFixed(1)),
        temperature: parseFloat((24 + Math.random() * 4).toFixed(1))
      });
      // Keep only last 50 readings in DB
      if (sensor.readings.length > 50) sensor.readings.shift();
      sensor.lastUpdated = new Date();
      await sensor.save();
    }
  } catch (e) { /* silent fail */ }
}, 10000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AquaSense Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints: /api/auth | /api/sensors | /api/zones | /api/predictions`);
});
