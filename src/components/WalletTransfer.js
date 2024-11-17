import React, { useState } from 'react';
import GasPaymentModal from './GasPaymentModal';
import axios from 'axios';

const WalletTransfer = () => {
  const [showGasPaymentModal, setShowGasPaymentModal] = useState(false);
  const [gasPaymentDetails, setGasPaymentDetails] = useState(null);

  const handleTransfer = async (toAddress, amount) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/wallet/calculate-gas-fee`, {
        params: { toAddress, amount }
      });

      if (response.data.gasPayment) {
        setGasPaymentDetails(response.data);
        setShowGasPaymentModal(true);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      // Handle error appropriately
    }
  };

  return (
    <div>
      {/* Your existing transfer form */}
      
      <GasPaymentModal 
        isOpen={showGasPaymentModal}
        onClose={() => setShowGasPaymentModal(false)}
        gasPaymentDetails={gasPaymentDetails}
      />
    </div>
  );
};

export default WalletTransfer; 