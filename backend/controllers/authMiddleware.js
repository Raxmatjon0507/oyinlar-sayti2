const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Avtorizatsiya talab qilinadi. Token topilmadi.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token yaroqsiz. Foydalanuvchi topilmadi.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Hisobingiz faollashtirilmagan'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token yaroqsiz'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token muddati tugagan. Qaytadan kiring.'
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

module.exports = auth;
