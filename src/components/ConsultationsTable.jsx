import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth, useUser } from '@clerk/clerk-react';
import { 
  fetchAdminConsultations, 
  setSelectedConsultation,
  updateConsultationCallStatus
} from '@/redux/slices/callReportsSlice';
import { AdminBadge } from '@/components/ui/AdminBadge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CallStatusDialog } from '@/components/ui/CallStatusDialog';
import { CallNotesDialog } from '@/components/ui/CallNotesDialog';
import { RefreshCw, MessageSquare } from 'lucide-react';

// Add this mapping function to display friendly status names
const getStatusDisplay = (status) => {
  const statusMap = {
    "NOT_CALLED": "Not Called",
    "MISSED": "Missed",
    "DEAD_LEADS": "Dead Leads",
    "SCHEDULED": "Scheduled", 
    "COMPLETED": "Completed",
    "GOING_ABROAD": "Going Abroad"
  };
  return statusMap[status] || "Not Called";
};

// Add this function to get color classes based on caller name
const getCallerColorClass = (callerName) => {
  // Create a simple hash of the caller name to generate consistent colors
  const hash = callerName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  // Use the hash to select from predefined color combinations
  const colorOptions = [
    'bg-blue-50 text-blue-700',
    'bg-purple-50 text-purple-700',
    'bg-amber-50 text-amber-700',
    'bg-emerald-50 text-emerald-700',
    'bg-rose-50 text-rose-700',
    'bg-cyan-50 text-cyan-700',
    'bg-indigo-50 text-indigo-700',
    'bg-orange-50 text-orange-700',
  ];
  
  const index = Math.abs(hash) % colorOptions.length;
  return colorOptions[index];
};

const ConsultationsTable = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const { user } = useUser();
  const { toast } = useToast();
  
  // Get data from Redux store
  const { 
    consultations,
    selectedAdmins,
    selectedConsultation,
    loading,
    error
  } = useSelector(state => state.callReports);
  
  // Local state for dialogs
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false);
  
  // Create a fetchConsultations function that can be called to refresh data
  const handleRefresh = useCallback(async () => {
    try {
      const token = await getToken();
      if (token) {
        dispatch(fetchAdminConsultations({ token }));
      } else {
        toast({
          title: "Error",
          description: "No authentication token available",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh consultations data",
        variant: "destructive",
      });
    }
  }, [dispatch, getToken, toast]);
  
  // Handle status update from dialog
  const handleStatusUpdated = async () => {
    try {
      const token = await getToken();
      if (token) {
        // Just refresh the data
        dispatch(fetchAdminConsultations({ token }));
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh consultations data",
        variant: "destructive",
      });
    }
  };
  
  // Filter consultations based on selected admin filters
  const filteredConsultations = consultations.filter(
    consultation => selectedAdmins.length === 0 || 
    (consultation.calledBy && selectedAdmins.includes(consultation.calledBy))
  );
  
  return (
    <div className="space-y-4">
      
      {/* Consultations Table */}
      <Card>
        <CardHeader className="pb-2 flex flex-col sm:flex-row sm:items-center justify-between">
          <CardTitle className="text-lg">
            Consultations {filteredConsultations.length > 0 && `(${filteredConsultations.length})`}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="mt-2 sm:mt-0"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
              <button 
                className="absolute top-0 bottom-0 right-0 px-4 py-3"
                onClick={handleRefresh}
              >
                <span className="text-xl">&times;</span>
              </button>
            </div>
          )}
          
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredConsultations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
              <p className="text-muted-foreground">No consultations match your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-2">Name</th>
                    <th className="text-left p-2">Contact</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Called By</th>
                    <th className="text-left p-2">Last Called</th>
                    <th className="text-left p-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-card">
                  {filteredConsultations.map(consultation => (
                    <tr key={consultation._id} className="border-b hover:bg-muted/50">
                      <td className="p-2">{consultation.name}</td>
                      <td className="p-2">{consultation.contact}</td>
                      <td className="p-2">
                        {getStatusDisplay(consultation.callStatus)}
                      </td>
                      <td className="p-2">
                        {consultation.calledById ? (
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getCallerColorClass(consultation.calledBy)}`}>
                            {consultation.calledBy}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Not called yet</span>
                        )}
                      </td>
                      <td className="p-2">
                        {consultation.lastCalledAt ? (
                          new Date(consultation.lastCalledAt).toLocaleDateString()
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </td>
                      <td className="p-2">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              dispatch(setSelectedConsultation(consultation));
                              setIsStatusDialogOpen(true);
                            }}
                          >
                            Update Status
                          </Button>
                          {consultation.callNotes && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                dispatch(setSelectedConsultation(consultation));
                                setIsNotesDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Call Status Dialog */}
      {selectedConsultation && (
        <CallStatusDialog
          isOpen={isStatusDialogOpen}
          onClose={() => setIsStatusDialogOpen(false)}
          student={selectedConsultation}
          onStatusUpdated={handleStatusUpdated}
        />
      )}

      {/* Call Notes Dialog */}
      {selectedConsultation && (
        <CallNotesDialog
          isOpen={isNotesDialogOpen}
          onClose={() => setIsNotesDialogOpen(false)}
          student={selectedConsultation}
        />
      )}
    </div>
  );
};

export default ConsultationsTable;
