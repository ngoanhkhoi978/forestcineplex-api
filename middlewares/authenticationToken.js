const jwt = require('jsonwebtoken');
const env = require('../config/environment');

const authenticationToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(400).json({ error: 'Access denied' });
    }
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Unable to verify token' });
        }
        req.userId = decoded.userId;
        req.role = decoded.role;

        next();
    });
};

module.exports = authenticationToken;
