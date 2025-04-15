import { Calendar, Home, Inbox, Search, Settings } from "lucide-react"
import { useNotifications } from "@/app/NotificationContext";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Home",
    url: "#",
    icon: Home,
  },
  {
    title: "Inbox",
    url: "#",
    icon: Inbox,
  },
  {
    title: "Calendar",
    url: "#",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "#",
    icon: Search,
  },
  {
    title: "Settings",
    url: "#",
    icon: Settings,
  },
]

export function AppSidebar() {
  const { notifications, removeNotification } = useNotifications();
  return (
    <Sidebar>
      <SidebarContent>
        {/* Notification section */}
        {notifications.length > 0 && (
          <div style={{ padding: 8 }}>
            {notifications.map(n => (
              <div key={n._id} style={{ background: "#fffbe6", marginBottom: 8, padding: 8, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span>
                  New student entry: {n.name || n.email || n._id}
                </span>
                <button style={{ marginLeft: 8 }} onClick={() => removeNotification(n._id)}>
                  Mark as read
                </button>
              </div>
            ))}
          </div>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
