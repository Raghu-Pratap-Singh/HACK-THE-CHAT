require("dotenv").config();

const express = require("express");
const app = express();
const { createServer } = require("http");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

const usersRouter = require("./routes/usersRouter");
const messageRouter = require("./routes/messageRouter");
const levelRouter = require("./routes/levelRouter");
const treeRouter = require("./routes/treeRouter");
const db = require("./config/mongoose-connection");
const client_port = process.env.CLIENT_PORT

const { initSocket } = require("./socket");

app.use(cors({
    origin: client_port,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// Routes

app.use("/users", usersRouter);
app.use("/messages", messageRouter);
app.use("/LOG", levelRouter);
app.use("/tree", treeRouter);

// Create HTTP Server

const server = createServer(app);


initSocket(server);

// -------------------
// Start Server

const port = process.env.PORT || 8000;

server.listen(port, () => {
    console.log("Server running on port", port);
});