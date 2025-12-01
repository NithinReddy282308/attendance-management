const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

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

    // Get IP and User Agent
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip || 'Unknown';
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

// Helper function to parse browser from user agent
const getBrowser = (userAgent) => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

// Helper function to parse device from user agent
const getDevice = (userAgent) => {
  if (userAgent.includes('Mobile')) return 'Mobile';
  if (userAgent.includes('Tablet')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown';
};