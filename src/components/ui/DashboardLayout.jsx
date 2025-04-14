import { BellRing, LayoutDashboard, Menu, Moon, Phone, Sun, Users } from "lucide-react"

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

const DashboardLayout = ({ children }) => {
  const { theme, setTheme } = useTheme()
  const { toast } = useToast()
  const [mounted, setMounted] = useState(false)

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
                      <a href="/students" className="flex items-center">
                        <Users className="mr-2 h-4 w-4" />
                        <span>Students</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/calls" className="flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        <span>Call Tracking</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <a href="/notifications" className="flex items-center">
                        <BellRing className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
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
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="relative">
                    <BellRing className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">3</span>
                    <span className="ml-2 hidden sm:inline">Notifications</span>
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <div className="space-y-4 py-4">
                    <h3 className="font-medium text-lg">Notifications</h3>
                    <div className="border rounded-md p-3 bg-muted/50">
                      <h4 className="font-medium">New Student Enrolled</h4>
                      <p className="text-sm text-muted-foreground">Atharva from Maharashtra has enrolled for MBBS in Russia</p>
                      <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/50">
                      <h4 className="font-medium">Missed Call</h4>
                      <p className="text-sm text-muted-foreground">Missed call from Rahul - 9876543210</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                    <div className="border rounded-md p-3 bg-muted/50">
                      <h4 className="font-medium">Call Scheduled</h4>
                      <p className="text-sm text-muted-foreground">Follow-up call with Priya scheduled for tomorrow</p>
                      <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                    </div>
                    <Button className="w-full" variant="outline" onClick={simulateNewEnrollment}>
                      Simulate New Enrollment
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default DashboardLayout