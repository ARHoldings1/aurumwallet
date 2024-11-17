import React from 'react';

const GasPaymentModal = ({ isOpen, onClose, gasPaymentDetails }) => {
  if (!isOpen) return null;

  return (
    <div className="gas-payment-modal-overlay">
      <div className="gas-payment-modal">
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h3>Gas Fee Payment Required</h3>
        
        <div className="gas-payment-content">
          <div className="qr-section">
            <div className="qr-container">
              <img 
                src={gasPaymentDetails?.qrCode} 
                alt="Gas Payment QR Code"
                className="qr-code"
              />
            </div>
            <div className="address-info">
              <p className="label">Gas Fee Payment Address:</p>
              <p className="address">{gasPaymentDetails?.address}</p>
              <button 
                className="copy-btn"
                onClick={() => navigator.clipboard.writeText(gasPaymentDetails?.address)}
              >
                Copy Address
              </button>
            </div>
          </div>

          <div className="fee-details">
            <div className="detail-row">
              <span>Network:</span>
              <span>{gasPaymentDetails?.details?.network}</span>
            </div>
            <div className="detail-row">
              <span>Gas Fee:</span>
              <span>{gasPaymentDetails?.btcAmount} BTC</span>
            </div>
            <div className="detail-row">
              <span>Network Congestion:</span>
              <span>{gasPaymentDetails?.details?.networkCongestion}</span>
            </div>
            <div className="detail-row">
              <span>Estimated Time:</span>
              <span>{gasPaymentDetails?.details?.estimatedTime}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GasPaymentModal; 