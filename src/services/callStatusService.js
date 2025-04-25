import { useAuth } from '@clerk/clerk-react';
import { CryptoService } from '../utils/crypto';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from './api';

/**
 * Updates the call status of a consultation
 * @param {string} id - The consultation ID
 * @param {string} callStatus - The new call status (NOT_CALLED, CALLED, NO_RESPONSE, CALLBACK_REQUESTED, COMPLETED)
 * @param {string} callNotes - Optional notes about the call
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - The updated consultation data
 */
export const updateCallStatusAPI = async (id, callStatus, callNotes, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/consultation/${id}/call-status`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ callStatus, callNotes }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update call status');
    }

    const result = await response.json();
    
    if (!result.encrypted || !result.data) {
      throw new Error('Invalid response format from server');
    }

    // Decrypt data locally using Web Crypto API
    const decryptedData = await CryptoService.decrypt(result.data);
    
    if (!decryptedData.success) {
      throw new Error(decryptedData.message || 'Failed to update call status');
    }

    return decryptedData;
  } catch (error) {
    console.error('Error in updateCallStatusAPI:', error);
    throw error;
  }
};

/**
 * Generate AI call notes based on consultation data
 * @param {Object} consultationData - The consultation data
 * @param {string} token - Authentication token
 * @returns {Promise<string>} - AI generated call notes
 */
export const generateAICallNotesAPI = async (consultationData, token) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/consultation/generate-ai-notes`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ consultationData }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to generate AI call notes');
    }

    const result = await response.json();
    
    if (!result.encrypted || !result.data) {
      throw new Error('Invalid response format from server');
    }

    // Decrypt data locally using Web Crypto API
    const decryptedData = await CryptoService.decrypt(result.data);
    
    if (!decryptedData.success) {
      throw new Error(decryptedData.message || 'Failed to generate AI call notes');
    }

    return decryptedData.notes;
  } catch (error) {
    console.error('Error in generateAICallNotesAPI:', error);
    throw error;
  }
};

// React hook to use in components
export const useCallStatusService = () => {
  const { getToken } = useAuth();
  const { toast } = useToast();
  
  const updateCallStatus = async (id, callStatus, callNotes = '') => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      const result = await updateCallStatusAPI(id, callStatus, callNotes, token);
      toast({
        title: 'Success',
        description: 'Call status updated successfully',
      });
      return result.data;
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update call status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const generateAICallNotes = async (consultationData) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      return await generateAICallNotesAPI(consultationData, token);
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate AI call notes',
        variant: 'destructive',
      });
      throw error;
    }
  };

  return {
    updateCallStatus,
    generateAICallNotes,
  };
};
