const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongodb:27017/myapp';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Redis Connection
const redisClient = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error:', err));
redisClient.on('connect', () => console.log('✅ Redis connected successfully'));

redisClient.connect();

// Simple User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to 4-Tier Application API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  const health = {
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    redis: redisClient.isOpen ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  };
  res.json(health);
});

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    // Try to get from Redis cache first
    const cachedUsers = await redisClient.get('users');
    
    if (cachedUsers) {
      console.log('📦 Returning cached users from Redis');
      return res.json({ 
        source: 'cache',
        data: JSON.parse(cachedUsers) 
      });
    }

    // If not in cache, get from MongoDB
    const users = await User.find();
    
    // Store in Redis cache for 60 seconds
    await redisClient.setEx('users', 60, JSON.stringify(users));
    
    console.log('💾 Returning users from MongoDB and caching');
    res.json({ 
      source: 'database',
      data: users 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = new User({ name, email });
    await user.save();
    
    // Invalidate cache
    await redisClient.del('users');
    
    res.status(201).json({ 
      message: 'User created successfully',
      data: user 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Test Redis
app.get('/api/cache/test', async (req, res) => {
  try {
    const key = 'test_key';
    const value = `Test value at ${new Date().toISOString()}`;
    
    await redisClient.setEx(key, 30, value);
    const retrieved = await redisClient.get(key);
    
    res.json({
      message: 'Redis test successful',
      stored: value,
      retrieved: retrieved
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
});
