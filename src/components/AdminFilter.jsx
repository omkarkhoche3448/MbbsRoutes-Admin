import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
import { setSelectedAdmins } from '@/redux/slices/callReportsSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AdminFilter = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Get data from Redux store
  const { 
    consultations,
    selectedAdmins,
    loading,
    error
  } = useSelector(state => state.callReports);
  
  // Extract unique callers from consultations
  const uniqueCallers = React.useMemo(() => {
    if (!consultations || !consultations.length) return [];
    
    // Get unique caller names
    return [...new Set(consultations
      .map(consultation => consultation.calledBy)
      .filter(Boolean))];
  }, [consultations]);
  
  // Handle admin selection change
  const handleAdminChange = (value) => {
    if (value === 'all') {
      // Select all admins
      dispatch(setSelectedAdmins(uniqueCallers));
    } else if (value === 'none') {
      // Clear all selections
      dispatch(setSelectedAdmins([]));
    } else {
      // Select a specific admin by name
      dispatch(setSelectedAdmins([value]));
    }
  };
  
  // Get the current selection display text
  const getSelectionText = () => {
    if (selectedAdmins.length === 0) {
      return "No admins selected";
    } else if (selectedAdmins.length === uniqueCallers.length && uniqueCallers.length > 0) {
      return "All admins";
    } else if (selectedAdmins.length === 1) {
      return selectedAdmins[0]; // The name is already stored
    } else {
      return `${selectedAdmins.length} admins selected`;
    }
  };
  
  // Set all admins as selected by default when component mounts
  useEffect(() => {
    if (uniqueCallers.length > 0 && selectedAdmins.length === 0) {
      dispatch(setSelectedAdmins(uniqueCallers));
    }
  }, [uniqueCallers, selectedAdmins.length, dispatch]);
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Filter by Admin</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading admins...</div>
        ) : uniqueCallers.length === 0 ? (
          <div className="text-sm text-muted-foreground">No admins found</div>
        ) : (
          <Select 
            value={selectedAdmins.length === 1 ? selectedAdmins[0] : (selectedAdmins.length === uniqueCallers.length ? 'all' : 'custom')}
            onValueChange={handleAdminChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select admin filter">
                <div className="flex items-center">
                  <Users2 className="mr-2 h-4 w-4" />
                  {getSelectionText()}
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Admins</SelectItem>
              <SelectItem value="none">Clear Selection</SelectItem>
              {uniqueCallers.map(caller => (
                <SelectItem key={caller} value={caller}>{caller}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardContent>
    </Card>
  );
};
