import { useAuth } from '@clerk/clerk-react';
import { CryptoService } from '../utils/crypto';

// Update the API_BASE_URL to include the correct port
export const API_BASE_URL = import.meta.env.VITE_BASE_URL;

// Add API endpoints configuration
// Update API_ENDPOINTS to match your backend
export const API_ENDPOINTS = {
  CONSULTATIONS: {
    LIST: '/consultations',
    BY_ADMIN: (adminId) =>`/api/v1/consultation/by-admin/${adminId}`,
    CALL_STATUS: (id) => `/api/v1/consultation/${id}/call-status`, 
  },
  ADMINS: {
    LIST: '/api/v1/admin',
  }
};

export const fetchStudentsAPI = async (token) => {
  try {
    
    const response = await fetch(`${API_BASE_URL}/api/v1/consultation/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(errorData.message || "Network response was not ok");
      } catch (jsonError) {
        console.error("Error parsing error response:", jsonError);
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
    }

    const result = await response.json();

    // Handle both encrypted and unencrypted responses
    if (result.encrypted && result.data) {
      try {
        // Decrypt data locally using Web Crypto API
        const decryptedData = await CryptoService.decrypt(result.data);
        
        // Ensure we return the data array from the decrypted response
        if (decryptedData.success && Array.isArray(decryptedData.data)) {
          return decryptedData.data;
        } else if (Array.isArray(decryptedData)) {
          return decryptedData;
        } else {
          console.error("Invalid decrypted data structure:", decryptedData);
          throw new Error('Invalid data structure in decrypted response');
        }
      } catch (decryptError) {
        console.error("Decryption error:", decryptError);
        throw new Error(`Failed to decrypt data: ${decryptError.message}`);
      }
    } else if (result.success && Array.isArray(result.data)) {
      // Handle unencrypted response with success and data fields
      return result.data;
    } else if (Array.isArray(result)) {
      // Handle direct array response
      return result;
    } else if (result.data && Array.isArray(result.data)) {
      // Handle unencrypted response with data field
      return result.data;
    } else {
      console.error("Invalid response format:", result);
      throw new Error('Invalid response format from server');
    }
  } catch (error) {
    console.error("Error in fetchStudentsAPI:", error);
    throw error;
  }
};

export const useFetchStudents = () => {
  const { getToken } = useAuth();
  
  const fetchStudents = async () => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      return await fetchStudentsAPI(token);
    } catch (error) {
      console.error("Error in useFetchStudents:", error);
      throw error;
    }
  };

  return fetchStudents;
};
