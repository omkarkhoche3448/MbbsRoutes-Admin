import { BellRing, LayoutDashboard, Menu, Moon, Phone, Sun, Users,BarChart  } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "./sheet"
import { useToast } from "@/hooks/use-toast"
import { useEffect, useState } from "react"
import { Button } from "./button"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./dropdown-menu"
import { useUser, useClerk } from '@clerk/clerk-react';

const DashboardLayout = ({ children }) => {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)
  const { user } = useUser();
  const { signOut } = useClerk();

  // Get user role from Clerk publicMetadata
  const userRole = user?.publicMetadata?.role || "user";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    setMounted(true)
  }, [])

  const simulateNewEnrollment = () => {
    toast({
      title: "New Student Enrolled!",
      description: "Atharva from Maharashtra has enrolled for MBBS in Russia",
      duration: 5000,
    })
  }

  const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();
    
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="ml-auto"
      >
        <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:rotate-90 dark:scale-0" />
        <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  };
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50 dark:bg-gray-900">
        <Sidebar className="border-r border-gray-200 dark:border-gray-800">
          <SidebarHeader className="border-b px-6 py-4 bg-white dark:bg-gray-800">
            <h2 className="font-semibold text-xl">MBBS Admin</h2>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/" className="flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/call-reports" className="flex items-center">
                        <BarChart className="mr-2 h-4 w-4" />
                        <span>Call Reports</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        <div className="flex-1">
          <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
            <div className="flex items-center gap-2">
              <SidebarTrigger>
                <Menu className="h-4 w-4" />
              </SidebarTrigger>
              <div className="font-semibold">MBBS Consultation Dashboard</div>
            </div>
            <div className="flex items-center gap-2">
              {mounted && (
                <Button
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              )}
              {/* Show user role if available (uncomment to display) */}
              {/* {user && (
                <span className="text-xs text-muted-foreground mr-2">Role: {userRole}</span>
              )} */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <BellRing className="h-4 w-4" />
                    {/* Notification badge can be dynamically set here if needed */}
                    <span className="ml-2 hidden sm:inline">Notifications</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="space-y-4 py-4">
                    <h3 className="font-medium text-lg">Notifications</h3>
                    {/* Real notifications should be rendered here in the future */}
                    <div className="text-muted-foreground text-sm">No notifications yet.</div>
                  </div>
                </SheetContent>
              </Sheet>
              {/* User Profile Dropdown */}
              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative">
                      {user.imageUrl ? (
                        <img src={user.imageUrl} alt="avatar" className="rounded-full w-8 h-8 object-cover" />
                      ) : (
                        <span className="rounded-full w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground font-bold">
                          {user.firstName?.[0] || user.emailAddress?.[0] || 'U'}
                        </span>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-2 py-1.5 text-sm font-medium">
                      {user.fullName || user.emailAddress}
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => signOut()}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;