const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;
let isConnected = false;

const connectDBWithRetry = async (attempt = 1, maxAttempts = 1) => {
  try {
    let uri = process.env.MONGO_URI;

    // Try in-memory MongoDB only if MONGO_URI is default (localhost)
    if (uri && uri.includes('localhost')) {
      try {
        console.log(`📦 Attempting in-memory MongoDB (attempt ${attempt}/${maxAttempts})...`);
        mongod = await MongoMemoryServer.create({
          instance: {
            port: 0,
          },
          binary: {
            skipMD5: true,
          },
          autoStart: true,
          spawn: {
            stdio: 'pipe'
          }
        });
        uri = mongod.getUri();
        console.log('✅ In-memory MongoDB started');
      } catch (mongoError) {
        if (attempt < maxAttempts) {
          console.warn(`⚠️  MongoDB in-memory startup failed (attempt ${attempt}): ${mongoError.message}`);
          console.log(`🔄 Retrying in 3 seconds...`);
          await new Promise(resolve => setTimeout(resolve, 3000));
          return connectDBWithRetry(attempt + 1, maxAttempts);
        } else {
          console.warn(`⚠️  Could not start in-memory MongoDB after ${maxAttempts} attempts. Using connection string from MONGO_URI.`);
          console.log('📝 To use MongoDB Atlas: Update MONGO_URI in .env');
        }
      }
    }

    try {
      const conn = await Promise.race([
        mongoose.connect(uri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 3000,
          connectTimeoutMS: 3000,
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('MongoDB connection timeout after 4s')), 4000)
        )
      ]);
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
      isConnected = true;
      await seedInitialData();
    } catch (connectError) {
      console.warn(`⚠️  MongoDB connection failed: ${connectError.message}`);
      console.log('📝 API will run without persistent DB');
      isConnected = false;
      // Don't throw - let app start
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log('⚠️  Continuing without MongoDB...');
  }
};

const connectDB = () => connectDBWithRetry();

const seedInitialData = async () => {
  try {
    const Sensor = require('../models/Sensor');
    const Zone = require('../models/Zone');
    const User = require('../models/User');

    const existingSensors = await Sensor.countDocuments();
  if (existingSensors > 0) return; // Already seeded

  console.log('🌱 Seeding initial data...');

  const generateReadings = (baseLevel, count = 12) => {
    const readings = [];
    for (let i = count; i >= 0; i--) {
      const noise = (Math.random() - 0.5) * 4;
      const seasonal = Math.sin((i / 12) * Math.PI * 2) * 3;
      readings.push({
        timestamp: new Date(Date.now() - i * 30 * 24 * 60 * 60 * 1000),
        waterLevel: Math.max(1, baseLevel + noise + seasonal),
        depth: baseLevel + 40 + Math.random() * 10,
        ph: 7.0 + (Math.random() - 0.5) * 0.8,
        tds: 300 + Math.random() * 400,
        rechargeRate: Math.random() * 200,
        temperature: 24 + Math.random() * 4
      });
    }
    return readings;
  };

  const sensors = [
    { sensorId: 'SNS-YLK-001', name: 'Yelahanka Borewell Alpha', area: 'Yelahanka', lat: 13.1007, lng: 77.5963, type: 'borewell', status: 'active', readings: generateReadings(18) },
    { sensorId: 'SNS-HBL-002', name: 'Hebbal IoT Sensor Beta', area: 'Hebbal', lat: 13.0453, lng: 77.5946, type: 'borewell', status: 'warning', readings: generateReadings(8) },
    { sensorId: 'SNS-DVN-003', name: 'Devanahalli Ground Monitor', area: 'Devanahalli', lat: 13.2468, lng: 77.7107, type: 'borewell', status: 'active', readings: generateReadings(22) },
    { sensorId: 'SNS-KGL-004', name: 'Kogilu Recharge Sensor', area: 'Kogilu', lat: 13.0847, lng: 77.6048, type: 'recharge', status: 'active', readings: generateReadings(15) },
    { sensorId: 'SNS-RCN-005', name: 'Rachenahalli Surface Monitor', area: 'Rachenahalli', lat: 13.0628, lng: 77.6214, type: 'surface', status: 'active', readings: generateReadings(12) },
    { sensorId: 'SNS-BGR-006', name: 'Bagalur Road Sensor', area: 'Bagalur', lat: 13.2089, lng: 77.6734, type: 'borewell', status: 'critical', readings: generateReadings(5) },
    { sensorId: 'SNS-RNK-007', name: 'Rajanukunte Village Monitor', area: 'Rajanukunte', lat: 13.1654, lng: 77.5789, type: 'borewell', status: 'active', readings: generateReadings(19) },
    { sensorId: 'SNS-DBS-008', name: 'Doddaballapur Sensor Node', area: 'Doddaballapur', lat: 13.2941, lng: 77.5375, type: 'borewell', status: 'active', readings: generateReadings(25) },
  ];

  const zones = [
    { zoneId: 'ZN-PP-001', name: 'Yelahanka Lake Percolation Pond', area: 'Yelahanka', type: 'percolation_pond', priority: 'high', center: { lat: 13.1050, lng: 77.5920 }, coordinates: [{ lat: 13.108, lng: 77.589 }, { lat: 13.108, lng: 77.595 }, { lat: 13.102, lng: 77.595 }, { lat: 13.102, lng: 77.589 }], soilType: 'laterite', rainfallIndex: 970, capacityLiters: 2500000, aiConfidence: 92, description: 'High priority percolation pond adjacent to existing lake.', status: 'proposed' },
    { zoneId: 'ZN-RT-002', name: 'Hebbal Main Road Recharge Trench', area: 'Hebbal', type: 'recharge_trench', priority: 'high', center: { lat: 13.0453, lng: 77.5946 }, coordinates: [{ lat: 13.048, lng: 77.592 }, { lat: 13.048, lng: 77.597 }, { lat: 13.042, lng: 77.597 }, { lat: 13.042, lng: 77.592 }], soilType: 'alluvial', rainfallIndex: 920, capacityLiters: 800000, aiConfidence: 85, description: 'Road-side median converted to recharge trench. 2.3km stretch.', status: 'approved' },
    { zoneId: 'ZN-PP-003', name: 'Devanahalli Airport Road Pond', area: 'Devanahalli', type: 'percolation_pond', priority: 'medium', center: { lat: 13.2468, lng: 77.7107 }, coordinates: [{ lat: 13.250, lng: 77.707 }, { lat: 13.250, lng: 77.714 }, { lat: 13.244, lng: 77.714 }, { lat: 13.244, lng: 77.707 }], soilType: 'sandy', rainfallIndex: 840, capacityLiters: 1800000, aiConfidence: 78, description: 'Sandy soil near airport road. Excellent percolation potential.', status: 'proposed' },
    { zoneId: 'ZN-SR-004', name: 'Kogilu Junction Stagnation Risk', area: 'Kogilu', type: 'stagnation_risk', priority: 'high', center: { lat: 13.0847, lng: 77.6048 }, coordinates: [{ lat: 13.087, lng: 77.602 }, { lat: 13.087, lng: 77.607 }, { lat: 13.082, lng: 77.607 }, { lat: 13.082, lng: 77.602 }], soilType: 'clay', rainfallIndex: 960, capacityLiters: 0, aiConfidence: 96, description: 'Critical stagnation zone. Clay soil + road dip causes 2-ft flooding.', status: 'proposed' },
    { zoneId: 'ZN-RT-005', name: 'Bagalur Road Gap Trench Network', area: 'Bagalur', type: 'road_gap', priority: 'medium', center: { lat: 13.2089, lng: 77.6734 }, coordinates: [{ lat: 13.212, lng: 77.670 }, { lat: 13.212, lng: 77.677 }, { lat: 13.206, lng: 77.677 }, { lat: 13.206, lng: 77.670 }], soilType: 'loamy', rainfallIndex: 890, capacityLiters: 450000, aiConfidence: 71, description: '8 identified road gap locations for modular recharge trenches.', status: 'proposed' },
    { zoneId: 'ZN-CD-006', name: 'Rajanukunte Nala Check Dam', area: 'Rajanukunte', type: 'check_dam', priority: 'high', center: { lat: 13.1654, lng: 77.5789 }, coordinates: [{ lat: 13.168, lng: 77.576 }, { lat: 13.168, lng: 77.582 }, { lat: 13.163, lng: 77.582 }, { lat: 13.163, lng: 77.576 }], soilType: 'laterite', rainfallIndex: 980, capacityLiters: 3200000, aiConfidence: 88, description: 'Check dam can recharge 3.2M liters per monsoon season.', status: 'under_construction' },
  ];

  await Sensor.insertMany(sensors);
  await Zone.insertMany(zones);

  // Create demo user
  const existingUser = await User.findOne({ email: 'test@aquasense.com' });
  if (!existingUser) {
    const user = new User({ name: 'Demo User', email: 'test@aquasense.com', password: 'password123', area: '' });
    await user.save();
    console.log('👤 Demo user created: test@aquasense.com / password123');
  }

  console.log(`✅ Seeded: ${sensors.length} sensors, ${zones.length} zones`);
  } catch (seedError) {
    console.warn(`⚠️  Seeding failed: ${seedError.message}`);
  }
};

module.exports = connectDB;
