import { useAuth } from '@clerk/clerk-react';

const BASE_URL = import.meta.env.VITE_BASE_URL;

// Create a function that takes the token as a parameter
export const fetchStudentsAPI = async (token) => {
  try {
    // Initial request to get encrypted data
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
    
    // Verify the response is encrypted
    if (!result.encrypted || !result.data) {
      throw new Error('Invalid response format from server');
    }

    // Decrypt the data
    const decryptResponse = await fetch(`${BASE_URL}/api/v1/consultation/decrypt`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ encryptedData: result.data })
    });

    if (!decryptResponse.ok) {
      const errorData = await decryptResponse.json();
      throw new Error(errorData.message || "Failed to decrypt data");
    }

    const decryptedData = await decryptResponse.json();
    
    // Return the data array from the decrypted response
    return decryptedData.data;
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