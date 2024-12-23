function authorize(requiredRoles) {
    return (req, res, next) => {
        try {
            if (!req.role) {
                return res.status(403).json({ message: 'Role not found. Access denied.' });
            }

            if (!requiredRoles.includes(req.role)) {
                return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
            }
            next();
        } catch (error) {
            console.error('Error in role check middleware:', error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    };
}

module.exports = authorize;
