const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const employeeId = await User.generateEmployeeId();

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

    // Get IP and User Agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown';
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const browser = getBrowser(userAgent);
    const device = getDevice(userAgent);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

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

// @desc    Get all login history (Manager only)
// @route   GET /api/auth/login-history
// @access  Private (Manager)
exports.getLoginHistory = async (req, res) => {
  try {
    const { userId, status, limit = 100 } = req.query;
    
    let query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const history = await LoginHistory.find(query)
      .populate('userId', 'name email employeeId department')
      .sort({ loginTime: -1 })
      .limit(parseInt(limit));

    // Get stats
    const totalLogins = await LoginHistory.countDocuments({ status: 'success' });
    const failedLogins = await LoginHistory.countDocuments({ status: 'failed' });
    const todayLogins = await LoginHistory.countDocuments({
      status: 'success',
      loginTime: { $gte: new Date().setHours(0, 0, 0, 0) }
    });

    res.status(200).json({
      success: true,
      count: history.length,
      stats: {
        totalLogins,
        failedLogins,
        todayLogins
      },
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

// Helper function to parse browser
const getBrowser = (userAgent) => {
  if (userAgent.includes('Chrome') && !userAgent.includes('Edge')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Helper function to parse device
const getDevice = (userAgent) => {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('Android') && userAgent.includes('Mobile')) return 'Android Phone';
  if (userAgent.includes('Android')) return 'Android Tablet';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown';
};