import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CryptoService } from '../../utils/crypto';
import { API_BASE_URL } from '../../services/api';

// Async thunk for fetching students
export const fetchStudents = createAsyncThunk(
  'students/fetchStudents',
  async ({ token }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/consultation/all`, {
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

      // Decrypt the data if it's encrypted
      if (result.encrypted && result.data) {
        try {
          const decryptedData = await CryptoService.decrypt(result.data);
          
          return decryptedData.data || [];
        } catch (decryptError) {
          console.error("Decryption error:", decryptError);
          throw new Error(`Failed to decrypt data: ${decryptError.message}`);
        }
      } else if (result.success && result.data) {
        // Handle unencrypted response
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


// Async thunk for updating call status
export const updateStudentCallStatus = createAsyncThunk(
  'students/updateCallStatus',
  async ({ studentId, status, notes, calledBy, calledById, token }, { rejectWithValue }) => {
    const endpoint = `${API_BASE_URL}/api/v1/consultation/${studentId}/call-status`;
    
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
      
      if (result.encrypted && result.data) {
        const decryptedData = await CryptoService.decrypt(result.data);
        return decryptedData;
      }
      
      return result;
    } catch (error) {
      console.error("Exception in updateStudentCallStatus:", error);
      return rejectWithValue(error.message || 'An error occurred while updating call status');
    }
  }
);

const studentsSlice = createSlice({
  name: 'students',
  initialState: {
    data: [],
    loading: false,
    error: null,
    selectedStudent: null,
    filters: {
      searchQuery: "",
      stateFilter: "all",
      districtFilter: "all",
      countryFilter: "all",
      callStatusFilter: "all",
      counsellorFilter: "all",
      interestedInFilter: "all",
      calledByFilter: "all",
      dateFilter: null
    },
    selectedStudents: [],
    stats: {
      totalStudents: 0,
      avgNeetScore: 0,
      newThisMonth: 0,
      topCountry: "N/A"
    }
  },
  reducers: {
    setSelectedStudent: (state, action) => {
      state.selectedStudent = action.payload;
    },
    clearSelectedStudent: (state) => {
      state.selectedStudent = null;
    },
    setFilter: (state, action) => {
      const { filterName, value } = action.payload;
      state.filters[filterName] = value;
      
      // Reset district filter when state changes
      if (filterName === 'stateFilter' && value !== 'all') {
        state.filters.districtFilter = 'all';
      }
    },
    clearFilters: (state) => {
      state.filters = {
        searchQuery: "",
        stateFilter: "all",
        districtFilter: "all",
        countryFilter: "all",
        callStatusFilter: "all",
        counsellorFilter: "all",
        interestedInFilter: "all",
        calledByFilter: "all",
        dateFilter: null
      };
    },
    selectStudent: (state, action) => {
      const studentId = action.payload;
      if (!state.selectedStudents.includes(studentId)) {
        state.selectedStudents.push(studentId);
      }
    },
    deselectStudent: (state, action) => {
      const studentId = action.payload;
      state.selectedStudents = state.selectedStudents.filter(id => id !== studentId);
    },
    selectAllStudents: (state, action) => {
      const studentIds = action.payload;
      state.selectedStudents = [...studentIds];
    },
    clearSelectedStudents: (state) => {
      state.selectedStudents = [];
    },
    updateStats: (state) => {
      const students = state.data;
      if (!students.length) {
        state.stats = { totalStudents: 0, avgNeetScore: 0, newThisMonth: 0, topCountry: "N/A" };
        return;
      }
      
      const totalStudents = students.length;
      
      // Handle potential NaN in NEET scores
      const validNeetScores = students.filter(student => 
        !isNaN(Number(student.neetScore)) && student.neetScore !== null && student.neetScore !== ''
      );
      
      const totalNeetScore = validNeetScores.reduce((acc, student) => 
        acc + Number(student.neetScore), 0
      );
      
      const avgNeetScore = validNeetScores.length > 0 
        ? Math.round(totalNeetScore / validNeetScores.length) 
        : 0;

      const now = new Date();
      const newThisMonth = students.filter(student => {
        const date = new Date(student.createdAt);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }).length;

      // Updated top country calculation
      const countryCounts = {};
      students.forEach(student => {
        const country = student.preferredCountry === "No Idea/ Want More Information" ? "Guidance" : student.preferredCountry;
        if (country) {
          countryCounts[country] = (countryCounts[country] || 0) + 1;
        }
      });

      const topCountry = Object.entries(countryCounts).length > 0
        ? Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
        : "N/A";

      state.stats = { totalStudents, avgNeetScore, newThisMonth, topCountry };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudents.fulfilled, (state, action) => {
        state.loading = false;
        state.data = Array.isArray(action.payload) ? action.payload : [];
        
        // Update stats when students are fetched
        const students = state.data;
        if (!students.length) {
          state.stats = { totalStudents: 0, avgNeetScore: 0, newThisMonth: 0, topCountry: "N/A" };
          return;
        }
        
        const totalStudents = students.length;
        
        // Handle potential NaN in NEET scores
        const validNeetScores = students.filter(student => 
          !isNaN(Number(student.neetScore)) && student.neetScore !== null && student.neetScore !== ''
        );
        
        const totalNeetScore = validNeetScores.reduce((acc, student) => 
          acc + Number(student.neetScore), 0
        );
        
        const avgNeetScore = validNeetScores.length > 0 
          ? Math.round(totalNeetScore / validNeetScores.length) 
          : 0;

        const now = new Date();
        const newThisMonth = students.filter(student => {
          const date = new Date(student.createdAt);
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        }).length;

        // Updated top country calculation
        const countryCounts = {};
        students.forEach(student => {
          const country = student.preferredCountry === "No Idea/ Want More Information" ? "Guidance" : student.preferredCountry;
          if (country) {
            countryCounts[country] = (countryCounts[country] || 0) + 1;
          }
        });

        const topCountry = Object.entries(countryCounts).length > 0
          ? Object.entries(countryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A"
          : "N/A";

        state.stats = { totalStudents, avgNeetScore, newThisMonth, topCountry };
      })
      .addCase(fetchStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudentCallStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateStudentCallStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Update the student in the state
        const updatedStudent = action.payload;
        const index = state.data.findIndex(student => student._id === updatedStudent._id);
        if (index !== -1) {
          state.data[index] = {
            ...state.data[index],
            callStatus: updatedStudent.callStatus,
            callNotes: updatedStudent.callNotes,
            calledBy: updatedStudent.calledBy,
            calledById: updatedStudent.calledById,
            lastCalledAt: updatedStudent.lastCalledAt,
            // Include call history if it exists in the response
            ...(updatedStudent.callHistory && { callHistory: updatedStudent.callHistory })
          };
        }
      })
      .addCase(updateStudentCallStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  setSelectedStudent, 
  clearSelectedStudent,
  setFilter,
  clearFilters,
  selectStudent,
  deselectStudent,
  selectAllStudents,
  clearSelectedStudents,
  updateStats
} = studentsSlice.actions;

export default studentsSlice.reducer;
