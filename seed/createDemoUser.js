const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('../models/User');

const createDemoUser = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const exists = await User.findOne({ email: 'test@aquasense.com' });
    if (!exists) {
      const user = new User({
        name: 'Demo User',
        email: 'test@aquasense.com',
        password: 'password123',
        area: '',
      });
      await user.save();
      console.log('✅ Demo user created: test@aquasense.com / password123');
    } else {
      console.log('ℹ️  Demo user already exists');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

createDemoUser();
