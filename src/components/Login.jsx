import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    // For now, just navigate to wallet
    navigate('/wallet');
  };

  return (
    <div className="registration-container">
      <h2>Login to Your Wallet</h2>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <label className="form-label">Username</label>
          <input
            type="text"
            name="username"
            className="form-input"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Password</label>
          <input
            type="password"
            name="password"
            className="form-input"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
          />
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" className="submit-btn">Login</button>

        <div className="auth-switch">
          Don't have an account?{' '}
          <Link to="/register" className="switch-btn">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login; 