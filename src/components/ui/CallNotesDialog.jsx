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
import { formatDistanceToNow, format } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PhoneCall, PhoneMissed, Phone } from "lucide-react";

export function CallNotesDialog({ isOpen, onClose, student }) {
  if (!student) return null;

  const formattedDate = student.lastCalledAt 
    ? formatDistanceToNow(new Date(student.lastCalledAt), { addSuffix: true })
    : "Unknown date";
    
  // Generate a consistent color based on caller name
  const getCallerColor = (callerName) => {
    if (!callerName) return "bg-gray-200";
    
    // Simple hash function to generate a consistent color
    const hash = callerName.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of tailwind colors for badges
    const colors = [
      "bg-red-100 text-red-800",
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-yellow-100 text-yellow-800",
      "bg-purple-100 text-purple-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
      "bg-teal-100 text-teal-800"
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get call status badge
  const getCallStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED": 
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">Completed</Badge>;
      case "NO_RESPONSE": 
        return <Badge variant="destructive">No Response</Badge>;
      case "CALLBACK_REQUESTED": 
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">Callback Requested</Badge>;
      case "CALLED": 
        return <Badge className="bg-yellow-500/20 text-yellow-700 dark:text-yellow-400">Called</Badge>;
      case "MISSED": 
        return <Badge variant="destructive">Missed</Badge>;
      case "DEAD_LEADS": 
        return <Badge className="bg-gray-500/20 text-gray-700 dark:text-gray-400">Dead Leads</Badge>;
      case "SCHEDULED": 
        return <Badge className="bg-blue-500/20 text-blue-700 dark:text-blue-400">Scheduled</Badge>;
      case "GOING_ABROAD": 
        return <Badge className="bg-purple-500/20 text-purple-700 dark:text-purple-400">Going Abroad</Badge>;
      case "WHATSAPP":
        return <Badge className="bg-green-500/20 text-green-700 dark:text-green-400">WhatsApp</Badge>;
      default: 
        return <Badge variant="outline">Not Called</Badge>;
    }
  };

  // Get call status icon
  const getCallStatusIcon = (status) => {
    switch (status) {
      case "COMPLETED": return <PhoneCall className="h-4 w-4 text-green-500" />;
      case "NO_RESPONSE": return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "CALLBACK_REQUESTED": return <Phone className="h-4 w-4 text-blue-500" />;
      case "CALLED": return <Phone className="h-4 w-4 text-yellow-500" />;
      case "MISSED": return <PhoneMissed className="h-4 w-4 text-red-500" />;
      case "DEAD_LEADS": return <Phone className="h-4 w-4 text-gray-500" />;
      case "SCHEDULED": return <Phone className="h-4 w-4 text-blue-500" />;
      case "GOING_ABROAD": return <Phone className="h-4 w-4 text-purple-500" />;
      case "WHATSAPP": return <Phone className="h-4 w-4 text-green-500" />;
      default: return <Phone className="h-4 w-4 text-gray-500" />;
    }
  };

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
          <div className="mb-4 flex items-center justify-between">
            <div>
              <div className="text-sm font-medium mb-1">Current Status</div>
              <div className="flex items-center space-x-2">
                {getCallStatusIcon(student.callStatus)}
                {getCallStatusBadge(student.callStatus)}
              </div>
            </div>
            
            {student.calledBy && (
              <div className="flex items-center gap-2">
                <Avatar className={`h-8 w-8 ${getCallerColor(student.calledBy)}`}>
                  <AvatarFallback>{getInitials(student.calledBy)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-sm font-medium">Called by</div>
                  <div className="text-sm">{student.calledBy}</div>
                </div>
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm font-medium">Notes</div>
            <ScrollArea className="h-[150px] w-full rounded-md border p-4">
              {student.callNotes ? (
                <div className="text-sm whitespace-pre-wrap">{student.callNotes}</div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No notes available</div>
              )}
            </ScrollArea>
          </div>
          
          {/* Call History Section */}
          <div className="mt-4 space-y-2">
            <div className="text-sm font-medium">Call History</div>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              {student.callHistory && student.callHistory.length > 0 ? (
                <div className="space-y-4">
                  {student.callHistory.map((historyEntry, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getCallStatusIcon(historyEntry.callStatus)}
                          {getCallStatusBadge(historyEntry.callStatus)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {historyEntry.timestamp ? format(new Date(historyEntry.timestamp), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                        </div>
                      </div>
                      
                      {historyEntry.calledBy && (
                        <div className="flex items-center gap-2">
                          <Avatar className={`h-6 w-6 ${getCallerColor(historyEntry.calledBy)}`}>
                            <AvatarFallback className="text-xs">{getInitials(historyEntry.calledBy)}</AvatarFallback>
                          </Avatar>
                          <div className="text-xs text-muted-foreground">
                            Updated by {historyEntry.calledBy}
                          </div>
                        </div>
                      )}
                      
                      {historyEntry.callNotes && (
                        <div className="text-xs ml-6 mt-1 text-muted-foreground whitespace-pre-wrap">
                          {historyEntry.callNotes}
                        </div>
                      )}
                      
                      {index < student.callHistory.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No call history available</div>
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
