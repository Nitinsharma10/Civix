const rateLimit = require('express-rate-limit');

// Strict rate limit for AI preview endpoint - 10 requests per 15 minutes
// (This endpoint calls expensive n8n webhook + AI analysis)
const aiPreviewLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit to 10 AI analyses per 15 minutes per IP
  message: {
    success: false,
    message: 'AI analysis rate limit exceeded. Please wait before analyzing more issues.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// Rate limit for creating issues - 20 per 15 minutes
const createIssueLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Too many issues created. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

// Rate limit for comments/upvotes - 100 per 15 minutes
const interactionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many interactions. Please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1',
});

module.exports = {
  aiPreviewLimiter,
  createIssueLimiter,
  interactionLimiter,
};
