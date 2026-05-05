import { useState } from 'react';
import Tesseract from 'tesseract.js';
import './index.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    department: '',
    passedOutYear: '',
    currentlyPursuing: '',
    professionalStatus: '',
    transactionId: ''
  });

  const [screenshot, setScreenshot] = useState(null);
  const [preview, setPreview] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setScreenshot(file);
    setPreview(URL.createObjectURL(file));
    setIsScanning(true);
    setMessage('');
    setError('');
    // Clear previously auto-filled transaction ID just in case
    setFormData(prev => ({ ...prev, transactionId: '' }));

    try {
      const result = await Tesseract.recognize(file, 'eng');
      const text = result.data.text;

      // Look for a typical 12-digit transaction ID
      const match = text.match(/\b\d{12}\b/);

      if (match) {
        setFormData(prev => ({ ...prev, transactionId: match[0] }));
        setMessage('Transaction ID auto-filled from screenshot!');
      } else {
        setError('Could not automatically find a 12-digit transaction ID. Please check the screenshot or enter it manually.');
      }
    } catch (err) {
      console.error('OCR Error:', err);
      setError('Failed to scan image. Please enter transaction ID manually.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshot) {
      setError('Please upload a payment screenshot.');
      return;
    }

    setLoading(true);
    setMessage('');
    setError('');

    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        submitData.append(key, formData[key]);
      });
      submitData.append('screenshot', screenshot);

      const backendUrl = "https://internship-registration.onrender.com";

      const response = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        body: submitData,
      });

      const text = await response.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("Response is not JSON:", text);
        throw new Error("Server error: not returning JSON");
      }

      if (response.ok) {
        setIsSubmitted(true);
        setMessage('Registration successful!');
      } else {
        setError(data.message || data.error || 'Registration failed');
      }

    } catch (err) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="container">
        <div className="form-wrapper success-view">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p>Thank you for registering. We have received your details and payment screenshot.</p>
          <p className="success-subtext">We will review your submission and contact you soon.</p>
          <button onClick={() => setIsSubmitted(false)} className="submit-btn new-registration-btn">
            Register Another Candidate
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      <div className="form-wrapper">
        <div className="header">
          <h1>UPGRADIAN INTERNSHIP REGISTRATION</h1>
          <p>Join our team and kickstart your career!</p>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="university">University</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
              <input
                type="text"
                id="university"
                name="university"
                value={formData.university}
                onChange={handleChange}
                placeholder="State University"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="department">Department</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <input
                  type="text"
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  placeholder="Computer Science"
                  required
                />
              </div>
            </div>

            <div className="form-group half">
              <label htmlFor="passedOutYear">Passed out year</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <input
                  type="number"
                  id="passedOutYear"
                  name="passedOutYear"
                  value={formData.passedOutYear}
                  onChange={handleChange}
                  placeholder="2024"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="currentlyPursuing">Pursuing</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path></svg>
              <select
                id="currentlyPursuing"
                name="currentlyPursuing"
                value={formData.currentlyPursuing}
                onChange={handleChange}
                required
              >
                <option value="">Select Option</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
                <option value="Graduated">Graduated</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="professionalStatus">Professional Status</label>
            <div className="input-wrapper">
              <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <select
                id="professionalStatus"
                name="professionalStatus"
                value={formData.professionalStatus}
                onChange={handleChange}
                required
              >
                <option value="">Select Status</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Employed">Employed</option>
                <option value="Student">Student</option>
              </select>
            </div>
          </div>

          <div className="payment-section">
            <h3>Complete Payment</h3>
            <p><strong>Registration fee : $500</strong></p>
            <p>Scan QR:</p>
            <div className="qr-container">
              <img src="/qr.png" alt="Payment QR Code" className="qr-code" />
            </div>

            <div className="form-group upload-section">
              <label htmlFor="screenshot">Upload Payment Screenshot</label>
              <input
                type="file"
                id="screenshot"
                name="screenshot"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="file-input"
              />
              {isScanning && <p className="scanning-text">Scanning image for Transaction ID...</p>}
              {preview && (
                <div className="preview-container">
                  <img src={preview} alt="Payment Preview" className="image-preview" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="transactionId">Registration ID:</label>
              <div className="input-wrapper">
                <svg className="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                <input
                  type="text"
                  id="transactionId"
                  name="transactionId"
                  value={formData.transactionId}
                  onChange={handleChange}
                  placeholder="1234567890"
                  required
                />
              </div>
              <small className="help-text">This will auto-fill from your screenshot if recognized.</small>
            </div>
          </div>

          <button type="submit" disabled={loading || isScanning} className="submit-btn">
            {loading ? 'Submitting...' : 'Submit & Confirm'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
