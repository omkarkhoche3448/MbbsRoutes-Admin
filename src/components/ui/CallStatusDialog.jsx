import { useState, useEffect } from "react";
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

const CALL_STATUS_OPTIONS = [
  { value: "NOT_CALLED", label: "Not Called", icon: <Phone className="h-4 w-4 text-gray-500" /> },
  { value: "MISSED", label: "Missed", icon: <PhoneMissed className="h-4 w-4 text-red-500" /> },
  { value: "DEAD_LEADS", label: "Dead Leads", icon: <Phone className="h-4 w-4 text-gray-500" /> },
  { value: "SCHEDULED", label: "Scheduled", icon: <Phone className="h-4 w-4 text-blue-500" /> },
  { value: "COMPLETED", label: "Completed", icon: <PhoneCall className="h-4 w-4 text-green-500" /> },
  { value: "GOING_ABROAD", label: "Going Abroad", icon: <Phone className="h-4 w-4 text-purple-500" /> },
];

function CallStatusDialog({ isOpen, onClose, student, onStatusUpdated }) {
  const { updateCallStatus, generateAICallNotes } = useCallStatusService();
  const { toast } = useToast();
  const [callStatus, setCallStatus] = useState(student?.callStatus || "MISSED");
  const [callNotes, setCallNotes] = useState(student?.callNotes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingNotes, setIsGeneratingNotes] = useState(false);

  // Reset form when student changes
  useEffect(() => {
    if (student) {
      setCallStatus(student.callStatus || "MISSED");
      setCallNotes(student.callNotes || "");
    }
  }, [student]);

  const handleGenerateAINotes = async () => {
    if (!student) return;
    
    setIsGeneratingNotes(true);
    try {
      const aiNotes = await generateAICallNotes(student);
      setCallNotes(prevNotes => {
        const prefix = prevNotes ? prevNotes + "\n\n--- AI Generated Notes ---\n" : "--- AI Generated Notes ---\n";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!student?._id) {
      toast({
        title: "Error",
        description: "Student ID is missing",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const result = await updateCallStatus(student._id, callStatus, callNotes);
      
      if (onStatusUpdated) {
        onStatusUpdated(result);
      }
      
      onClose();
    } catch (error) {
      console.error("Error updating call status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    const option = CALL_STATUS_OPTIONS.find(opt => opt.value === status);
    return option ? option.icon : <Phone className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Call Status</DialogTitle>
          <DialogDescription>
            Update the call status and notes for {student?.name}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Call Status</Label>
              <Select
                value={callStatus}
                onValueChange={setCallStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select call status">
                    {getStatusIcon(callStatus)}
                    <span className="ml-2">{CALL_STATUS_OPTIONS.find(opt => opt.value === callStatus)?.label}</span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {CALL_STATUS_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon}
                        <span className="ml-2">{option.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="callNotes" className="text-sm font-medium">
                Call Notes
              </label>
              <Textarea
                id="callNotes"
                placeholder="Enter notes about the call..."
                value={callNotes}
                onChange={(e) => setCallNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter className="flex flex-col sm:flex-row gap-2">
              {/* <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleGenerateAINotes} 
                disabled={isSubmitting || isGeneratingNotes}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                {isGeneratingNotes ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Generate AI Notes
                  </>
                )}
              </Button> */}
              <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
                <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Status"
                  )}
                </Button>
              </div>
            </DialogFooter>
          </div>
        </form>
        </DialogContent>
      </Dialog>
    );
}

// Add this export statement at the end of the file
export { CallStatusDialog };
