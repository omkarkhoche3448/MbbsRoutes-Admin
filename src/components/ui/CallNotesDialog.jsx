import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

export function CallNotesDialog({ isOpen, onClose, student }) {
  if (!student) return null;

  const formattedDate = student.lastCalledAt 
    ? formatDistanceToNow(new Date(student.lastCalledAt), { addSuffix: true })
    : "Unknown date";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Call Notes</DialogTitle>
          <DialogDescription>
            Notes from call with {student.name} ({formattedDate})
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <div className="text-sm font-medium mb-1">Status</div>
            <div className="text-sm">
              {student.callStatus === "NOT_CALLED" && "Not Called"}
              {student.callStatus === "MISSED" && "Missed"}
              {student.callStatus === "DEAD_LEADS" && "Dead Leads"}
              {student.callStatus === "SCHEDULED" && "Scheduled"}
              {student.callStatus === "COMPLETED" && "Completed"}
              {student.callStatus === "GOING_ABROAD" && "Going Abroad"}
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium mb-1">Notes</div>
            <ScrollArea className="h-[200px] rounded-md border p-4">
              {student.callNotes ? (
                <p className="text-sm whitespace-pre-wrap">{student.callNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No notes available</p>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
