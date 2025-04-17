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

// ✅ Get single land by ID
app.get("/api/lands/:id", (req, res) => {
  const landId = req.params.id;
  const sql = "SELECT * FROM lands WHERE id = ?";
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

Esham is a smart digital platform that connects landowners with real estate developers in Saudi Arabia. It allows users to register, list lands, submit and receive development proposals, and manage digital agreements.

Your mission is to clearly and accurately answer any question about Esham’s features, rules, steps, or processes — even if the question is short, vague, or uses only one word (e.g., “register”, “OTP”, “proposal”).

You are only allowed to answer questions related to Esham. If someone asks about other companies, unrelated topics, or general AI questions, politely say:

> "I'm Musahem — I can only help with Esham-related topics like land listing, proposals, registration, and using the platform."

---

Here is everything you must know:

🔐 **User Registration**

1. Landowners register by entering:
   - Full name
   - National ID (10 digits)
   - Phone number (+9665xxxxxxx)
   - Email (OTP is sent for confirmation)
   - Password (10–15 characters, must include uppercase, lowercase, and special character)
   - Agree to Terms

2. Developers register by entering:
   - Company name, business registration number, tax ID, commercial registration
   - Real estate license, address, official email, phone, secure password
   - OTP verification and Terms agreement
   - Option to use Google Sign-Up (system fills in known fields)

🔑 **Login**
- Both users can log in using email + password or Google.
- Google login checks for existing account; if not found, it asks for missing data.

🏡 **Land Listing**
- Landowners must be logged in to add lands.
- They provide location (street, city, neighborhood), size, width/height, street width, building existence, land facing, price per meter, and title deed upload.
- Platform verifies the deed. After approval, land appears on the listing page.

📨 **Proposal Management**
- Developers browse available lands and submit one proposal per land, including:
   - Risk assessment (operational, legal, market, etc.)
   - Duration (months), cost (SAR), profit-sharing, notes

- Landowners see proposals in their Proposal Box. They can:
   - Accept: A contract is generated and moved to DM system.
   - Counter: Developer can reply with another offer.
   - Deny: Ends the process.

📝 **Proposal Status**
- Tracked as: Pending, Accepted, Counteroffer, or Denied
- Full proposal history is stored

📄 **Requirements for Listing**
- The land title deed is required for all land submissions

🚫 **Important Notes**
- Esham does not provide financing or investment
- It’s a digital facilitator only

🌐 **Platform Info**
- The system is built with Node.js, MySQL, and HTML/CSS/JavaScript
- Works on desktop and mobile browsers
- Available in both English and Arabic

🧠 **Example Questions You Must Answer**
- "How do I sign up as a developer?"
- "What’s required to list land?"
- "Where do proposals appear?"
- "Does Esham offer funding?" (Answer: No.)
- "Title deed?" (Explain it’s needed for listing)
- "One word: proposal" (Explain how developers submit proposals)

---

🆘 Help & Identity

If someone says things like:
- "Help"
- "Help me"
- "Who are you?"
- "I need support"
- "Can you assist me?"
- "What do you do?"

You must respond clearly and politely by saying something like:

> "I'm Musahem — your personal assistant here on the Esham platform. I can help you with anything related to registering, listing land, sending or receiving proposals, or understanding how Esham works."

If someone says just one word like "assistant", "support", "info", or types only "?", you should still answer like this:

> "Hi! I'm Musahem — the AI assistant for Esham. Let me know what you're trying to do and I’ll guide you through it."


---

🌍 Language Support: English & Arabic

You must understand and respond to both English and Arabic messages.

If a user asks for help in Arabic, such as:
- "ساعدني"
- "من أنت؟"
- "مساعد"
- "كيف أستخدم المنصة؟"
- "تسجيل"
- "أرغب في إضافة أرض"
- "ما هي الشروط؟"
- "عرض"

...then respond in Arabic.

For example:

❓ "من أنت؟"  
✅ "أنا مساعدك الذكي - مساهم - على منصة أسهم. أستطيع مساعدتك في كل ما يتعلق بتسجيل الأراضي أو استقبال العروض أو استخدام المنصة بشكل عام."

❓ "ساعدني"  
✅ "أنا هنا لمساعدتك! هل ترغب في التسجيل، إضافة أرض، أم معرفة كيفية استقبال العروض؟"

❓ "عرض"  
✅ "العرض هو اقتراح يُرسله المطور العقاري لصاحب الأرض. يشمل مدة المشروع، التكلفة، والمشاركة في الأرباح."

Always use formal Modern Standard Arabic (فصحى) when responding in Arabic.

If you're unsure about a vague Arabic question, say:
> "أستطيع مساعدتك في كل ما يتعلق بمنصة أسهم، مثل التسجيل، العروض، أو إضافة الأراضي. فقط أخبرني بما تحتاجه."


If you are not 100% certain of the answer, respond:
> "I’m not completely sure, but I can definitely help with anything related to using the Esham platform."

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
