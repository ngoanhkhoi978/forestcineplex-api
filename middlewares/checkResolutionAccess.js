const User = require('../models/User');

const subscriptionPlans = {
    Basic: '480p',
    Standard: '720p',
    Premium: '1080p',
};

const resolutions = [
    { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
    { name: '720p', width: 1280, height: 720, bitrate: '2800k' },
    { name: '480p', width: 854, height: 480, bitrate: '1400k' },
    { name: '240p', width: 426, height: 240, bitrate: '500k' },
];

const checkResolutionAccess = async (req, res, next) => {
    const { userId } = req;
    const { resolution } = req.params;

    const user = await User.findById(userId);

    const maxAllowedResolution = subscriptionPlans[user.subscriptionPlan];

    if (!maxAllowedResolution) {
        return res.status(403).json({ error: 'Invalid subscription plan' });
    }

    if (compareResolution(resolution, maxAllowedResolution) > 0) {
        return res.status(403).json({
            error: `Your subscription plan (${user.subscriptionPlan}) only allows up to ${maxAllowedResolution}`,
        });
    }

    next();
};

const compareResolution = (res1, res2) => {
    const resolutionPriority = resolutions.map((res) => res.name); // ['1080p', '720p', '480p', '240p']
    return resolutionPriority.indexOf(res1) - resolutionPriority.indexOf(res2);
};
