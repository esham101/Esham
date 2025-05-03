const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const session = require("express-session");
const path = require("path");
const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
require("dotenv").config();

const saltRounds = 10;
const app = express();

// Dynamic import for node-fetch (ESM compatibility)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

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

db.connect(err => {
  if (err) throw err;
  console.log("✅ Connected to MySQL Database");
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
  let { fullname, idnumber, phone, email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.redirect("/register?error=Invalid email format");
  }

  phone = '+966' + phone;

  db.query("SELECT * FROM landowners WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("MySQL Error:", err);
      return res.send("Database error!");
    }

    if (results.length > 0) {
      console.log("Email already exists:", email);
      return res.redirect("/register?error=Email already exists");
    }

    // ✅ Email does not exist — continue to hash and insert
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error encrypting password:", err);
        return res.send("Error encrypting password");
      }

      console.log("Hashed Landowner Password:", hash);

      const insertSql = `
        INSERT INTO landowners (name, id_number, phone, email, password)
        VALUES (?, ?, ?, ?, ?)
      `;

      db.query(insertSql, [fullname, idnumber, phone, email, hash], (err, result) => {
        if (err) {
          console.error("Error registering user:", err);
          return res.send("Error registering user");
        }

        res.redirect("/");
      });
    });
  });
});



app.post("/register/realestate", (req, res) => {
  console.log("Request Body:", req.body); // Log the incoming request body

  let { company, businessReg, taxId, address, email, phone, password } = req.body;

  // Check if all fields are present
  if (!company || !businessReg || !taxId || !address || !email || !phone || !password) {
    console.log("Missing fields in request body:", req.body);
    return res.redirect("/register?error=Missing required fields");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*_\-=+~]).{10,15}$/;

  // Validate email
  if (!emailRegex.test(email)) {
    console.log("Invalid email format:", email);
    return res.redirect("/register?error=Invalid email format");
  }

  // Validate password
  if (!passwordRegex.test(password)) {
    console.log("Password does not meet requirements:", password);
    return res.redirect("/register?error=Password requirements not met");
  }

  // Format phone number
  phone = '+966' + phone;

  // Check if email already exists
  db.query("SELECT * FROM realestates WHERE email = ?", [email], (err, results) => {
    if (err) {
      console.error("Database error during email check:", err);
      return res.send("Database error!");
    }

    if (results.length > 0) {
      console.log("Email already exists:", email);
      return res.redirect("/register?error=Email already exists");
    }

    // Hash the password
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        console.error("Error encrypting password:", err);
        return res.send("Error encrypting password");
      }

      // Insert into database
      const insertSql = `
        INSERT INTO realestates (company_name, business_reg, tax_id, address, email, phone, password)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(insertSql, [company, businessReg, taxId, address, email, phone, hash], (err, result) => {
        if (err) {
          console.error("Error inserting real estate record:", err);
          return res.send("Error registering user");
        }
        console.log("Real estate registration successful:", result);
        res.redirect("/");
      });
    });
  });
});


// Login Handler
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM landowners WHERE email = ?", [email], (err, landResults) => {
    if (err) return res.send("Database error!");

    if (landResults.length > 0) {
      const user = landResults[0];
      bcrypt.compare(password, user.password, (err, result) => {
        if (result) {
          req.session.user = {
            id: user.landowner_id,
            name: user.name,
            email: user.email,
            role: "landowner"
          };
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
              req.session.user = {
                id: user.realestate_id,
                name: user.company_name,
                email: user.email,
                role: "realestate"
              };
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

app.get("/update-account", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  res.sendFile(path.join(__dirname, "public", "UpdateAccount.html"));
});

// Handle Update Name request
// Update Account Handler
app.post("/update-account", (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  const newName = req.body.name;
  const userId = req.session.user.id;
  const userRole = req.session.user.role;

  const table = userRole === "landowner" ? "landowners" : "realestates";
  const idColumn = userRole === "landowner" ? "landowner_id" : "realestate_id";
  const nameColumn = userRole === "landowner" ? "name" : "company_name";

  const sql = `UPDATE ${table} SET ${nameColumn} = ? WHERE ${idColumn} = ?`;

  db.query(sql, [newName, userId], (err, result) => {
    if (err) {
      console.error("❌ Error updating name:", err);
      return res.status(500).send("An error occurred while updating your name.");
    }

    req.session.user.name = newName;
    res.redirect("/update-account?success=1");
  });
});


// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: storage });

// Add land listing
app.post("/add-land", upload.fields([{ name: "titleDeed" }, { name: "landImage" }]), (req, res) => {
  // ✅ Only landowners can access
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).send("❌ Only landowners can add lands.");
  }

  const {
    streetName, neighborhood, city, landSize,
    height, width, streetWidth, hasBuilding,
    pricePerMeter, purpose, facing
  } = req.body;

  const titleDeedPath = ("/uploads/" + req.files["titleDeed"][0].filename).trim();
  const landImagePath = ("/uploads/" + req.files["landImage"][0].filename).trim();
  const landownerId = req.session.user.id;

  const sql = `
    INSERT INTO lands 
    (street_name, neighborhood, city, land_size, height, width, street_width, has_building, price_per_meter, purpose, facing, title_deed, land_image, landowner_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    streetName, neighborhood, city, landSize, height, width,
    streetWidth, hasBuilding === "yes", pricePerMeter,
    purpose, facing, titleDeedPath, landImagePath, landownerId
  ], (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send("Failed to save land.");
    }
    res.redirect("/LandListing.html");
  });
});

app.get("/api/lands", (req, res) => {
  const sql = `
  SELECT 
    lands.*, 
    landowners.name AS owner_name 
  FROM lands 
  LEFT JOIN landowners ON lands.landowner_id = landowners.landowner_id 
  ORDER BY lands.land_id DESC
`;

  
  db.query(sql, (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error", details: err.message });
    }
    res.json(results);
  });
});




// ✅ Get single land by ID
app.get("/api/lands/:id", (req, res) => {
  const landId = req.params.id;
  const sql = `
    SELECT lands.*, landowners.name AS owner_name
    FROM lands 
    LEFT JOIN landowners ON lands.landowner_id = landowners.landowner_id
    WHERE lands.land_id = ?
  `;
  db.query(sql, [landId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).send("Database error");
    }
    if (results.length === 0) {
      return res.status(404).send("Land not found");
    }
    res.json(results[0]);
  });
});





// =================== LANDOWNER ROLE DUMMY API ROUTES ===================

// Landowner User Profile
// Get Landowner by ID (updated to landowner_id)
app.get("/api/landowner/user/:id", (req, res) => {
  const userId = req.params.id;

  const sql = "SELECT name FROM landowners WHERE landowner_id = ?";
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("❌ MySQL error fetching landowner:", err);
      return res.status(500).json({ error: "Database error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Landowner not found" });
    }

    res.json(results[0]);
  });
});


app.get("/api/landowner/lands", (req, res) => {
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const landownerId = req.session.user.id;

  const sql = `
    SELECT land_id, land_size, price_per_meter
    FROM lands
    WHERE landowner_id = ?
    ORDER BY land_id DESC
  `;

  db.query(sql, [landownerId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

app.get("/api/session", (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});


// Landowner Settings
app.get("/api/landowner/settings/:id", (req, res) => {
  res.json({ dark_mode: false });
});

// Landowner Proposals
app.get("/api/landowner/proposals", (req, res) => {
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const landownerId = req.session.user.id;

  const sql = `
    SELECT 
      proposals.proposal_id,
      proposals.title,
      proposals.submitted_at AS date,
      proposals.status,
      realestates.company_name AS developer_name,
      lands.street_name
    FROM proposals
    JOIN realestates ON proposals.realestate_id = realestates.realestate_id
    JOIN lands ON proposals.land_id = lands.land_id
    WHERE proposals.landowner_id = ?
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [landownerId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map(p => ({
      id: p.proposal_id,
      name: p.developer_name,
      street: p.street_name,
      title: p.title,
      date: p.date ? new Date(p.date).toISOString().split("T")[0] : "N/A",
      status: p.status
    }));

    res.json(formatted);
  });
});

app.post("/api/landowner/counter-proposal", (req, res) => {
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const {
    proposal_id,
    land_id,
    landowner_id,
    revenue_split,
    payment_freq,
    revenue_type,
    reporting
  } = req.body;

  const sql = `
  UPDATE proposals
  SET status = 'Countered',
      revenue_split = ?,
      payment_freq = ?,
      revenue_type = ?,
      reporting = ?,
      submitted_at = NOW()
  WHERE proposal_id = ? AND landowner_id = ? AND land_id = ?
`;

  db.query(sql, [
    revenue_split, payment_freq, revenue_type, reporting,
    proposal_id, landowner_id, land_id
  ], (err) => {
    if (err) {
      console.error("❌ Error updating proposal with counter offer:", err);
      return res.status(500).json({ message: "Database update failed" });
    }
    res.json({ message: "Counter proposal submitted successfully" });
  });
});

app.get('/api/proposals/:id', (req, res) => {
  const proposalId = req.params.id;
  const query = 'SELECT * FROM proposals WHERE proposal_id = ?';

  db.query(query, [proposalId], (err, results) => {
    if (err) {
      console.error('Error fetching proposal by ID:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json(results[0]);
  });
});


app.get("/api/realestate/proposals/accepted", (req, res) => {
  if (!req.session.user || req.session.user.role !== "realestate") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const realestateId = req.session.user.id;

  const sql = `
    SELECT 
      proposals.title,
      proposals.submitted_at AS date,
      proposals.status,
      landowners.name AS landowner_name
    FROM proposals
    JOIN landowners ON proposals.landowner_id = landowners.landowner_id
    WHERE proposals.realestate_id = ? AND proposals.status = 'Accepted'
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [realestateId], (err, results) => {
    if (err) {
      console.error("Accepted proposals query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map(row => ({
      name: row.landowner_name,
      date: new Date(row.date).toISOString().split("T")[0],
      status: row.status
    }));

    res.json(formatted);
  });
});


// Landowner Revenue
app.get("/api/landowner/revenue", (req, res) => {
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const landownerId = req.session.user.id;

  const sql = `
    SELECT 
      proposals.title AS project,
      proposals.submitted_at AS date,
      proposals.budget AS revenue
    FROM proposals
    WHERE landowner_id = ? AND status = 'Accepted'
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [landownerId], (err, results) => {
    if (err) {
      console.error("Revenue query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map(row => ({
      project: row.project,
      date: new Date(row.date).toISOString().split("T")[0],
      revenue: row.revenue
    }));

    res.json(formatted);
  });
});


// Landowner Properties
app.get("/api/landowner/properties", (req, res) => {
  res.json([
    { property_name: "Landowner Villa", owner_name: "Owner Y", status: "Active", monthly_rent: 4000, description: "Nice villa for landowner." }
  ]);
});


// =================== AI ROUTES ===================

app.post("/voice-question", upload.single("audio"), async (req, res) => {
  try {
    const audioData = fs.readFileSync(req.file.path);

    const uploadRes = await fetch("https://api.assemblyai.com/v2/upload", {
      method: "POST",
      headers: { authorization: process.env.ASSEMBLYAI_API_KEY },
      body: audioData
    });
    const { upload_url } = await uploadRes.json();

    const transcriptRes = await fetch("https://api.assemblyai.com/v2/transcript", {
      method: "POST",
      headers: {
        authorization: process.env.ASSEMBLYAI_API_KEY,
        "content-type": "application/json"
      },
      body: JSON.stringify({ audio_url: upload_url })
    });
    const { id } = await transcriptRes.json();

    let transcript;
    while (true) {
      const poll = await fetch(`https://api.assemblyai.com/v2/transcript/${id}`, {
        headers: { authorization: process.env.ASSEMBLYAI_API_KEY }
      });
      transcript = await poll.json();
      if (transcript.status === "completed") break;
      if (transcript.status === "error") throw new Error("Transcription failed.");
      await new Promise(r => setTimeout(r, 2000));
    }

    const question = transcript.text;
    const answer = await askGPT(question);
    fs.unlinkSync(req.file.path);
    res.json({ message: answer });

  } catch (error) {
    console.error("Voice Q&A error:", error);
    res.status(500).json({ message: "Something went wrong processing your voice question." });
  }
});

app.post("/text-question", async (req, res) => {
  const question = req.body.text;
  if (!question?.trim()) {
    return res.status(400).json({ message: "No question provided." });
  }

  try {
    const answer = await askGPT(question);
    res.json({ message: answer });
  } catch (error) {
    console.error("Text Q&A error:", error);
    res.status(500).json({ message: "Something went wrong processing your question." });
  }
});

// ✅ OpenAI Assistant Helper
async function askGPT(question) {
  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `
You are Musahem — the official AI assistant for the Esham platform.

Esham is a smart digital platform based in Saudi Arabia that connects landowners and real estate developers to collaborate on real estate development projects. Users can register, list lands, submit proposals, manage contracts, and communicate via the platform.

Your mission is to accurately and clearly answer any question related to using the Esham platform, whether it's one word or a full sentence. You are only allowed to answer questions related to Esham — if it's about another company or general AI topics, reply:

"I’m Musahem — I can only help with Esham-related topics like registration, land listings, proposals, and using the platform."

You must understand and respond to both English and Arabic messages, always using Modern Standard Arabic (فصحى) when replying in Arabic.

Here’s everything you must know:

REGISTRATION

1. Landowner Sign-Up:
- Full name, 10-digit national ID, +9665 phone number, valid email (OTP required), secure password (10–15 characters, uppercase, lowercase, special character), and agreement to Terms.
- Can use Google Sign-Up (autofills known fields, asks for missing required fields).

2. Developer Sign-Up:
- Company name, business registration number, tax ID, commercial registration, real estate license, address, official email, phone, secure password, OTP verification, and agreement to Terms.
- Google Sign-Up is supported.

LOGIN

- Both roles log in using email/password or Google.
- Google login checks for existing account and asks for missing required fields.

LAND LISTING (Landowners only)

- Required fields: street, city, neighborhood, size, width/height, street width, existing building (yes/no), land facing (North, West, East, South), land use (residential/commercial), price per meter, title deed upload.
- The system verifies the title deed. After approval, a notification is sent and the land appears in the listings.

PROPOSALS

1. For Developers:
- Browse available lands and submit one proposal per property.
- Must include: project risk assessment (legal, market, financial, etc.), duration in months, total cost in SAR, profit-sharing percentage, and optional notes.

2. For Landowners:
- Receive proposals in a dedicated Proposal Box.
- Options: Accept (auto-generates contract and moves to Direct Message system), Counter (reply with modifications), Deny (rejects and ends the proposal).
- If accepted, the project appears in the progress tracker for both parties.

Counteroffers:
- Developers may respond to counteroffers with adjusted terms.
- The full proposal and negotiation history is saved.

PROPOSAL STATUS

Statuses: Pending, Accepted, Counteroffer, Denied.
All changes and decisions are saved for both users.

HOME PAGE

- Navigation includes: Home, Sign Up, Login, Account dropdown (Dashboard, Update Info, Logout), Who Are We, FAQs, and Contact Us.
- FAQ topics:
  - What is Esham?
  - How do I list land?
  - Is there a fee?
  - Can I contact landlords directly?
  - How secure is my information?

CONTACT US

- Contact form fields: First Name, Last Name, Email, Phone (optional), and Message.
- Required fields must be filled to submit.
- The system shows success or error messages depending on validation.

MUSAHEM — AI ASSISTANT

- Responds to voice or text questions about Esham.
- Users can press a Stop button to stop Musahem from speaking.
- A Copy Answer button allows copying Musahem’s replies.
- If asked something off-topic: "I’m not completely sure, but I can definitely help with anything related to using the Esham platform."

PLATFORM OVERVIEW (What is Esham?)

Esham is a digital-first platform that connects landowners with real estate developers in Saudi Arabia. It simplifies the development process by offering land listing, proposal management, messaging, and AI-driven analytics. Esham improves transparency, automates compliance, enhances collaboration, and supports scalability for real estate development projects.

NON-FUNCTIONAL FEATURES

- Multilingual support (Arabic and English)
- Response time under 3 seconds for login/forms
- Password hashing, session logout after 30 minutes
- Modular, maintainable backend in Node.js with MySQL
- Mobile and desktop browser support (no app required)
- Can support over 100 concurrent users

EXAMPLE QUESTIONS

- "How do I sign up as a developer?"
- "What’s required to list land?"
- "Where do proposals appear?"
- "Does Esham offer funding?" (Answer: No)
- "Title deed?" (Explain it is mandatory for land listing)
- "One word: proposal" (Explain how developers submit proposals)
- "What is Esham?" (Answer above)

If someone says:
- “?”, “assistant”, “support”, “help”, “who are you?”, “مساعد”, “عرض”, “تسجيل”
You must say:
"I’m Musahem — your personal assistant on the Esham platform. I can help you with registering, listing lands, sending or receiving proposals, or understanding how Esham works."

If the Arabic message is vague, respond:
"أستطيع مساعدتك في كل ما يتعلق بمنصة إسهام، مثل التسجيل، العروض، أو إضافة الأراضي. فقط أخبرني بما تحتاجه."

If you are not completely sure about the answer:
"I’m not completely sure, but I can definitely help with anything related to using the Esham platform."
`
        },
        {
          role: "user",
          content: question
        }
      ]
    })
  });

  const gptData = await openaiRes.json();
  console.log("🔍 GPT Full Response:", JSON.stringify(gptData, null, 2));

  if (gptData.choices && gptData.choices.length > 0 && gptData.choices[0].message && gptData.choices[0].message.content) {
    return gptData.choices[0].message.content;
  } else {
    console.error("GPT Error:", gptData);
    return "Sorry, I couldn't find an answer.";
  }
}

// =================== REAL ESTATE DEVELOPER ROLE DUMMY API ROUTES ===================
// ✅ Developer Proposals
app.get("/api/realestate/proposals", (req, res) => {
  if (!req.session.user || req.session.user.role !== "realestate") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const developerId = req.session.user.id;
  const sql = `
    SELECT proposals.*, lands.street_name, landowners.name AS owner_name
    FROM proposals
    JOIN lands ON proposals.land_id = lands.land_id
    JOIN landowners ON proposals.landowner_id = landowners.landowner_id
    WHERE proposals.realestate_id = ?
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [developerId], (err, results) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json(results);
  });
});


app.get("/api/realestate/revenue", (req, res) => {
  if (!req.session.user || req.session.user.role !== "realestate") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const realestateId = req.session.user.id;

  const sql = `
    SELECT 
      proposals.title AS project,
      proposals.submitted_at AS date,
      proposals.budget AS revenue
    FROM proposals
    WHERE realestate_id = ? AND status = 'Accepted'
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [realestateId], (err, results) => {
    if (err) {
      console.error("Revenue query error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    const formatted = results.map(row => ({
      project: row.project,
      date: new Date(row.date).toISOString().split("T")[0],
      revenue: row.revenue
    }));

    res.json(formatted);
  });
});



app.post("/api/proposals", (req, res) => {
  const {
    realestate_id,
    land_id,
    title,
    description,
    objectives,
    budget,
    start_date,
    duration_value,
    duration_unit,
    revenue_split,
    payment_freq,
    revenue_type,
    reporting,
    email,
    contact_start_time,
    contact_end_time,
    confirmed_info,
    accepted_terms
  } = req.body;

  // 🔍 Step 1: Get landowner_id using land_id
  db.query("SELECT landowner_id FROM lands WHERE land_id = ?", [land_id], (err, results) => {
    if (err) {
      console.error("Error fetching landowner_id:", err);
      return res.status(500).json({ message: "Database error (landowner lookup)" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid land_id — land not found" });
    }

    const landowner_id = results[0].landowner_id;

    // ✅ Step 2: Proceed to insert the proposal
    const sql = `
    INSERT INTO proposals (
      landowner_id, realestate_id, land_id, title, description, objectives,
      budget, start_date, duration_value, duration_unit, revenue_split,
      payment_freq, revenue_type, reporting, email,
      contact_start_time, contact_end_time, confirmed_info, accepted_terms, status, submitted_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', NOW())
  `;
  

  const values = [
    landowner_id, realestate_id, land_id, title, description, objectives,
    budget, start_date, duration_value, duration_unit, revenue_split,
    payment_freq, revenue_type, reporting, email,
    contact_start_time, contact_end_time, confirmed_info, accepted_terms
  ];
  

    db.query(sql, values, (err, result) => {
      if (err) {
        console.error("Insert failed:", err);
        return res.status(500).json({ message: "Submission failed" });
      }

      res.status(200).json({ message: "Proposal submitted successfully" });
    });
  });
});


app.get("/api/landowner/proposals", (req, res) => {
  if (!req.session.user || req.session.user.role !== "landowner") {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const landownerId = req.session.user.id;

  const sql = `
    SELECT proposals.*, realestates.company_name AS developer_name, lands.street_name
    FROM proposals
    JOIN lands ON proposals.land_id = lands.land_id
    JOIN realestates ON proposals.realestate_id = realestates.realestate_id
    WHERE proposals.landowner_id = ?
    ORDER BY proposals.submitted_at DESC
  `;

  db.query(sql, [landownerId], (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ message: "Database error" });
    }

    res.json(results);
  });
});

// Accept Proposal
app.put("/api/proposals/:id/accept", (req, res) => {
  const proposalId = req.params.id;
  db.query("UPDATE proposals SET status = 'Accepted' WHERE proposal_id = ?", [proposalId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to accept proposal" });
    res.json({ success: true });
  });
});

// Reject Proposal
app.put("/api/proposals/:id/reject", (req, res) => {
  const proposalId = req.params.id;
  db.query("UPDATE proposals SET status = 'Rejected' WHERE proposal_id = ?", [proposalId], (err) => {
    if (err) return res.status(500).json({ error: "Failed to reject proposal" });
    res.json({ success: true });
  });
});

// Counter Offer
app.put("/api/proposals/:id/counter", (req, res) => {
  const proposalId = req.params.id;

  db.query(`
    UPDATE proposals
    SET status = 'Countered',
        counter_offer = NULL
    WHERE proposal_id = ?

  `, [proposalId], (err, result) => {
    if (err) {
      console.error("Error updating proposal counter_offer:", err);
      return res.status(500).json({ message: "Update failed" });
    }
    res.json({ message: "Counter offer updated" });
  });
});

// Accept counter proposal
app.put("/api/proposals/:id/accept-counter", (req, res) => {
  const proposalId = req.params.id;
  const sql = `UPDATE proposals SET status = 'Accepted' WHERE proposal_id = ?`;

  db.query(sql, [proposalId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating proposal" });
    res.json({ message: "Counter offer accepted." });
  });
});

// Reject counter proposal
app.put("/api/proposals/:id/reject-counter", (req, res) => {
  const proposalId = req.params.id;
  const sql = `UPDATE proposals SET status = 'Rejected' WHERE proposal_id = ?`;

  db.query(sql, [proposalId], (err, result) => {
    if (err) return res.status(500).json({ message: "Error updating proposal" });
    res.json({ message: "Counter offer rejected." });
  });
});


// Contact Us route
app.post("/contact", (req, res) => {
  const { FirstName, LastName, Email, PhoneNumber, Message } = req.body;

  const sql = `
    INSERT INTO contact_messages (first_name, last_name, email, phone, message)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql, [FirstName, LastName, Email, PhoneNumber, Message], (err) => {
    if (err) {
      console.error("❌ Error saving contact message:", err);
      return res.status(500).json({ success: false, message: "Database error" });
    }
    res.json({ success: true, message: "Message received successfully!" });
  });
});





app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
