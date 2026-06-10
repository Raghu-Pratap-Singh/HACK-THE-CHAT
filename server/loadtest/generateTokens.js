require("dotenv").config();

const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const userModel = require("../models/user-model");

async function main() {
    await mongoose.connect(process.env.MONGODB_URI_TEST);

    const users = await userModel.find({});

    const tokens = users.map(user => ({
        userId: user._id.toString(),
        username: user.username,
        email: user.email,
        token: jwt.sign(
            {
                email: user.email,
                id: user._id
            },
            process.env.JWT_KEY,
            {
                expiresIn: "15d"
            }
        )
    }));

    fs.writeFileSync(
        "./loadtest/tokens.json",
        JSON.stringify(tokens, null, 2)
    );

    console.log(`Generated ${tokens.length} tokens`);

    await mongoose.disconnect();
}

main().catch(console.error);