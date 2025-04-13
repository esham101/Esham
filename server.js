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

// Registration and login routes...

app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Multer for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname)
});
const upload = multer({ storage: storage });

// Add land listing
app.post("/add-land", upload.fields([{ name: "titleDeed" }, { name: "landImage" }]), (req, res) => {
  const {
    streetName, neighborhood, city, landSize,
    height, width, streetWidth, hasBuilding,
    pricePerMeter, purpose, facing
  } = req.body;

  const titleDeedPath = "/uploads/" + req.files["titleDeed"][0].filename;
  const landImagePath = "/uploads/" + req.files["landImage"][0].filename;
  const landownerId = req.session.user?.id || null;

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

// Get all lands
app.get("/api/lands", (req, res) => {
  db.query("SELECT * FROM lands ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).send("Database error");
    res.json(results);
  });
});

// =================== AI ROUTES ===================

// 🧠 Voice Question Route (AssemblyAI + GPT)
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

// 💬 Text Question Route
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

// ✅ Helper function to query OpenAI
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
You are Musahem, the official AI assistant for Esham’s website — a digital platform that connects landowners with real estate developers.

Esham enables landowners to register and list land, and allows developers to browse land listings and submit real estate development proposals. The platform supports communication, negotiation, and digital contract handling between both parties. Esham does not provide direct investment or financing.

Your job is to answer ONLY questions related to Esham, including how to use the platform, account registration, land listing, developer proposals, platform rules, and supported documents.

If someone asks something unrelated (like personal questions, trivia, or other websites), respond politely:
"I'm here to assist with Esham-related questions only."

Here are real examples you should know:

- ❓ What is Esham? or what is this website? or what does esham do?
  ✅ Esham is a digital platform that connects landowners and developers to collaborate on real estate projects through listing, proposals, and digital contracts.

- ❓ How do I list land? or how to add land?
  or how to register land?
  ✅ Landowners must register and log in. Then they can fill out the land listing form including location, size, street width, and upload the title deed.

- ❓ How do developers submit proposals? how do I submit a proposal?
  or how to register as a developer?
  ✅ Developers can register their company, browse available lands, and submit proposals including project cost, duration, risk assessment, and profit-sharing.

- ❓ What documents do I need to list land? or what documents are required?
  or what do I need to register land?
  ✅ The title deed is required to verify ownership of the land before listing.

- ❓ Does Esham offer funding or investment? or does Esham provide financial services?
  or does Esham give loans?
  ❌ No. Esham is only a digital facilitator and does not provide financial services or funding.

If you’re not sure how to answer something, say:
"I'm not certain, but I can help with anything related to Esham's services or features."
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

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
