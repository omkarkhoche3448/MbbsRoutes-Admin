import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneMissed } from "lucide-react";

const CallStatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "COMPLETED":
        return {
          icon: <PhoneCall className="h-4 w-4 text-green-500" />,
          badge: "bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/30",
          text: "Completed"
        };
      case "NO_RESPONSE":
        return {
          icon: <PhoneMissed className="h-4 w-4 text-red-500" />,
          badge: "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30",
          text: "No Response"
        };
      case "CALLBACK_REQUESTED":
        return {
          icon: <Phone className="h-4 w-4 text-blue-500" />,
          badge: "bg-blue-500/20 text-blue-700 dark:text-blue-400 hover:bg-blue-500/30",
          text: "Callback Requested"
        };
      case "CALLED":
        return {
          icon: <Phone className="h-4 w-4 text-yellow-500" />,
          badge: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-500/30",
          text: "Called"
        };
      case "MISSED":
        return {
          icon: <PhoneMissed className="h-4 w-4 text-red-500" />,
          badge: "bg-red-500/20 text-red-700 dark:text-red-400 hover:bg-red-500/30",
          text: "Missed"
        };
      case "DEAD_LEADS":
        return {
          icon: <Phone className="h-4 w-4 text-gray-500" />,
          badge: "bg-gray-500/20 text-gray-700 dark:text-gray-400 hover:bg-gray-500/30",
          text: "Dead Leads"
        };
      case "SCHEDULED":
        return {
          icon: <Phone className="h-4 w-4 text-purple-500" />,
          badge: "bg-purple-500/20 text-purple-700 dark:text-purple-400 hover:bg-purple-500/30",
          text: "Scheduled"
        };
      case "GOING_ABROAD":
        return {
          icon: <Phone className="h-4 w-4 text-indigo-500" />,
          badge: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-500/30",
          text: "Going Abroad"
        };
      default:
        return {
          icon: <Phone className="h-4 w-4 text-gray-400" />,
          badge: "bg-gray-100 text-gray-700 dark:text-gray-400 hover:bg-gray-200",
          text: "Not Called"
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex items-center gap-2">
      {config.icon}
      <Badge className={config.badge}>
        {config.text}
      </Badge>
    </div>
  );
};

export default CallStatusBadge;