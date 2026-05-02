import { useState } from 'react';
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
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Assuming backend runs on localhost:5000 during dev
      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Registration successful! We will contact you soon.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          university: '',
          major: '',
          graduation: '',
          transactionId: ''
        });
      } else {
        setError(data.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please make sure the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

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
            <h3>Registration Fee Payment</h3>
            <p>Please scan the QR code below to pay the registration fee.</p>
            <div className="qr-container">
              <img src="/qr.png" alt="Payment QR Code" className="qr-code" />
            </div>
            <div className="form-group">
              <label htmlFor="transactionId">Transaction ID / UTR Number</label>
              <input 
                type="text" 
                id="transactionId" 
                name="transactionId" 
                value={formData.transactionId} 
                onChange={handleChange} 
                placeholder="e.g. 1234567890"
                required 
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Submitting...' : 'Register Now'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default App;
