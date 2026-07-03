import axios from 'axios';

/**
 * Helper to get the configured Axios client for QuickeKYC
 */
const getClient = () => {
  const baseURL = process.env.QUICKEKYC_BASE_URL;
  const apiKey = process.env.QUICKEKYC_API_KEY;
  const timeout = parseInt(process.env.QUICKEKYC_TIMEOUT, 10) || 30000;

  if (!baseURL || !apiKey) {
    throw new Error('Identity provider configuration is missing.');
  }

  return axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Mask sensitive string data for logging
 */
const maskSensitiveData = (str) => {
  if (!str) return 'UNKNOWN';
  if (str.length <= 4) return '****';
  return `${str.substring(0, 2)}****${str.substring(str.length - 2)}`;
};

/**
 * Generate OTP for ID Verification
 * @param {string} idNumber 
 * @returns {object} Normalized response object
 */
export const generateOtp = async (idNumber) => {
  try {
    const client = getClient();
    console.log(`Initiating QuickeKYC OTP generation for ID: ${maskSensitiveData(idNumber)}`);

    // --- DEVELOPMENT BYPASS ---
    // If the Aadhaar number is all zeros, fake a successful response so the user can test the UI flow
    if (idNumber === '000000000000') {
      console.log('Using Development Bypass for Generate OTP');
      return {
        success: true,
        requestId: 'mock-request-id-12345',
        message: 'OTP generated successfully'
      };
    }
    // ---------------------------

    const response = await client.post('/aadhaar-v2/generate-otp', { 
      key: process.env.QUICKEKYC_API_KEY, 
      id_number: idNumber 
    });
    
    // Normalize response
    if (!response.data || response.data.status === 'failed' || response.data.status === 'error' || response.data.data?.status === 'failed') {
      throw new Error(response.data?.message || 'Invalid response received from provider');
    }

    const requestId = response.data.request_id || response.data.data?.request_id;
    if (!requestId) {
      throw new Error('No Request ID returned from identity provider');
    }

    return {
      success: true,
      requestId,
      message: 'OTP generated successfully'
    };
  } catch (error) {
    // Expose specific API errors for debugging configuration issues
    console.error('QuickeKYC Generate OTP Error: Request failed securely');
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Identity provider connection timed out. Please try again later.');
    }
    
    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error(`Provider Error: 401 Unauthorized. Please verify your QUICKEKYC_API_KEY in .env or check if your IP is whitelisted.`);
      }
      throw new Error(`Provider Error: ${error.response.status} - ${error.response.data?.message || 'Verification Failed'}`);
    }
    
    throw new Error(error.message || 'Failed to generate OTP with identity provider.');
  }
};

/**
 * Submit OTP for ID Verification
 * @param {string} requestId 
 * @param {string} otp 
 * @returns {object} Normalized response object
 */
export const submitOtp = async (requestId, otp) => {
  try {
    const client = getClient();
    console.log(`Submitting QuickeKYC OTP for Request ID: ${requestId}`); // requestId is usually a UUID, safe to log, but we won't log the OTP.

    // --- DEVELOPMENT BYPASS ---
    if (requestId === 'mock-request-id-12345') {
      console.log('Using Development Bypass for Submit OTP');
      return {
        success: true,
        verified: true,
        data: { status: 'success', message: 'Aadhaar Verified via Mock' },
        message: 'OTP verification completed'
      };
    }
    // ---------------------------

    const response = await client.post('/aadhaar-v2/submit-otp', { 
      key: process.env.QUICKEKYC_API_KEY,
      request_id: requestId, 
      otp 
    });

    // Normalize response
    if (!response.data || response.data.status === 'error') {
      throw new Error(response.data?.message || 'Invalid response received from provider');
    }

    return {
      success: true,
      verified: response.data.status === 'success' || response.data.data?.status === 'success',
      data: response.data.data || {},
      message: 'OTP verification completed'
    };
  } catch (error) {
    // Expose specific API errors for debugging configuration issues
    console.error('QuickeKYC Submit OTP Error: Request failed securely');
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Identity provider connection timed out. Please try again later.');
    }

    if (error.response) {
      if (error.response.status === 401 || error.response.status === 403) {
        throw new Error(`Provider Error: 401 Unauthorized. Please verify your QUICKEKYC_API_KEY in .env or check if your IP is whitelisted.`);
      }
      throw new Error(`Provider Error: ${error.response.status} - ${error.response.data?.message || 'Verification Failed'}`);
    }
    
    throw new Error(error.message || 'Failed to verify OTP with identity provider.');
  }
};
