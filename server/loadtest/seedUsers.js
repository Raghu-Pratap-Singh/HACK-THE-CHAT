require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userModel = require("../models/user-model");

async function main() {

    console.log("Starting...");

    await mongoose.connect(process.env.MONGODB_URI_TEST);

    console.log("Mongo connected");
    await userModel.deleteMany({});
    console.log("Old users deleted");

    let users = [];
    console.log("Creating users...");
    for (let i = 1; i <= 1000; i++) {

        users.push({
            username: `user${i}`,
            email: `user${i}@test.com`,
            password: await bcrypt.hash("123456", 10)
        });
    }

    await userModel.insertMany(users);
    console.log("Users created");
    console.log("1000 users inserted");

    process.exit(0);
}

main();