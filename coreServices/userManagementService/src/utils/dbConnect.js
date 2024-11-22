const mongoose = require('mongoose');

const connectToDatabase = async (dbUri, dbName) => {
    try {
        await mongoose.connect(dbUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log(`Connected to ${dbName} at ${dbUri}`);
    } catch (error) {
        console.error(`Error connecting to ${dbName}: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
