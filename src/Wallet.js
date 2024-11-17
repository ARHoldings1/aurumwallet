import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from '/Users/mac/Desktop/walletbtc/rkbtcconnect/src/assets/aurum.png';
import axios from 'axios';
import TransferForm from './components/Wallet/TransferForm';

function Wallet() {
  const navigate = useNavigate();
  const [showUSD, setShowUSD] = useState(false);
  const [btcPrice, setBtcPrice] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [showTransfer, setShowTransfer] = useState(false);
  const btcAmount = 114973.0000;
  
  // Fetch BTC price from CoinGecko API
  const fetchBTCPrice = async () => {
    try {
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      );
      setBtcPrice(response.data.bitcoin.usd);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching BTC price:', error);
    }
  };

  // Fetch price on component mount and set up interval
  useEffect(() => {
    fetchBTCPrice(); // Initial fetch
    
    // Update price every 30 seconds
    const interval = setInterval(fetchBTCPrice, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  // Calculate USD value
  const usdAmount = (btcAmount * btcPrice).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const generateBitcoinAddress = () => {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = '1A';
    for (let i = 0; i < 32; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  };

  const generateWallets = () => {
    const wallets = [];
    let remainingBalance = btcAmount;
    
    for (let i = 0; i < 100; i++) {
      const maxPossible = remainingBalance - (1000 * (99 - i));
      const minBalance = 1000;
      const balance = i === 99 
        ? remainingBalance 
        : minBalance + Math.floor(Math.random() * (maxPossible - minBalance));
      
      remainingBalance -= balance;

      wallets.push({
        address: generateBitcoinAddress(),
        balance: balance.toFixed(4),
        usdValue: (balance * btcPrice).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      });
    }

    return wallets;
  };

  const handleTransferComplete = () => {
    // Refresh wallet data
    fetchBTCPrice();
    setShowTransfer(false);
  };

  const wallets = generateWallets();

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
          <div className="balance-container">
            <div className="balance-info">
              <h2>Total Balance</h2>
              <div className="balance-amount">
                {showUSD ? (
                  <>
                    <p className="total-balance">$ {usdAmount}</p>
                    <span className="balance-subtitle">USD Value</span>
                  </>
                ) : (
                  <>
                    <p className="total-balance">{btcAmount.toFixed(4)} BTC</p>
                    <span className="balance-subtitle">Bitcoin</span>
                  </>
                )}
              </div>
              {lastUpdate && (
                <div className="last-update">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
              <div className="current-price">
                Current BTC Price: ${btcPrice.toLocaleString()}
              </div>
            </div>
            <div className="balance-actions">
              <button 
                className="currency-toggle-btn"
                onClick={() => setShowUSD(!showUSD)}
              >
                View in {showUSD ? 'BTC' : 'USD'}
              </button>
              <button 
                className="transfer-btn"
                onClick={() => setShowTransfer(!showTransfer)}
              >
                {showTransfer ? 'Hide Transfer' : 'Transfer BTC'}
              </button>
            </div>
          </div>

          {showTransfer && (
            <TransferForm 
              wallets={wallets}
              onTransferComplete={handleTransferComplete}
            />
          )}

          <div className="wallet-table-container">
            <table className="wallet-table">
              <thead>
                <tr>
                  <th width="5%">No.</th>
                  <th width="45%">Wallet Address</th>
                  <th width="25%">Balance (BTC)</th>
                  <th width="25%">USD Value</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet, index) => (
                  <tr key={index}>
                    <td className="center-align">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="wallet-address monospace">{wallet.address}</td>
                    <td className="wallet-balance right-align">{wallet.balance}</td>
                    <td className="wallet-usd right-align">${wallet.usdValue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Wallet;