const mongoose = require("mongoose");


const connectDB = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URI
        );

        return true;

    } catch (error) {

        console.error(
            "MongoDB connection failed:",
            error.message
        );

        return false;

    }

};


module.exports = connectDB;