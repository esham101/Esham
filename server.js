const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(session({
    secret: "yourSecretKey",
    resave: false,
    saveUninitialized: true,
}));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "esham",
});

db.connect((err) => {
    if (err) throw err;
    console.log(" Connected to MySQL Database");
});


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Home.html"));
});

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Registeration.html"));
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "Registeration.html"));
});


app.post("/register/landowner", (req, res) => {
    const { fullname, idnumber, phone, email, password } = req.body;

    db.query("SELECT * FROM landowners WHERE email = ?", [email], (err, results) => {
        if (err) return res.send("Database error!");

        if (results.length > 0) {
            return res.redirect("/register?error=Email already exists");
        }

        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.send("Error encrypting password");

            console.log("Hashed Landowner Password:", hash);

            const insertSql = `
                INSERT INTO landowners (name, id_number, phone, email, password)
                VALUES (?, ?, ?, ?, ?)
            `;
            db.query(insertSql, [fullname, idnumber, phone, email, hash], (err, result) => {
                if (err) return res.send("Error registering user");
                res.redirect("/");
            });
        });
    });
});


app.post("/register/realestate", (req, res) => {
    const { company, businessReg, taxId, address, email, phone, password } = req.body;

    db.query("SELECT * FROM realestates WHERE email = ?", [email], (err, results) => {
        if (err) return res.send("Database error!");

        if (results.length > 0) {
            return res.redirect("/register?error=Email already exists");
        }

        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) return res.send("Error encrypting password");

            console.log("Hashed RealEstate Password:", hash);

            const insertSql = `
                INSERT INTO realestates (company_name, business_reg, tax_id, address, email, phone, password)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            db.query(insertSql, [company, businessReg, taxId, address, email, phone, hash], (err, result) => {
                if (err) return res.send("Error registering user");
                res.redirect("/");
            });
        });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    db.query("SELECT * FROM landowners WHERE email = ?", [email], (err, landResults) => {
        if (err) return res.send("Database error!");

        if (landResults.length > 0) {
            const user = landResults[0];
            bcrypt.compare(password, user.password, (err, result) => {
                if (result) {
                    req.session.user = user;
                    return res.redirect("/");
                } else {
                    return res.redirect("/login?error=Incorrect password");
                }
            });
        } else {
            db.query("SELECT * FROM realestates WHERE email = ?", [email], (err, realResults) => {
                if (err) return res.send("Database error!");

                if (realResults.length > 0) {
                    const user = realResults[0];
                    bcrypt.compare(password, user.password, (err, result) => {
                        if (result) {
                            req.session.user = user;
                            return res.redirect("/");
                           
                        } else {
                            return res.redirect("/login?error=Incorrect password");
                        }
                    });
                } else {
                    return res.redirect("/login?error=Account not found. Please register first.");
                }
            });
        }
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});


app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
