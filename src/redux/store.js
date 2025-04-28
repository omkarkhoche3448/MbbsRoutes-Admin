import { configureStore } from '@reduxjs/toolkit';
import studentsReducer from './slices/studentsSlice';
import callReportsReducer from './slices/callReportsSlice';

export const store = configureStore({
  reducer: {
    students: studentsReducer,
    callReports: callReportsReducer,
  },
});
