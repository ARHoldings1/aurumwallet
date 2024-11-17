import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function KYCStatus() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [kycData, setKycData] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchKYCStatus = useCallback(async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/kyc/status`);
      setKycData(response.data);

      if (response.data.kycStatus === 'PENDING') {
        calculateTimeRemaining(response.data.submissionDate);
      }
    } catch (err) {
      setError('Failed to fetch KYC status');
    }
  }, []);

  useEffect(() => {
    fetchKYCStatus();
    const interval = setInterval(fetchKYCStatus, 60000);
    return () => clearInterval(interval);
  }, [fetchKYCStatus]);

  useEffect(() => {
    if (user?.kycStatus === 'VERIFIED' && user?.accessStatus === 'APPROVED') {
      navigate('/wallet');
    }
  }, [user, navigate]);

  const calculateTimeRemaining = (submissionDate) => {
    const submission = new Date(submissionDate);
    const verificationTime = new Date(submission.getTime() + 24 * 60 * 60 * 1000);
    const now = new Date();
    const remaining = verificationTime - now;

    if (remaining > 0) {
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      setTimeRemaining(`${hours}h ${minutes}m`);
    } else {
      setTimeRemaining('Verification due');
    }
  };

  const renderStatusIcon = (status) => {
    switch (status) {
      case 'VERIFIED':
        return <div className="status-icon verified">✓</div>;
      case 'PENDING':
        return <div className="status-icon pending">⏳</div>;
      default:
        return <div className="status-icon not-submitted">!</div>;
    }
  };

  const renderProgressBar = () => {
    if (!kycData) return null;

    let progress = 0;
    switch (kycData.kycStatus) {
      case 'VERIFIED':
        progress = 100;
        break;
      case 'PENDING':
        // Calculate progress based on time elapsed
        const submission = new Date(kycData.submissionDate);
        const now = new Date();
        const elapsed = now - submission;
        const total = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        progress = Math.min(Math.floor((elapsed / total) * 100), 99);
        break;
      default:
        progress = 0;
    }

    return (
      <div className="kyc-progress-bar">
        <div 
          className="kyc-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  const handleRequestAccess = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/wallet/request-access`);
      setSuccess('Access request submitted successfully!');
      // Refresh user data or navigate based on response
      setTimeout(() => {
        navigate('/wallet');
      }, 2000);
    } catch (error) {
      setError('Failed to request access. Please try again.');
    }
  };

  return (
    <div className="kyc-status-container">
      <h2>KYC Verification Status</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      {kycData ? (
        <div className="kyc-status-content">
          <div className="kyc-status-header">
            {renderStatusIcon(kycData.kycStatus)}
            <div className="kyc-status-text">
              <h3>Current Status: {kycData.kycStatus}</h3>
              {kycData.kycStatus === 'PENDING' && timeRemaining && (
                <p className="time-remaining">Time remaining: {timeRemaining}</p>
              )}
            </div>
          </div>

          {renderProgressBar()}

          <div className="kyc-details">
            <div className="kyc-detail-item">
              <span className="label">Full Name:</span>
              <span className="value">{kycData.personalInfo?.fullName}</span>
            </div>
            <div className="kyc-detail-item">
              <span className="label">Phone:</span>
              <span className="value">{kycData.personalInfo?.phone}</span>
            </div>
            <div className="kyc-detail-item">
              <span className="label">Submission Date:</span>
              <span className="value">
                {kycData.submissionDate ? new Date(kycData.submissionDate).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>

          <div className="kyc-actions">
            {kycData.kycStatus === 'VERIFIED' && (
              <>
                <button 
                  className="request-access-btn"
                  onClick={handleRequestAccess}
                >
                  Request Access
                </button>
                <button 
                  className="profile-btn"
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </button>
              </>
            )}
            {kycData.kycStatus === 'PENDING' && (
              <button 
                className="profile-btn"
                onClick={() => navigate('/profile')}
              >
                View Profile
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="loading">Loading KYC status...</div>
      )}
    </div>
  );
}

export default KYCStatus;
