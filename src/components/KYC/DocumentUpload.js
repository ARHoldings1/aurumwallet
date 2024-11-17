import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

function DocumentUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [files, setFiles] = useState({
    idCard: null,
    selfie: null
  });
  const [previews, setPreviews] = useState({
    idCard: null,
    selfie: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.kycStatus === 'PENDING' || user?.kycStatus === 'VERIFIED') {
      navigate('/kyc/status');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    const { name, files: uploadedFiles } = e.target;
    if (uploadedFiles && uploadedFiles[0]) {
      setFiles(prev => ({
        ...prev,
        [name]: uploadedFiles[0]
      }));

      // Create preview URL
      const previewUrl = URL.createObjectURL(uploadedFiles[0]);
      setPreviews(prev => ({
        ...prev,
        [name]: previewUrl
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('fullName', formData.fullName);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('address', formData.address);
      formDataObj.append('idCard', files.idCard);
      formDataObj.append('selfie', files.selfie);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/kyc/submit`,
        formDataObj,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      setSuccess('KYC documents submitted successfully!');
      
      // Navigate to status page after short delay
      setTimeout(() => {
        navigate('/kyc/status');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-upload-container">
      <div className="kyc-upload-content">
        <h2>KYC Document Upload</h2>
        <p className="kyc-instructions">
          Please provide your personal information and upload the required documents
          for KYC verification.
        </p>

        <form onSubmit={handleSubmit} className="kyc-form">
          <div className="form-section">
            <h3>Personal Information</h3>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address</label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="form-input"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Document Upload</h3>
            <div className="upload-group">
              <div className="upload-item">
                <label htmlFor="idCard">Government ID</label>
                <div className="upload-area">
                  <input
                    type="file"
                    id="idCard"
                    name="idCard"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    className="file-input"
                  />
                  {previews.idCard && (
                    <div className="preview-container">
                      <img src={previews.idCard} alt="ID Preview" className="document-preview" />
                    </div>
                  )}
                </div>
              </div>

              <div className="upload-item">
                <label htmlFor="selfie">Selfie with ID</label>
                <div className="upload-area">
                  <input
                    type="file"
                    id="selfie"
                    name="selfie"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                    className="file-input"
                  />
                  {previews.selfie && (
                    <div className="preview-container">
                      <img src={previews.selfie} alt="Selfie Preview" className="document-preview" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="submit-btn"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Submit Documents'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default DocumentUpload;
