import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import StudentsPage from "./pages/StudentsPage";
import NotFound from "./pages/NotFound";
import { SignedIn, SignedOut, SignIn, useUser } from "@clerk/clerk-react";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/ui/DashboardLayout";
import { AdminCallReport } from './components/AdminCallReport';

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <SignedIn>
                    <StudentsPage />
                  </SignedIn>
                  <SignedOut>
                    <Navigate to="/sign-in" replace />
                  </SignedOut>
                </>
              }
            />
            <Route
              path="/sign-in/*"
              element={
                <div className="flex min-h-screen items-center justify-center">
                  <SignIn
                    routing="path"
                    path="/sign-in"
                    signUpUrl={null}
                    afterSignInUrl="/"
                    appearance={{
                      elements: {
                        footerAction: { display: "none" },
                        card: {
                          boxShadow: "none"
                        }
                      },
                    }}
                  />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <SignedIn>
                  <Profile />
                </SignedIn>
              }
            />
            <Route path="/call-reports" element={<DashboardLayout><AdminCallReport /></DashboardLayout>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
