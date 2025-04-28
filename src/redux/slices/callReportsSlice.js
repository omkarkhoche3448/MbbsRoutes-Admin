import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL } from '../../services/api';

// Async thunk for fetching admin consultations
export const fetchAdminConsultations = createAsyncThunk(
  'callReports/fetchAdminConsultations',
  async ({ token, startDate, endDate }, { rejectWithValue }) => {
    try {
      // Build query parameters for filtering
      let url = `${API_BASE_URL}/api/v1/consultation/admin-consultations`;
      let queryParams = new URLSearchParams();

      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);

      // Add query parameters to URL if any exist
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch admin consultations');
      }

      const result = await response.json();

      // Check if the response is encrypted
      if (result.encrypted && result.data) {
        try {
          // Import CryptoService
          const { CryptoService } = await import('../../utils/crypto');

          // Decrypt the data
          const decryptedData = await CryptoService.decrypt(result.data);

          // Return the decrypted data
          return decryptedData.data || [];
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt data: ${decryptError.message}`);
        }
      } else if (result.success && result.data) {
        return result.data;
      } else {
        console.error("Unexpected response format:", result);
        throw new Error("Unexpected response format from server");
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching all admins
export const fetchAllAdmins = createAsyncThunk(
  'callReports/fetchAllAdmins',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch admins');
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating call status
export const updateConsultationCallStatus = createAsyncThunk(
  'callReports/updateCallStatus',
  async ({ consultationId, status, notes, calledBy, calledById, token }, { rejectWithValue }) => {
    const endpoint = `${API_BASE_URL}/api/v1/consultation/${consultationId}/call-status`;

    try {
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          callStatus: status,
          callNotes: notes,
          calledBy,
          calledById
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error updating call status:", errorData);
        return rejectWithValue(errorData.message || 'Failed to update call status');
      }

      const result = await response.json();

      return result.data || result;
    } catch (error) {
      console.error("Exception in updateConsultationCallStatus:", error);
      return rejectWithValue(error.message || 'An error occurred while updating call status');
    }
  }
);

const callReportsSlice = createSlice({
  name: 'callReports',
  initialState: {
    consultations: [],
    admins: [],
    selectedAdmins: [],
    selectedConsultation: null,
    loading: false,
    error: null,
    stats: {
      totalCalls: 0,
      completed: 0,
      scheduled: 0,
      notCalled: 0,
      missed: 0,
      deadLeads: 0,
      goingAbroad: 0,
      uniqueCallers: []
    }
  },
  reducers: {
    setSelectedAdmins: (state, action) => {
      state.selectedAdmins = action.payload;
    },
    setSelectedConsultation: (state, action) => {
      state.selectedConsultation = action.payload;
    },
    clearSelectedConsultation: (state) => {
      state.selectedConsultation = null;
    },
    updateStats: (state) => {
      const consultations = state.consultations;
      if (!consultations.length) {
        state.stats = {
          totalCalls: 0,
          completed: 0,
          scheduled: 0,
          notCalled: 0,
          missed: 0,
          deadLeads: 0,
          goingAbroad: 0,
          uniqueCallers: []
        };
        return;
      }

      const totalCalls = consultations.length;
      const completed = consultations.filter(c => c.callStatus === 'COMPLETED').length;
      const scheduled = consultations.filter(c => c.callStatus === 'SCHEDULED').length;
      const notCalled = consultations.filter(c => c.callStatus === 'NOT_CALLED').length;
      const missed = consultations.filter(c => c.callStatus === 'MISSED').length;
      const deadLeads = consultations.filter(c => c.callStatus === 'DEAD_LEADS').length;
      const goingAbroad = consultations.filter(c => c.callStatus === 'GOING_ABROAD').length;

      // Extract unique callers
      const uniqueCallers = [...new Set(consultations.map(c => c.calledBy).filter(Boolean))];

      state.stats = {
        totalCalls,
        completed,
        scheduled,
        notCalled,
        missed,
        deadLeads,
        goingAbroad,
        uniqueCallers
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchAdminConsultations
      .addCase(fetchAdminConsultations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminConsultations.fulfilled, (state, action) => {
        state.loading = false;
        state.consultations = action.payload;

        // Update stats
        const consultations = action.payload;
        if (!consultations.length) {
          state.stats = {
            totalCalls: 0,
            completed: 0,
            scheduled: 0,
            notCalled: 0,
            missed: 0,
            deadLeads: 0,
            goingAbroad: 0,
            uniqueCallers: []
          };
          return;
        }

        const totalCalls = consultations.length;
        const completed = consultations.filter(c => c.callStatus === 'COMPLETED').length;
        const scheduled = consultations.filter(c => c.callStatus === 'SCHEDULED').length;
        const notCalled = consultations.filter(c => c.callStatus === 'NOT_CALLED').length;
        const missed = consultations.filter(c => c.callStatus === 'MISSED').length;
        const deadLeads = consultations.filter(c => c.callStatus === 'DEAD_LEADS').length;
        const goingAbroad = consultations.filter(c => c.callStatus === 'GOING_ABROAD').length;

        // Extract unique callers
        const uniqueCallers = [...new Set(consultations.map(c => c.calledBy).filter(Boolean))];

        state.stats = {
          totalCalls,
          completed,
          scheduled,
          notCalled,
          missed,
          deadLeads,
          goingAbroad,
          uniqueCallers
        };
      })
      .addCase(fetchAdminConsultations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchAllAdmins
      .addCase(fetchAllAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllAdmins.fulfilled, (state, action) => {
        state.loading = false;
        state.admins = action.payload;
        // Initially select all admins
        state.selectedAdmins = action.payload.map(admin => admin.id);
      })
      .addCase(fetchAllAdmins.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateConsultationCallStatus
      .addCase(updateConsultationCallStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateConsultationCallStatus.fulfilled, (state, action) => {
        state.loading = false;

        // Update the consultation in the state
        const updatedConsultation = action.payload;
        const index = state.consultations.findIndex(consultation => consultation._id === updatedConsultation._id);
        if (index !== -1) {
          state.consultations[index] = {
            ...state.consultations[index],
            callStatus: updatedConsultation.callStatus,
            callNotes: updatedConsultation.callNotes,
            calledBy: updatedConsultation.calledBy,
            calledById: updatedConsultation.calledById,
            lastCalledAt: updatedConsultation.lastCalledAt,
            // Include call history if it exists in the response
            ...(updatedConsultation.callHistory && { callHistory: updatedConsultation.callHistory })
          };
        }

        // Update stats using the reducer
        updateStats(state);
      })
      .addCase(updateConsultationCallStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setSelectedAdmins,
  setSelectedConsultation,
  clearSelectedConsultation,
  updateStats
} = callReportsSlice.actions;

export default callReportsSlice.reducer;
