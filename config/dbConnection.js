const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // process.env.DATABASE_URI merupakan connection string dari env var yg udah kita tambahkan di file .env
    await mongoose.connect(process.env.DATABASE_URI);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;
