import React from 'react';
import { useNavigate } from 'react-router-dom';

const MainApp = () => {
  const navigate = useNavigate();

  return (
    <div className="wallet-container">
      <h1>Welcome to RK BTC Master Node Wallet</h1>
      
      <div className="status-grid">
        <div className="status-card">
          <h2>Network Status</h2>
          <div className="status live">Live</div>
        </div>
        <div className="status-card">
          <h2>Current Users</h2>
          <div className="balance">10/10</div>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="login-btn" 
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
    </div>
  );
};

export default MainApp; 