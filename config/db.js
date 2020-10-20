const mongoose = require("mongoose");
const config = require("config");

//to be changed to env variable connected to db.js
const db = config.get("mongoURI");

const connectDB = async () => {
    try {
        await mongoose.connect(db, {
            useUnifiedTopology: true, 
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify:false
        });

        console.log("MongoDB Connected...");
    } catch (err) {
        console.error(err.message);

        process.exit(1); //1= failure
    }
};

module.exports = connectDB;
