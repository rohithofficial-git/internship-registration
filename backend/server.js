const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Load Google Sheet
const initGoogleSheet = async () => {
  try {
    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo(); 
    return doc;
  } catch (error) {
    console.error('Error initializing Google Sheets API:', error);
    throw error;
  }
};

app.post('/api/register', async (req, res) => {
  try {
    const { name, email, phone, university, major, graduation, transactionId } = req.body;

    // Basic validation
    if (!name || !email || !phone || !university || !major || !graduation || !transactionId) {
      return res.status(400).json({ error: 'All fields, including Transaction ID, are required.' });
    }

    const doc = await initGoogleSheet();
    const sheet = doc.sheetsByIndex[0]; // Append to the first sheet

    // Append a new row
    await sheet.addRow({
      Name: name,
      Email: email,
      Phone: phone,
      University: university,
      Major: major,
      'Expected Graduation': graduation,
      'Transaction ID': transactionId,
      'Registration Date': new Date().toLocaleString(),
    });

    res.status(200).json({ message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to process registration.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
