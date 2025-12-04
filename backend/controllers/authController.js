const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

/**
 * Helper: normalize IPv4/IPv6, drop ::ffff: prefix
 */
function normalizeIp(ip = '') {
  if (!ip) return '';
  // remove IPv6 prefix for IPv4 mapped addresses
  return ip.replace(/^::ffff:/i, '').trim();
}

/**
 * Helper: detect private/internal IPv4 ranges and simple IPv6 checks
 */
function isPrivateIp(ip = '') {
  if (!ip) return true;
  const n = normalizeIp(ip);

  // IPv6 local/loopback checks:
  if (n === '::1' || n.startsWith('fe80') || n.startsWith('fc') || n.startsWith('fd')) {
    return true;
  }

  const parts = n.split('.');
  if (parts.length === 4) {
    const [a, b] = parts.map(Number);
    if (a === 10) return true;
    if (a === 127) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }

  return false;
}

/**
 * Helper: Get best client IP from request (best-effort)
 * - checks x-forwarded-for (left-most public IP)
 * - checks cf-connecting-ip, x-real-ip
 * - falls back to req.ip and socket.remoteAddress
 */
function getClientIp(req) {
  // Prefer Cloudflare connecting IP when present (but still validate)
  const cfIp = req.headers['cf-connecting-ip'];
  if (cfIp && !isPrivateIp(cfIp)) return normalizeIp(cfIp);

  // X-Forwarded-For may be a comma separated list of IPs
  const xffRaw = req.headers['x-forwarded-for'] || req.headers['x-forwarded'] || req.headers['forwarded-for'] || req.headers['forwarded'];
  if (xffRaw) {
    const parts = String(xffRaw).split(',').map(s => s.trim()).filter(Boolean);
    // left-most entry is original client — pick the first public IP if available
    for (const p of parts) {
      if (!isPrivateIp(p)) return normalizeIp(p);
    }
    // fallback to first if all are private/internal
    if (parts.length > 0) return normalizeIp(parts[0]);
  }

  // x-real-ip common header
  const xr = req.headers['x-real-ip'];
  if (xr && !isPrivateIp(xr)) return normalizeIp(xr);

  // Express's req.ip (works well when app.set('trust proxy', true) is configured)
  if (req.ip) {
    const cleaned = normalizeIp(req.ip);
    if (!isPrivateIp(cleaned)) return cleaned;
    // still return it as fallback
    return cleaned;
  }

  // Last resort: socket remote address
  const remote = req.socket && (req.socket.remoteAddress || req.connection?.remoteAddress);
  return normalizeIp(remote || '');
}

/* =========================
   Controller methods
   ========================= */

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Generate employee ID
    const employeeId = await User.generateEmployeeId();

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      department,
      role: role || 'employee',
      employeeId
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get IP and User Agent using helper
    const ipAddress = getClientIp(req) || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Parse browser and device from user agent
    const browser = getBrowser(userAgent);
    const device = getDevice(userAgent);

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // Log failed attempt
      await LoginHistory.create({
        userId: null,
        ipAddress,
        userAgent,
        browser,
        device,
        status: 'failed'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      // Log failed attempt
      await LoginHistory.create({
        userId: user._id,
        ipAddress,
        userAgent,
        browser,
        device,
        status: 'failed'
      });

      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Log successful login
    await LoginHistory.create({
      userId: user._id,
      ipAddress,
      userAgent,
      browser,
      device,
      status: 'success'
    });

    sendTokenResponse(user, 200, res);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get login history (Manager only)
// @route   GET /api/auth/login-history
// @access  Private (Manager)
exports.getLoginHistory = async (req, res) => {
  try {
    const { userId, status, limit = 50 } = req.query;

    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const history = await LoginHistory.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ loginTime: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my login history
// @route   GET /api/auth/my-login-history
// @access  Private
exports.getMyLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find({ userId: req.user.id })
      .sort({ loginTime: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to get token and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      department: user.department
    }
  });
};

// Helper function to parse browser from user agent (case-insensitive)
const getBrowser = (userAgent = '') => {
  const ua = String(userAgent).toLowerCase();
  if (ua.includes('edge')) return 'Edge';
  if (ua.includes('opr') || ua.includes('opera')) return 'Opera';
  if (ua.includes('chrome') && !ua.includes('edge') && !ua.includes('opr')) return 'Chrome';
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari';
  return 'Unknown';
};

// Helper function to parse device from user agent (case-insensitive)
const getDevice = (userAgent = '') => {
  const ua = String(userAgent).toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('ipad')) return 'iPad';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('mobile')) return 'Mobile';
  if (ua.includes('tablet')) return 'Tablet';
  if (ua.includes('windows')) return 'Windows PC';
  if (ua.includes('mac')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  return 'Unknown';
};
