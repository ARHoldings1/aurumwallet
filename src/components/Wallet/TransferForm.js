import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { QRCodeSVG as QRCode } from 'qrcode.react';

function TransferForm({ wallets, onTransferComplete }) {
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    amount: ''
  });
  const [gasFee, setGasFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showQR, setShowQR] = useState(false);

  const calculateGasFee = async (amount) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wallet/gas-fee`, {
        params: { amount }
      });
      setGasFee(response.data);
    } catch (error) {
      setError('Failed to calculate gas fee');
    }
  };

  useEffect(() => {
    if (formData.amount) {
      calculateGasFee(formData.amount);
    }
  }, [formData.amount]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check if destination is ETH address
      if (formData.toAddress.startsWith('0x')) {
        setError('BTC Bridge not available for ETH addresses');
        setLoading(false);
        return;
      }

      // Show QR code for gas fee payment
      setShowQR(true);
      
      // Simulate waiting for gas fee payment
      setTimeout(async () => {
        try {
          await axios.post(`${process.env.REACT_APP_API_URL}/api/wallet/transfer`, formData);
          setSuccess('Transfer completed successfully');
          onTransferComplete();
          setShowQR(false);
        } catch (error) {
          setError(error.response?.data?.message || 'Transfer failed');
        }
        setLoading(false);
      }, 5000);
    } catch (error) {
      setError(error.response?.data?.message || 'Transfer failed');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="transfer-form-container">
      <h3>Transfer BTC</h3>
      <form onSubmit={handleSubmit} className="transfer-form">
        <div className="form-group">
          <label>From Address</label>
          <select
            name="fromAddress"
            value={formData.fromAddress}
            onChange={handleChange}
            required
          >
            <option value="">Select wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.address} value={wallet.address}>
                {wallet.address} ({wallet.balance} BTC)
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>To Address</label>
          <input
            type="text"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            required
            placeholder="Enter destination address"
          />
        </div>

        <div className="form-group">
          <label>Amount (BTC)</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.0001"
            min="0"
          />
        </div>

        {gasFee && (
          <div className="gas-fee-info">
            <h4>Gas Fee</h4>
            <p>BTC: {gasFee.btcAmount}</p>
            <p>ETH: {gasFee.equivalents.ETH}</p>
            <p>BNB: {gasFee.equivalents.BNB}</p>
            <p>USDT: {gasFee.equivalents.USDT}</p>
          </div>
        )}

        {showQR && (
          <div className="qr-container">
            <h4>Scan to Pay Gas Fee</h4>
            <QRCode 
              value={`ethereum:${gasFee?.equivalents?.ETH}`}
              size={200}
              level="H"
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading || showQR}
        >
          {loading ? 'Processing...' : 'Transfer'}
        </button>
      </form>
    </div>
  );
}

export default TransferForm;
