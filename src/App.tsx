
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CourseDashboard from "./pages/CourseDashboard";
import CourseDetails from "./pages/CourseDetails";
import LessonPlanner from "./pages/LessonPlanner";
import ImageEditor from "./pages/ImageEditor";
import Settings from "./pages/Settings";
import Chat from "./pages/Chat";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Chat />} />
            <Route path="/course-dashboard" element={<CourseDashboard />} />
            <Route path="/course/:courseId" element={<CourseDetails />} />
            <Route path="/lesson-planner" element={<LessonPlanner />} />
            <Route path="/image-editor" element={<ImageEditor />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
