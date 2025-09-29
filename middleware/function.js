const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

const VerifyJWT = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied: No or Invalid Token' });
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid or Expired Token' });
  }
};

const generateAuthToken = (user) => {
    const payload = { id: user.id, phone: user.phone };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '2h' });
};

module.exports = { VerifyJWT, generateAuthToken };