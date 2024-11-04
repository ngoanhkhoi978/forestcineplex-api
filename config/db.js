const mongoose = require('mongoose');

const connect = async () => {
    try {
        const conn = await mongoose.connect('mongodb://localhost:27017/forestcineplex', {});
        console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
    }
};

module.exports = { connect };
