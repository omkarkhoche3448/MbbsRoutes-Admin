import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateConsultationCallStatus } from "../../redux/slices/callReportsSlice";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCallStatusService } from "@/services/callStatusService";
import { useToast } from "@/hooks/use-toast";
import { PhoneCall, PhoneMissed, Phone, Loader2, MessageSquare } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useUser, useAuth } from "@clerk/clerk-react";

const CALL_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "Not Called", icon: <Phone className="h-4 w-4 text-gray-500" /> },
  { value: "MISSED", label: "Missed", icon: <PhoneMissed className="h-4 w-4 text-red-500" /> },
  { value: "DEAD_LEADS", label: "Dead Leads", icon: <Phone className="h-4 w-4 text-gray-500" /> },
  { value: "SCHEDULED", label: "Scheduled", icon: <Phone className="h-4 w-4 text-blue-500" /> },
  { value: "COMPLETED", label: "Completed", icon: <PhoneCall className="h-4 w-4 text-green-500" /> },
  { value: "GOING_ABROAD", label: "Going Abroad", icon: <Phone className="h-4 w-4 text-purple-500" /> },
];

function CallStatusDialog({ isOpen, onClose, student, onStatusUpdated }) {
  const dispatch = useDispatch();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { generateAICallNotes } = useCallStatusService();
  const { toast } = useToast();
  
  // Initialize with the student's current status or default to NOT_CALLED
  const [callStatus, setCallStatus] = useState(student?.callStatus || "NOT_CALLED");
  const [callNotes, setCallNotes] = useState(student?.callNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);
  
  // Reset form when student changes
  useEffect(() => {
    if (student) {
      setCallStatus(student.callStatus || "NOT_CALLED");
      setCallNotes(student.callNotes || "");
    }
  }, [student]);

  const handleGenerateAINotes = async () => {
    if (!student) return;
    
    setIsGeneratingNotes(true);
    try {
      const aiNotes = await generateAICallNotes(student);
      setCallNotes(prevNotes => {
        const prefix = prevNotes ? prevNotes + "\n\n" : "";
        return prefix + aiNotes;
      });
      
      toast({
        title: "AI Notes Generated",
        description: "AI-generated call notes have been added",
      });
    } catch (error) {
      console.error("Error generating AI notes:", error);
    } finally {
      setIsGeneratingNotes(false);
    }
  };

  const handleSubmit = async () => {
    if (!student) return;
    
    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      const userName = user?.fullName || "Unknown";
      const userId = user?.id;
      
      await dispatch(updateConsultationCallStatus({
        consultationId: student._id,
        status: callStatus,
        notes: callNotes,
        calledBy: userName,
        calledById: userId,
        token
      })).unwrap();
      
      toast({
        title: "Success",
        description: "Call status updated successfully",
      });
      
      // Close the dialog
      onClose();
      
      // Call the callback to refresh data
      if (onStatusUpdated) {
        onStatusUpdated();
      }
    } catch (error) {
      console.error("Error updating call status:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update call status",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Call Status</DialogTitle>
          <DialogDescription>
            Update the call status and notes for {student?.name}
            <div className="text-xs mt-1">
              You are logged in as: {user?.fullName}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Call Status</Label>
            <Select 
              value={callStatus} 
              onValueChange={setCallStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CALL_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="notes">Call Notes</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleGenerateAINotes}
                disabled={isGeneratingNotes}
              >
                {isGeneratingNotes ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4 mr-1" />
                    Generate AI Notes
                  </>
                )}
              </Button>
            </div>
            <Textarea
              id="notes"
              value={callNotes}
              onChange={(e) => setCallNotes(e.target.value)}
              placeholder="Enter notes about the call"
              rows={5}
            />
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { CallStatusDialog };
