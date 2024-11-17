import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';
import logo from './assets/aurum.png';
import axios from 'axios';
import { useAuth } from './context/AuthContext';
import rkd1 from './assets/rkd1.jpg';
import rkd2 from './assets/rkd2.jpg';
import nationalId from './assets/IMG_20240224_195019.jpg';
import moneyLaundering from './assets/Screenshot_20240329_231712.jpg';

function MainApp() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [syncProgress, setSyncProgress] = useState(64.1);
  const [remainingTime, setRemainingTime] = useState(48.4);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationData, setLocationData] = useState({
    ip: '',
    latitude: null,
    longitude: null,
    address: '',
    loading: false,
    error: null
  });
  const [syncStartTime, setSyncStartTime] = useState(null);
  const [showAgencyModal, setShowAgencyModal] = useState(false);
  const [showIPModal, setShowIPModal] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState({
    browser: '',
    device: '',
    ip: ''
  });
  const [showUserBehaviorModal, setShowUserBehaviorModal] = useState(false);
  const [activeIdSide, setActiveIdSide] = useState('front');
  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalOutput, setTerminalOutput] = useState([]);
  const [hashRate, setHashRate] = useState(84);
  const [activeDocument, setActiveDocument] = useState('passport');

  useEffect(() => {
    // Fetch sync start time from backend
    const fetchSyncTime = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/sync/status`);
        setSyncStartTime(new Date(response.data.startTime));
      } catch (error) {
        console.error('Error fetching sync time:', error);
        // Set a default sync start time if the API call fails
        setSyncStartTime(new Date());
      }
    };
    
    fetchSyncTime();
  }, []);

  useEffect(() => {
    if (!syncStartTime) return;

    const totalHours = 122.5;
    const totalMilliseconds = totalHours * 60 * 60 * 1000;
    const endTime = new Date(syncStartTime.getTime() + totalMilliseconds);

    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsed = currentTime - syncStartTime.getTime();
      const remaining = endTime - currentTime;

      // Calculate remaining hours
      const remainingHours = Math.max(0, remaining / (60 * 60 * 1000));
      
      // Calculate progress percentage (0.3% to 100%)
      const progressRange = 100 - 0.3;
      const progressIncrement = (elapsed / totalMilliseconds) * progressRange;
      const currentProgress = Math.min(100, 0.3 + progressIncrement);

      setSyncProgress(parseFloat(currentProgress.toFixed(1)));
      setRemainingTime(parseFloat(remainingHours.toFixed(1)));

      if (remainingHours <= 0) {
        clearInterval(interval);
        setSyncProgress(100);
        setRemainingTime(0);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [syncStartTime]);

  const handleGetStarted = async () => {
    try {
      if (user) {
        switch (user.kycStatus) {
          case 'NOT_SUBMITTED':
            navigate('/kyc/upload');
            break;
          case 'PENDING':
            navigate('/kyc/status');
            break;
          case 'VERIFIED':
            navigate('/wallet');
            break;
          default:
            navigate('/register');
        }
      } else {
        navigate('/register');
      }
    } catch (error) {
      console.error('Navigation error:', error);
      // Add user feedback here
      alert('An error occurred. Please try again later.');
    }
  };

  const fetchLocationData = async () => {
    setLocationData(prev => ({ ...prev, loading: true, error: null }));
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const ip = ipResponse.data.ip;

      const locationResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
      const { latitude, longitude, city, region, country } = locationResponse.data;

      setLocationData({
        ip,
        latitude,
        longitude,
        address: `${city}, ${region}, ${country}`,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Location fetch error:', error);
      setLocationData(prev => ({
        ...prev,
        loading: false,
        error: 'Unable to fetch location data. Please try again later.'
      }));
    }
  };

  const handleLocationClick = () => {
    setShowLocationModal(true);
    if (!locationData.latitude) {
      fetchLocationData();
    }
  };

  const renderLocationMetric = () => (
    <div className="metric" onClick={handleLocationClick} style={{ cursor: 'pointer' }}>
      <span className="label">
        Location - <span className="live">Live</span>
      </span>
      <span className="value blink danger">23%</span>
    </div>
  );

  const LocationModal = () => {
    if (!showLocationModal) return null;

    const googleMapsApiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    const hasValidApiKey = googleMapsApiKey && googleMapsApiKey !== 'your_google_maps_api_key_here';

    return (
      <div className="location-modal-overlay">
        <div className="location-modal">
          <button 
            className="close-btn"
            onClick={() => setShowLocationModal(false)}
          >
            ×
          </button>
          
          <h3>Live Location Tracking</h3>
          
          {locationData.loading ? (
            <div className="loading-spinner">Loading location data...</div>
          ) : locationData.error ? (
            <div className="error-message">{locationData.error}</div>
          ) : (
            <div className="location-content">
              <div className="location-info">
                <p><strong>IP Address:</strong> {locationData.ip}</p>
                <p><strong>Location:</strong> {locationData.address}</p>
                <p><strong>Coordinates:</strong> {locationData.latitude}, {locationData.longitude}</p>
              </div>
              
              {hasValidApiKey && locationData.latitude && locationData.longitude && (
                <div className="map-container">
                  <iframe
                    title="User Location"
                    width="100%"
                    height="300"
                    frameBorder="0"
                    src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}
                      &q=${locationData.latitude},${locationData.longitude}
                      &zoom=15`}
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleAgencyClick = () => {
    setShowAgencyModal(true);
  };

  const AgencyModal = () => {
    if (!showAgencyModal) return null;

    const agencies = [
      {
        country: '🇹🇭 Thailand',
        percentage: '37%',
        threatLevel: 4,
        agencies: [{
          name: 'Anti-Money Laundering Office (AMLO)',
          url: 'www.amlo.go.th'
        }]
      },
      {
        country: '🇸🇬 Singapore',
        percentage: '12%',
        agencies: [
          {
            name: 'Singapore Police Force (SPF) – Commercial Affairs Department (CAD)',
            url: 'www.police.gov.sg'
          },
          {
            name: 'Cyber Security Agency of Singapore (CSA)',
            url: 'www.csa.gov.sg'
          }
        ]
      },
      {
        country: '🇮🇳 India',
        percentage: '3%',
        agencies: [
          {
            name: 'Enforcement Directorate (ED)',
            url: 'www.enforcementdirectorate.gov.in'
          },
          {
            name: 'Financial Intelligence Unit (FIU)',
            url: 'https://fiuindia.gov.in'
          }
        ]
      },
      {
        country: '🇦🇪 Dubai (United Arab Emirates)',
        percentage: '21.9%',
        agencies: [{
          name: 'Dubai Financial Services Authority (DFSA)',
          url: 'www.dfsa.ae'
        }]
      },
      {
        country: '🇺🇸 United States',
        percentage: '26.1%',
        threatLevel: 4,
        agencies: [{
          name: 'Financial Crimes Enforcement Network (FinCEN)',
          url: 'www.fincen.gov'
        }]
      }
    ];

    return (
      <div className="agency-modal-overlay">
        <div className="agency-modal">
          <button 
            className="close-btn"
            onClick={() => setShowAgencyModal(false)}
          >
            ×
          </button>
          
          <h3>Enforcement Agencies Watching</h3>
          <p className="synced-status">Synced child nodes active</p>
          
          <div className="agency-list">
            {agencies.map((item, index) => (
              <div key={index} className="agency-country">
                <h4>
                  {item.country}
                  <span className={`agency-percentage ${item.threatLevel === 4 ? 'threat-level-4 blink' : ''}`}>
                    {item.percentage}
                    {item.threatLevel === 4 && <span className="threat-badge">Level 4 Threat</span>}
                  </span>
                </h4>
                {item.agencies.map((agency, agencyIndex) => (
                  <div key={agencyIndex} className="agency-item">
                    <p>{agency.name}</p>
                    <a 
                      href={`https://${agency.url}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {agency.url}
                    </a>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    let device = 'Unknown';

    // Detect browser
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    else if (userAgent.includes('Opera')) browser = 'Opera';

    // Detect device
    if (userAgent.includes('iPhone')) device = 'iPhone';
    else if (userAgent.includes('iPad')) device = 'iPad';
    else if (userAgent.includes('Android')) device = 'Android';
    else if (userAgent.includes('Windows')) device = 'Windows';
    else if (userAgent.includes('Mac')) device = 'Mac';
    else if (userAgent.includes('Linux')) device = 'Linux';

    return { browser, device };
  };

  const handleIPClick = async () => {
    setShowIPModal(true);
    try {
      const ipResponse = await axios.get('https://api.ipify.org?format=json');
      const locationResponse = await axios.get(`https://ipapi.co/${ipResponse.data.ip}/json/`);
      
      const { browser, device } = getBrowserInfo();
      setDeviceInfo({
        browser,
        device,
        ip: ipResponse.data.ip,
        location: `${locationResponse.data.city}, ${locationResponse.data.country_name}`,
        isp: locationResponse.data.org,
        timezone: locationResponse.data.timezone
      });
    } catch (error) {
      console.error('Error fetching IP info:', error);
    }
  };

  const IPModal = () => {
    if (!showIPModal) return null;

    return (
      <div className="ip-modal-overlay">
        <div className="ip-modal">
          <button 
            className="close-btn"
            onClick={() => setShowIPModal(false)}
          >
            ×
          </button>
          
          <h3>Device Information</h3>
          <div className="ip-info" style={{ color: '#000000' }}>
            <div className="warning-banner blink">
              Connected
            </div>
            <div className="info-item">
              <label>IP Address:</label>
              <span>{deviceInfo.ip || 'Loading...'}</span>
            </div>
            <div className="info-item">
              <label>Device Type:</label>
              <span>{deviceInfo.device || 'Detecting...'}</span>
            </div>
            <div className="info-item">
              <label>Browser:</label>
              <span>{deviceInfo.browser || 'Verifying...'}</span>
            </div>
            <div className="info-item">
              <label>Location:</label>
              <span>{deviceInfo.location || 'Locating...'}</span>
            </div>
            <div className="info-item">
              <label>ISP:</label>
              <span>{deviceInfo.isp || 'Fetching...'}</span>
            </div>
            <div className="info-item">
              <label>Timezone:</label>
              <span>{deviceInfo.timezone || 'Detecting...'}</span>
            </div>
            <div className="info-item">
              <label>Connection:</label>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleUserBehaviorClick = () => {
    setShowUserBehaviorModal(true);
  };

  const UserBehaviorModal = () => {
    if (!showUserBehaviorModal) return null;

    return (
      <div className="user-behavior-modal-overlay">
        <div className="user-behavior-modal">
          <button 
            className="close-btn"
            onClick={() => setShowUserBehaviorModal(false)}
          >
            ×
          </button>
          
          <h3>User Identity Information</h3>
          
          <div className="id-info-container">
            <div className="personal-info">
              <div className="info-row">
                <label>Project Owner:</label>
                <span>R Karthik</span>
              </div>
              <div className="info-row">
                <label>ID Type:</label>
                <span>Passport</span>
              </div>
              <div className="info-row">
                <label>ID Number:</label>
                <span>W6367382</span>
              </div>
              <div className="info-row">
                <label>Nationality:</label>
                <span>Indian</span>
              </div>
              <div className="info-row">
                <label>Address on ID:</label>
                <span>House Number 001, Vaastu Hill View Phase 1, Rajarajeshwari Nagar, Bengaluru, Pin: 560098, Karnataka, India</span>
              </div>
              <div className="info-row">
                <label>Used Numbers:</label>
                <span style={{ whiteSpace: 'pre-line' }}>
                  +971 559559328
                  +91 9845300377
                  +91 8669588021
                  +66956011836
                  +91 9980500089
                </span>
              </div>
            </div>

            <div className="id-viewer">
              <h4>View Documents</h4>
              <div className="id-toggle-buttons">
                <button 
                  className={`toggle-btn ${activeDocument === 'passport' ? 'active' : ''}`}
                  onClick={() => setActiveDocument('passport')}
                >
                  Passport
                </button>
                <button 
                  className={`toggle-btn ${activeDocument === 'national' ? 'active' : ''}`}
                  onClick={() => setActiveDocument('national')}
                >
                  National ID
                </button>
                <button 
                  className={`toggle-btn ${activeDocument === 'evidence' ? 'active' : ''}`}
                  onClick={() => setActiveDocument('evidence')}
                >
                  Money Laundering Evidence
                </button>
              </div>
              <div className="id-image-container">
                {activeDocument === 'passport' && (
                  <div className="passport-images">
                    <img 
                      src={activeIdSide === 'front' ? rkd1 : rkd2} 
                      alt={`Passport ${activeIdSide} side`}
                      className="id-image"
                    />
                    <div className="id-toggle-buttons passport-toggle">
                      <button 
                        className={`toggle-btn ${activeIdSide === 'front' ? 'active' : ''}`}
                        onClick={() => setActiveIdSide('front')}
                      >
                        Front Side
                      </button>
                      <button 
                        className={`toggle-btn ${activeIdSide === 'back' ? 'active' : ''}`}
                        onClick={() => setActiveIdSide('back')}
                      >
                        Back Side
                      </button>
                    </div>
                  </div>
                )}
                {activeDocument === 'national' && (
                  <img 
                    src={nationalId} 
                    alt="National ID"
                    className="id-image"
                  />
                )}
                {activeDocument === 'evidence' && (
                  <img 
                    src={moneyLaundering} 
                    alt="Money Laundering Evidence"
                    className="id-image"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleTerminalClick = () => {
    setShowTerminal(!showTerminal);
    if (!showTerminal) {
      // Initialize terminal with some output
      setTerminalOutput([]);
      startTerminalSimulation();
    }
  };

  const startTerminalSimulation = () => {
    const addresses = [
      '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      '3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy',
      'bc1qwqdg6squsna38e46795at95yu9atm8azzmyvckulcc7kytlcckxswvvzej'
    ];

    let index = 0;
    const interval = setInterval(() => {
      const newOutput = [...terminalOutput];
      const timestamp = new Date().toLocaleTimeString();
      
      if (index < addresses.length) {
        newOutput.push(`[${timestamp}] Generating key pair for address: ${addresses[index]}`);
        newOutput.push(`[${timestamp}] Public key generated: ${addresses[index].substring(0, 8)}...`);
        newOutput.push(`[${timestamp}] Searching private key...`);
        newOutput.push(`[${timestamp}] Hash rate: ${hashRate}%`);
        if (index === 2) {
          newOutput.push(`[${timestamp}] ⚠️ WARNING: Low cloud space available. Increase size for faster hash rate`);
          newOutput.push(`[${timestamp}] ⚠️ CRITICAL: Increase gas block height`);
        }
        index++;
      }
      
      // Keep only the last 15 lines
      if (newOutput.length > 15) {
        newOutput.splice(0, newOutput.length - 15);
      }
      
      setTerminalOutput(newOutput);
    }, 2000);

    // Clear interval after some time
    setTimeout(() => clearInterval(interval), 20000);
  };

  const Terminal = () => {
    if (!showTerminal) return null;

    return (
      <div className="terminal-overlay">
        <div className="terminal-window">
          <div className="terminal-header">
            <span>Wallet Terminal</span>
            <button className="close-btn" onClick={() => setShowTerminal(false)}>×</button>
          </div>
          <div className="terminal-content">
            {terminalOutput.map((line, index) => (
              <div 
                key={index} 
                className="terminal-line"
                style={{
                  color: line.includes('CRITICAL: Increase gas block height') ? '#ff0000' : 'inherit'
                }}
              >
                {line}
              </div>
            ))}
            <div className="terminal-cursor">{'>'}</div>
          </div>
        </div>
      </div>
    );
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // Get the amount from the form
    const amount = parseFloat(e.target.amount.value);
    
    // Check if amount is less than 5000 BTC
    if (amount < 5000) {
      alert('Minimum transfer amount is 5000 BTC');
      return;
    }
    
    // Rest of your transfer logic
    try {
      // Your existing transfer code
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed. Please try again.');
    }
  };

  // In your transfer form JSX
  const TransferForm = () => (
    <form onSubmit={handleTransfer} className="transfer-form">
      <div className="form-group">
        <label htmlFor="recipient">Recipient's Bitcoin Address</label>
        <input
          type="text"
          id="recipient"
          name="recipient"
          required
          placeholder="Enter Bitcoin address"
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Amount (BTC)</label>
        <input
          type="number"
          id="amount"
          name="amount"
          min="5000"
          step="0.0001"
          required
          placeholder="Minimum 5000 BTC"
        />
        <small className="amount-warning">Minimum transfer amount: 5000 BTC</small>
      </div>
      <button type="submit" className="transfer-btn">
        Transfer
      </button>
    </form>
  );

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
          <button className="nav-btn" onClick={handleTerminalClick}>Terminal</button>
        </div>
      </nav>
      <main className="App-main">
        <div className="wallet-container">
          <h1>Welcome to RK BTC Master Node Wallet</h1>
          <div className="wallet-info">
            <div className="status-grid">
              <div className="status-card">
                <h2>Wallet Balance</h2>
                <p className="balance">114,973.0000 BTC</p>
              </div>
              <div className="status-card">
                <h2>Node Status</h2>
                <p className="status live-orange blink">
                  Syncing with Bitcoin Core - Syncing
                  <span className="sync-details">
                    <span className="sync-progress">88.7%</span>
                    <span className="sync-time">37.9 Hrs remaining</span>
                    <span className="current-time">{new Date().toLocaleString()}</span>
                  </span>
                </p>
              </div>
              <div className="status-card">
                <h2>Security Status</h2>
                <p className="status danger blink">51%</p>
              </div>
              <div className="status-card">
                <h2>Reg Test</h2>
                <p className="status danger blink">45%</p>
              </div>
              
              <div className="status-card threat-monitor">
                <h2>Threat Monitor</h2>
                <p className="status">9925 Threats Detected</p>
                <p className="sub-status">160 Level 4 Threats</p>
              </div>
              
              <div className="status-card ip-status">
                <h2>IP Status</h2>
                <p className="status">
                  <span className="hidden danger blink">51% hidden</span>
                  <span className="exposed">49% exposed</span>
                </p>
              </div>
              
              <div className="status-card ports full-width">
                <h2>Ports</h2>
                <p className="status">12 Ports Active and Listening</p>
                <div className="port-list">
                  <span className="port danger">3000</span>
                  <span className="port danger">3001</span>
                  <span className="port danger">3002</span>
                  <span className="port danger">3003</span>
                  <span className="port danger">3004</span>
                  <span className="port danger">3005</span>
                  <span className="port">3006</span>
                  <span className="port">3007</span>
                  <span className="port">3008</span>
                  <span className="port">3009</span>
                  <span className="port">3010</span>
                  <span className="port">3011</span>
                  <span className="port">3012</span>
                </div>
              </div>
              
              <div className="status-card reg-tracking">
                <h2>Reg Tracking Pad</h2>
                <div className="agency-status">
                  <p onClick={handleAgencyClick} style={{ cursor: 'pointer' }}>
                    Agency: <span className="active" style={{ color: 'orange' }}>AMLO Thailand - Active</span>, 
                    <span className="active" style={{ color: 'orange' }}>CIB - Active</span>
                  </p>
                </div>
                <div className="tracking-metrics">
                  <div className="metric" onClick={handleLocationClick} style={{ cursor: 'pointer' }}>
                    <span className="label">
                      Location - <span className="live">Live</span>
                    </span>
                    <span className="value danger blink">72%</span>
                  </div>
                  <div 
                    className="metric" 
                    onClick={handleIPClick} 
                    style={{ cursor: 'pointer' }}
                  >
                    <span className="label">IP address</span>
                    <span className="value success">53%</span>
                  </div>
                  <div className="metric" onClick={handleUserBehaviorClick} style={{ cursor: 'pointer' }}>
                    <span className="label">User Behaviour</span>
                    <span className="value danger">100%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Wallet Addresses</span>
                    <span className="value danger">100%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Transactions</span>
                    <span className="value success">42%</span>
                  </div>
                  <div className="metric">
                    <span className="label">Mapped Addresses</span>
                    <span className="value danger">82909</span>
                  </div>
                </div>
              </div>
              <div className="status-card gas-block">
                <h2>Gas Block</h2>
                <div className="gas-info">
                  <div className="gas-available">
                    <span className="label">Available and not withdrawable</span>
                    <span className="value">USD 2864</span>
                  </div>
                  <div className="gas-deficit">
                    <span className="label">Deficit</span>
                    <span className="value blink">Calculating</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button 
                className="get-started-btn" 
                onClick={handleGetStarted}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </main>
      <LocationModal />
      <AgencyModal />
      <IPModal />
      <UserBehaviorModal />
      <Terminal />
    </div>
  );
}

export default MainApp; 