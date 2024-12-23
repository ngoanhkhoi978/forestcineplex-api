const User = require('../models/User');
const movieSessionManager = require('../services/movieSessionManager');

const subscriptionLimit = {
    Basic: 1,
    Standard: 2,
    Premium: 4,
};

const checkDeviceLimit = async (req, res, next) => {
    const userId = req.userId;
    const deviceId = req.headers['device-id'];
    const user = await User.findById(userId);

    const deviceCount = movieSessionManager.getDeviceCount(userId);

    console.log(req.headers);

    if (
        deviceCount >= subscriptionLimit[user.subscriptionPlan] &&
        !movieSessionManager.isDeviceInSession(userId, deviceId)
    ) {
        return res
            .status(403)
            .json({ message: 'You have reached the maximum number of devices (4) for this account.' });
    }

    movieSessionManager.addDevice(userId, deviceId);
    console.log(movieSessionManager.getDeviceCount(userId));

    next();
};

module.exports = checkDeviceLimit;
