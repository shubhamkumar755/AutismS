import React, { useState, useEffect, useRef } from 'react';
import './App.css';

const scores = ['A1_Score', 'A2_Score', 'A3_Score', 'A4_Score', 'A5_Score', 'A6_Score', 'A7_Score', 'A8_Score', 'A9_Score', 'A10_Score'];
const genders = ['m', 'f'];
const ethnicities = ['White-European', 'Latino', 'Others', 'Middle Eastern', 'South Asian', 'Asian', 'Black', 'Mixed', 'Hispanic', 'Turkish', 'others'];
const jaundice = ['yes', 'no'];
const relations = ['Parent', 'Self', 'Relative', 'Others', 'self', 'relative', 'others'];
const familyAutism = ['yes', 'no'];
const usedApp = ['yes', 'no'];

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain', 'Netherlands', 'Belgium',
  'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Iceland', 'Ireland', 'New Zealand', 'Japan',
  'South Korea', 'Singapore', 'India', 'China', 'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia', 'Peru',
  'Venezuela', 'Ecuador', 'Uruguay', 'Paraguay', 'Bolivia', 'Guyana', 'Suriname', 'French Guiana', 'South Africa', 'Egypt',
  'Nigeria', 'Kenya', 'Ghana', 'Ethiopia', 'Tanzania', 'Uganda', 'Zimbabwe', 'Zambia', 'Malawi', 'Mozambique',
  'Botswana', 'Namibia', 'Lesotho', 'Swaziland', 'Madagascar', 'Mauritius', 'Seychelles', 'Comoros', 'Mayotte', 'Reunion',
  'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Yemen', 'Jordan', 'Lebanon', 'Syria',
  'Iraq', 'Iran', 'Turkey', 'Israel', 'Palestine', 'Cyprus', 'Malta', 'Greece', 'Bulgaria', 'Romania',
  'Hungary', 'Czech Republic', 'Slovakia', 'Poland', 'Lithuania', 'Latvia', 'Estonia', 'Russia', 'Ukraine', 'Belarus',
  'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan', 'Mongolia',
  'Pakistan', 'Afghanistan', 'Bangladesh', 'Sri Lanka', 'Nepal', 'Bhutan', 'Myanmar', 'Thailand', 'Laos', 'Cambodia',
  'Vietnam', 'Malaysia', 'Indonesia', 'Philippines', 'Brunei', 'East Timor', 'Papua New Guinea', 'Fiji', 'Vanuatu', 'Solomon Islands',
  'New Caledonia', 'French Polynesia', 'Samoa', 'Tonga', 'Tuvalu', 'Kiribati', 'Marshall Islands', 'Micronesia', 'Palau', 'Nauru'
];

function CursorTrail() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null });
  const animationRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;

      for (let i = 0; i < 4; i++) {
        particlesRef.current.push(new Particle(mouseRef.current.x, mouseRef.current.y));
      }
    };

    class Particle {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 5 + 2;
        this.opacity = 1;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 1.5 + 0.5;
        this.life = 0;
        this.maxLife = 60;
      }

      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        this.life++;
        this.opacity = 1 - this.life / this.maxLife;
      }

      draw() {
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.opacity})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.shadowColor = "rgba(255, 255, 255, 0.8)";
        ctx.shadowBlur = 20;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }

      isDead() {
        return this.life >= this.maxLife;
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particlesRef.current.length; i++) {
        particlesRef.current[i].update();
        particlesRef.current[i].draw();

        if (particlesRef.current[i].isDead()) {
          particlesRef.current.splice(i, 1);
          i--;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', handleMouseMove);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}

function AutismForm({ goBack }) {
  const [form, setForm] = useState({
    age: '',
    gender: '',
    ethnicity: '',
    jaundice: '',
    country: '',
    relation: '',
    familyAutism: '',
    aqScore: '',
    usedApp: '',
    ...Object.fromEntries(scores.map((s) => [s, '']))
  });

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('Prediction state changed:', prediction);
  }, [prediction]);

  useEffect(() => {
    console.log('Error state changed:', error);
  }, [error]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);

    try {
      const formData = new FormData();
      
      // Add all form fields to FormData
      Object.keys(form).forEach(key => {
        formData.append(key, form[key]);
      });

      console.log('Form state:', form); // Log the actual form state
      console.log('Sending form data:', Object.fromEntries(formData)); // Debug log
      
      // Check for empty or missing values
      const missingFields = [];
      Object.keys(form).forEach(key => {
        if (!form[key] || form[key] === '') {
          missingFields.push(key);
        }
      });
      
      if (missingFields.length > 0) {
        console.warn('Missing or empty fields:', missingFields);
      }

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type header - let browser set it for FormData
        }
      });

      console.log('Response status:', response.status); // Debug log

      if (!response.ok) {
        // Try to get error details from response
        try {
          const errorData = await response.json();
          console.log('Error response data:', errorData);
          throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
        } catch (parseError) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const result = await response.json();
      console.log('Backend response:', result); // Add logging

      if (result.success) {
        console.log('Setting prediction:', result.prediction); // Debug log
        setPrediction(result.prediction);
      } else {
        console.log('Setting error:', result.message || result.error); // Debug log
        setError(result.message || result.error || 'Prediction failed');
        console.error('Backend error:', result); // Add error logging
      }
    } catch (err) {
      console.error('Full error details:', err);
      console.error('Error name:', err.name);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      
      setError(`Error: ${err.message}`);
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="background scroll-page">
      <img src={require('./BOGV.gif')} alt="BOGV" className="bogv-gif" />
      <div className="form-container">
        <div className="form-wrapper">
          <button className="back-btn" onClick={goBack} style={{marginBottom: '1rem', alignSelf: 'flex-start'}}>←</button>
          <h1 className="title">AutismScope</h1>
          
          {prediction && (
            <div className="prediction-result">
              <h2>Prediction Result</h2>
              <div className={`result ${prediction === 'ASD Positive' ? 'positive' : 'negative'}`}>
                {prediction}
              </div>
              <button 
                className="new-prediction-btn" 
                onClick={() => {
                  setPrediction(null);
                  setForm({
                    age: '',
                    gender: '',
                    ethnicity: '',
                    jaundice: '',
                    country: '',
                    relation: '',
                    familyAutism: '',
                    aqScore: '',
                    usedApp: '',
                    ...Object.fromEntries(scores.map((s) => [s, '']))
                  });
                }}
              >
                Make New Prediction
              </button>
            </div>
          )}

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {!prediction && !error && (
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="scores-grid">
                {scores.map((score, idx) => (
                  <div key={score} className="form-group">
                    <label>{score.replace('_Score', '')}:</label>
                    <div className="radio-group">
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={score}
                          value="1"
                          checked={form[score] === "1"}
                          onChange={handleChange}
                          required
                        />
                        1
                      </label>
                      <label className="radio-label">
                        <input
                          type="radio"
                          name={score}
                          value="0"
                          checked={form[score] === "0"}
                          onChange={handleChange}
                          required
                        />
                        0
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <div className="form-group full-width">
                <label>Age:</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} required />
              </div>
              <div className="form-group full-width">
                <label>Gender:</label>
                <select name="gender" value={form.gender} onChange={handleChange} required>
                  <option value="">Select Gender</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Ethnicity:</label>
                <select name="ethnicity" value={form.ethnicity} onChange={handleChange} required>
                  <option value="">Select Ethnicity</option>
                  <option value="White-European">White European</option>
                  <option value="Latino">Latino</option>
                  <option value="Middle Eastern ">Middle Eastern</option>
                  <option value="South Asian">South Asian</option>
                  <option value="Asian">Asian</option>
                  <option value="Black">Black</option>
                  <option value="Hispanic">Hispanic</option>
                  <option value="Turkish">Turkish</option>
                  <option value="Others">Others</option>
                  <option value="Pasifika">Pasifika</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Jaundice:</label>
                <select name="jaundice" value={form.jaundice} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Country of Residence:</label>
                <select name="country" value={form.country} onChange={handleChange} required>
                  <option value="">Select Country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group full-width">
                <label>Relation:</label>
                <select name="relation" value={form.relation} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Self">Self</option>
                  <option value="Others">Others</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Whether an immediate family member has been diagnosed with autism?</label>
                <select name="familyAutism" value={form.familyAutism} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>Score for AQ1-10 screening test:</label>
                <input type="number" name="aqScore" value={form.aqScore} onChange={handleChange} required />
              </div>
              <div className="form-group full-width">
                <label>Used Screening App Before:</label>
                <select name="usedApp" value={form.usedApp} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
              <button className="predict-btn" type="submit" disabled={loading}>
                {loading ? 'Predicting...' : 'Predict'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Landing({ onStart }) {
  return (
    <div className="background">
      <CursorTrail />
      <img src={require('./BOGV.gif')} alt="BOGV" className="bogv-gif" />
      <div style={{width: '100%'}}>
        <h1 className="title" style={{marginBottom: '3rem', fontSize: '3rem'}}>AutismScope</h1>
        <div style={{display: 'flex', justifyContent: 'center'}}>
          <button className="landing-btn" onClick={onStart}>
            START PREDICTION <span className="arrow">&#8594;</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [started, setStarted] = useState(false);
  return started ? <AutismForm goBack={() => setStarted(false)} /> : <Landing onStart={() => setStarted(true)} />;
}

export default App;
