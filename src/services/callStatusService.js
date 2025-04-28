import { useAuth, useUser } from '@clerk/clerk-react';
import { CryptoService } from '../utils/crypto';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from './api';

// In your useCallStatusService hook
export function useCallStatusService() {
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Define the updateCallStatus function inside the hook
  const updateCallStatus = async (studentId, status, notes) => {
    const endpoint = `${API_BASE_URL}/api/v1/consultation/${studentId}/call-status`;
    
    try {
      const token = await getToken();
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          callStatus: status,
          callNotes: notes
        })
      });
      
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || 'Failed to update call status');
      }
      
      const result = await response.json();
      
      // Extract the student data from the response
      let updatedStudent;
      
      // Check if the response is encrypted
      if (result.encrypted && result.data) {
        try {
          // Decrypt the data
          const decryptedData = await CryptoService.decrypt(result.data);
          
          if (decryptedData.success && decryptedData.data) {
            updatedStudent = decryptedData.data;
          } else {
            updatedStudent = decryptedData;
          }
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt student data: ${decryptError.message}`);
        }
      } else if (result.success && result.data) {
        updatedStudent = result.data;
      } else if (typeof result === 'object' && result._id) {
        updatedStudent = result;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // Explicitly ensure the callStatus is set correctly
      updatedStudent.callStatus = status;
      
      return updatedStudent;
    } catch (error) {
      console.error("Error updating call status:", error);
      throw error;
    }
  };

  // Generate AI call notes based on student data
  const generateAICallNotes = async (student) => {
    try {
      const token = await getToken();
            
      const response = await fetch(`${API_BASE_URL}/api/v1/consultation/generate-ai-notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ consultationData: student })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error(errorData.message || 'Failed to generate AI notes');
      }
      
      const result = await response.json();
      
      // Check if the response is encrypted
      if (result.encrypted && result.data) {
        try {
          // Decrypt the data
          const decryptedData = await CryptoService.decrypt(result.data);
          return decryptedData.notes || "No AI notes generated.";
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt AI notes: ${decryptError.message}`);
        }
      } else {
        // Handle unencrypted response
        return result.notes || "No AI notes generated.";
      }
    } catch (error) {
      console.error("Error generating AI notes:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate AI notes",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  // Get admin consultations
  const getAdminConsultations = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/consultation/admin-consultations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admin consultations');
      }
      
      const result = await response.json();
      
      // Check if the response is encrypted
      if (result.encrypted && result.data) {
        try {
          // Decrypt the data
          const decryptedData = await CryptoService.decrypt(result.data);
                            
          if (decryptedData.success && decryptedData.data) {
            return decryptedData.data || [];
          } else {
            return decryptedData || [];
          }
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt admin consultations: ${decryptError.message}`);
        }
      } else if (result.data) {
        return result.data || [];
      } else {
        return result || [];
      }
    } catch (error) {
      console.error("Error fetching admin consultations:", error);
      return [];
    }
  };
  
  // Get all admins
  const getAllAdmins = async () => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_BASE_URL}/api/v1/admins`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      
      const result = await response.json();
      
      // Check if the response is encrypted
      if (result.encrypted && result.data) {
        try {
          // Decrypt the data
          const decryptedData = await CryptoService.decrypt(result.data);
          
          if (decryptedData.success && decryptedData.data) {
            return decryptedData.data || [];
          } else {
            return decryptedData || [];
          }
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt admins data: ${decryptError.message}`);
        }
      } else if (result.data) {
        return result.data || [];
      } else {
        return result || [];
      }
    } catch (error) {
      console.error("Error fetching admins:", error);
      return [];
    }
  };
  
  // Get admin color for UI
  const getAdminColor = (adminId) => {
    // Simple hash function to generate consistent colors
    const colors = [
      '#4CAF50', '#2196F3', '#FF9800', '#E91E63', 
      '#9C27B0', '#3F51B5', '#00BCD4', '#009688'
    ];
    
    if (!adminId) return colors[0];
    
    // Generate a simple hash from the adminId
    const hash = adminId.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);
    
    return colors[hash % colors.length];
  };
  
  // Return the functions
  return {
    updateCallStatus,
    generateAICallNotes,
    getAdminConsultations,
    getAllAdmins,
    getAdminColor
  };
}
