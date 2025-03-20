const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        secure: false,
        maxAge: null,
    },
}));

app.use(express.static("public", { index: false }));

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Moviek",
    database: "Esham",
});

db.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err);
        return;
    }
    console.log("Connected to MySQL (Database: Esham)");
});

// Default Route (Serves Login Page)
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Home.html"));
});

// Start Server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
