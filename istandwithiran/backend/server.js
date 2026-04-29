const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/istandwithiran';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Rate limiting for support submissions (prevent spam)
const supportLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many submissions from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for stats endpoint (more lenient)
const statsLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // limit each IP to 30 requests per minute
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for admin login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: { error: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Supporter Schema
const supporterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  country: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 100
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ip: {
    type: String,
    required: false
  },
  verified: {
    type: Boolean,
    default: true // Auto-verify by default, can be changed via admin
  }
});

const Supporter = mongoose.model('Supporter', supporterSchema);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = user;
    next();
  });
};

// POST /api/support - Add new supporter
app.post('/api/support', 
  supportLimiter,
  [
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters'),
    body('country')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Country must be between 2 and 100 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, country } = req.body;
      
      const supporter = new Supporter({
        name,
        country,
        ip: req.ip || req.connection.remoteAddress
      });

      await supporter.save();
      
      res.status(201).json({ 
        success: true, 
        message: 'Thank you for your support!',
        supporter: { name: supporter.name, country: supporter.country }
      });
    } catch (error) {
      console.error('Error saving supporter:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to save support. Please try again.' 
      });
    }
  }
);

// GET /api/stats - Get total supporter count (only verified supporters)
app.get('/api/stats', statsLimiter, async (req, res) => {
  try {
    const count = await Supporter.countDocuments({ verified: true });
    res.json({ 
      success: true, 
      count: count,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

// POST /api/admin/login - Admin login
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ success: true, token });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

// GET /api/admin/supporters - Get all supporters (protected)
app.get('/api/admin/supporters', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50, verified, search } = req.query;
    const query = {};
    
    if (verified !== undefined) {
      query.verified = verified === 'true';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } }
      ];
    }

    const supporters = await Supporter.find(query)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Supporter.countDocuments(query);

    res.json({
      success: true,
      supporters,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching supporters:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch supporters' 
    });
  }
});

// DELETE /api/admin/supporter/:id - Delete a supporter (protected)
app.delete('/api/admin/supporter/:id', authenticateToken, async (req, res) => {
  try {
    const supporter = await Supporter.findByIdAndDelete(req.params.id);
    
    if (!supporter) {
      return res.status(404).json({ error: 'Supporter not found' });
    }

    res.json({ success: true, message: 'Supporter deleted successfully' });
  } catch (error) {
    console.error('Error deleting supporter:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete supporter' 
    });
  }
});

// PATCH /api/admin/supporter/:id/verify - Verify/unverify a supporter (protected)
app.patch('/api/admin/supporter/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { verified } = req.body;
    
    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: 'Verified must be a boolean' });
    }

    const supporter = await Supporter.findByIdAndUpdate(
      req.params.id,
      { verified },
      { new: true }
    );
    
    if (!supporter) {
      return res.status(404).json({ error: 'Supporter not found' });
    }

    res.json({ 
      success: true, 
      message: `Supporter ${verified ? 'verified' : 'unverified'} successfully`,
      supporter
    });
  } catch (error) {
    console.error('Error updating supporter:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update supporter' 
    });
  }
});

// GET /api/admin/export/csv - Export supporters as CSV (protected)
app.get('/api/admin/export/csv', authenticateToken, async (req, res) => {
  try {
    const supporters = await Supporter.find({}).sort({ timestamp: -1 });
    
    const csvWriter = createObjectCsvWriter({
      header: [
        { id: 'name', title: 'Name' },
        { id: 'country', title: 'Country' },
        { id: 'timestamp', title: 'Timestamp' },
        { id: 'verified', title: 'Verified' }
      ],
      path: '/tmp/supporters.csv'
    });

    const csvData = supporters.map(s => ({
      name: s.name,
      country: s.country,
      timestamp: s.timestamp.toISOString(),
      verified: s.verified ? 'Yes' : 'No'
    }));

    await csvWriter.writeRecords(csvData);
    
    // Read the file and send it
    const fs = require('fs');
    const fileContent = fs.readFileSync('/tmp/supporters.csv');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="supporters-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(fileContent);
    
    // Clean up
    fs.unlinkSync('/tmp/supporters.csv');
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to export CSV' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
