const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = 'mongodb+srv://castroismael571:oNtpxDaFnmvvY7Rb@cluster0.nadpe6y.mongodb.net/?retryWrites=true&w=majority';

    await mongoose.connect(mongoURI, {
      dbName: process.env.dbName,
    });

    logger.info('MongoDB connected');
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
