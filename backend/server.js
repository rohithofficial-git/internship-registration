const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve the uploads folder statically so images can be viewed
app.use('/uploads', express.static(uploadDir));

// Set up multer for local disk storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Sanitize name to avoid issues
    const safeName = (req.body.name || 'user').replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `Payment_${safeName}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage });

const getServiceAccountAuth = () => {
  return new JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
    ],
  });
};

app.post('/api/register', upload.single('screenshot'), async (req, res) => {
  try {
    const { name, email, phone, university, major, graduation, transactionId } = req.body;
    const file = req.file;

    // Basic validation
    if (!name || !email || !phone || !university || !major || !graduation || !transactionId) {
      return res.status(400).json({ error: 'All fields, including Transaction ID, are required.' });
    }

    if (!file) {
      return res.status(400).json({ error: 'Payment screenshot is required.' });
    }

    // Generate local URL for the screenshot
    const screenshotUrl = `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;

    const auth = getServiceAccountAuth();

    // Append a new row to Google Sheet
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, auth);
    await doc.loadInfo(); 
    const sheet = doc.sheetsByIndex[0];

    await sheet.addRow({
      Name: name,
      Email: email,
      Phone: phone,
      University: university,
      Major: major,
      'Expected Graduation': graduation,
      'Transaction ID': transactionId,
      'Screenshot Link': screenshotUrl,
      'Registration Date': new Date().toLocaleString(),
    });

    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to process registration.', details: error.message, stack: error.stack });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
