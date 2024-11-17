import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`);
        setProfileData(response.data);
      } catch (err) {
        setError('Failed to fetch profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) return <div className="loading">Loading profile...</div>;

  return (
    <div className="profile-container">
      <h2>User Profile</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <label>Username</label>
              <p>{profileData?.username}</p>
            </div>
            <div className="info-item">
              <label>Full Name</label>
              <p>{profileData?.personalInfo?.fullName || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{profileData?.personalInfo?.email || 'Not provided'}</p>
            </div>
            <div className="info-item">
              <label>Phone</label>
              <p>{profileData?.personalInfo?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Wallet Information</h3>
          <div className="wallet-info">
            <div className="info-item">
              <label>Wallet Address</label>
              <p className="wallet-address">{profileData?.walletAddress || 'Will be generated after KYC'}</p>
            </div>
            <div className="info-item">
              <label>KYC Status</label>
              <p className={`kyc-status ${profileData?.kycStatus.toLowerCase()}`}>
                {profileData?.kycStatus}
              </p>
            </div>
            <div className="withdrawal-status">
              {profileData?.kycStatus !== 'VERIFIED' ? (
                <div className="warning-message">
                  Withdrawals will be enabled after KYC verification is complete
                </div>
              ) : (
                <div className="success-message">
                  Your account is verified and ready for withdrawals
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button 
            className="back-btn"
            onClick={() => navigate('/kyc/status')}
          >
            Back to KYC Status
          </button>
          {profileData?.kycStatus === 'VERIFIED' && (
            <button 
              className="wallet-btn"
              onClick={() => navigate('/wallet')}
            >
              Go to Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile; 