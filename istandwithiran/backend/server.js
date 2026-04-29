const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/istandwithiran';

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
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
  }
});

const Supporter = mongoose.model('Supporter', supporterSchema);

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

// GET /api/stats - Get total supporter count
app.get('/api/stats', statsLimiter, async (req, res) => {
  try {
    const count = await Supporter.countDocuments();
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
