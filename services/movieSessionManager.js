const movieSessions = new Map(); // { userId: Set(deviceId) }

module.exports = {
    addDevice(userId, deviceId) {
        if (!movieSessions.has(userId)) {
            movieSessions.set(userId, new Set());
        }
        movieSessions.get(userId).add(deviceId);
    },

    removeDevice(userId, deviceId) {
        if (movieSessions.has(userId)) {
            movieSessions.get(userId).delete(deviceId);
            if (movieSessions.get(userId).size === 0) {
                movieSessions.delete(userId);
            }
        }
    },

    getDevices(userId) {
        return movieSessions.get(userId) || new Set();
    },

    getDeviceCount(userId) {
        return this.getDevices(userId).size;
    },

    isDeviceInSession(userId, deviceId) {
        return this.getDevices(userId).has(deviceId);
    },
};
