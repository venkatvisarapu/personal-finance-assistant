// this file connects our app to the MongoDB database

const mongoose = require("mongoose");

// this is an async function, meaning it will run in the background
const connectDB = async () => {
  try {
    // we try to connect to the database using the link from our .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // if the connection is successful, we print a confirmation message
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    // if something goes wrong, we print the error and stop the app
    console.error(`Error: ${error.message}`);
    process.exit(1); // stop the app if db doesn't connect
  }
};

module.exports = connectDB;
