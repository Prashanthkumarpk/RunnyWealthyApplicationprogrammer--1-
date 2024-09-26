const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'pages')));

console.log('API Key:', process.env.GOOGLE_AI_KEY ? 'Set' : 'Not set');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_KEY);

app.get('/test-api-key', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = "Hello, world!";
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ status: 'success', response: text });
  } catch (error) {
    console.error('API Test Error:', error);
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const dataString = JSON.stringify(data, null, 2);

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Analyze this reinsurance data and provide insights on risk assessment, market trends, policy recommendations, and efficiency insights:\n\n${dataString}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const insights = response.text();

    res.json({ insights: insights });
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({ 
      error: 'An error occurred while processing the file.',
      details: error.message,
      stack: error.stack
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));