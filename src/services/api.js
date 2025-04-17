import { useAuth } from '@clerk/clerk-react';
import { CryptoService } from '../utils/crypto';

const BASE_URL = import.meta.env.VITE_BASE_URL;

export const fetchStudentsAPI = async (token) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/consultation/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Network response was not ok");
    }

    const result = await response.json();
    
    if (!result.encrypted || !result.data) {
      throw new Error('Invalid response format from server');
    }

    // Decrypt data locally using Web Crypto API
    const decryptedData = await CryptoService.decrypt(result.data);
    
    // Ensure we return the data array from the decrypted response
    if (decryptedData.success && Array.isArray(decryptedData.data)) {
      return decryptedData.data;
    } else {
      throw new Error('Invalid data structure in decrypted response');
    }

  } catch (error) {
    console.error("Error in fetchStudentsAPI:", error);
    throw error;
  }
};

// React hook to use in components
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