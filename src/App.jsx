import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { SignedIn, SignedOut, RedirectToSignIn, SignUp, useUser } from '@clerk/clerk-react';
import { SignIn } from '@clerk/clerk-react';
import { useEffect, useState } from 'react';
import Profile from './pages/Profile';

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
                    <Index />
                  </SignedIn>
                  <SignedOut>
                    <RedirectToSignIn />
                  </SignedOut>
                </>
              }
            />
            <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
            <Route
              path="/profile"
              element={
                <SignedIn>
                  <Profile />
                </SignedIn>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
