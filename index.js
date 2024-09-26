const express = require("express");
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const XLSX = require('xlsx');
const path = require("path");
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

// Existing static file serving
app.use(express.static(path.join(__dirname, "public/")));
app.use(express.static(path.join(__dirname, "pages/")));

// Gemini API setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send('No file uploaded.');
    }
    // Read the Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    // Convert data to a string for Gemini
    const dataString = JSON.stringify(data, null, 2);
    // Generate insights using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this reinsurance data and provide insights on risk assessment, market trends, policy recommendations, and efficiency insights:\n\n${dataString}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log(response);
    res.json({ insights: text });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('An error occurred while processing the file.');
  }
});

// Existing route handler
app.get("/", (req, res) => {
  exec('npx tailwindcss -i ./input.css -o ./public/out.css ', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
  });
  res.sendFile(path.join(__dirname, "pages/index.html"));
});

app.listen(3000, () => {
  console.log("🚀 Shipping on port 3000");
});