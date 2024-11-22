const { v4 } = require('uuid');
const createIdv4 = (req, res, next) => {
    req.idv4 = v4();
    next();
};

module.exports = createIdv4;
