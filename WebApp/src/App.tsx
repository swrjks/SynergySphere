import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider } from "@/hooks/useTasks";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import Messages from "./pages/Messages";
import Activity from "./pages/Activity";
import Calendar from "./pages/Calendar";
import Options from "./pages/Options";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TaskProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/project/:projectId" element={<ProjectWorkspace />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/options" element={<Options />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TaskProvider>
  </QueryClientProvider>
);

export default App;
