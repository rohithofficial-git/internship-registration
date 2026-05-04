import { useState } from 'react';
import Tesseract from 'tesseract.js';
import './index.css';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    graduation: '',
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

      const backendUrl = "https://internship-registration.onrender.com/api/register"

      const response = await fetch(`${backendUrl}/api/register`, {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

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
          <h1>Internship Registration</h1>
          <p>Join our team and kickstart your career!</p>
        </div>

        {message && <div className="alert success">{message}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
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

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
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

          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
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

          <div className="form-group">
            <label htmlFor="university">University</label>
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

          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="major">Major</label>
              <input
                type="text"
                id="major"
                name="major"
                value={formData.major}
                onChange={handleChange}
                placeholder="Computer Science"
                required
              />
            </div>

            <div className="form-group half">
              <label htmlFor="graduation">Expected Graduation</label>
              <input
                type="month"
                id="graduation"
                name="graduation"
                value={formData.graduation}
                onChange={handleChange}
                required
              />
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
              <input
                type="text"
                id="transactionId"
                name="transactionId"
                value={formData.transactionId}
                onChange={handleChange}
                placeholder="1234567890"
                required
              />
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
