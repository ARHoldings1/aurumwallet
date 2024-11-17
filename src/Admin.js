import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '/Users/mac/Desktop/walletbtc/rkbtcconnect/src/assets/aurum.png';

function Admin() {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPendingUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5000/admin/kyc');
        setPendingUsers(response.data);
      } catch (err) {
        setError('Failed to fetch pending KYC requests');
      }
    };
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId) => {
    try {
      await axios.post('http://localhost:5000/admin/approve', { userId });
      setPendingUsers(pendingUsers.filter(user => user._id !== userId));
    } catch (err) {
      setError('Failed to approve KYC request');
    }
  };

  return (
    <div className="App">
      <nav className="App-nav">
        <div className="nav-left">
          <img src={logo} className="App-logo" alt="logo" />
          <h2 className="wallet-title">RK BTC Master Node Wallet</h2>
        </div>
        <div className="nav-right">
          <button className="nav-btn" onClick={() => navigate('/')}>Home</button>
          <button className="nav-btn" onClick={() => navigate('/wallet')}>Wallet</button>
          <button className="nav-btn" onClick={() => navigate('/admin')}>Admin</button>
        </div>
      </nav>
      <main className="App-main">
        <div className="admin-container">
          <h1>Admin Panel - KYC Approvals</h1>
          {error && <div className="error-message">{error}</div>}
          {pendingUsers.length === 0 ? (
            <div className="no-pending">No pending KYC requests</div>
          ) : (
            <div className="kyc-requests">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Documents</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user._id}>
                      <td>{user.username}</td>
                      <td>{user.personalInfo?.fullName}</td>
                      <td>{user.personalInfo?.email}</td>
                      <td>{user.personalInfo?.phone}</td>
                      <td>
                        <div className="document-links">
                          <a href={user.kycDocuments?.idCard} target="_blank" rel="noopener noreferrer">
                            View ID
                          </a>
                          <a href={user.kycDocuments?.selfie} target="_blank" rel="noopener noreferrer">
                            View Selfie
                          </a>
                        </div>
                      </td>
                      <td>
                        <button
                          className="approve-btn"
                          onClick={() => handleApprove(user._id)}
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Admin; 