
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RecentTasks from "@/components/dashboard/RecentTasks";
import EmptyState from "@/components/dashboard/EmptyState";
import CourseList from "@/components/dashboard/CourseList";
import ScrollToTopButton from "@/components/dashboard/ScrollToTopButton";

const CourseDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Tables<'teaching_resources'>[]>([]);
  const [recentTasks, setRecentTasks] = useState<Tables<'teaching_resources'>[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const resourcesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchRecentTasks();
    }
  }, [user]);

  useEffect(() => {
    // For users with courses, auto-scroll to their resources.
    if (courses.length > 0) {
      setTimeout(() => {
        resourcesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [courses]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('teaching_resources')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('teaching_resources')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setRecentTasks(data || []);
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  const handleStartConversation = () => {
    if (promptInput.trim()) {
      setIsDialogOpen(false);
      navigate('/chat', { state: { initialPrompt: promptInput } });
      setPromptInput("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <div className="p-6 md:p-8 h-full bg-background relative">
      <header className="mb-8">
        <DashboardHeader
          isDialogOpen={isDialogOpen}
          setIsDialogOpen={setIsDialogOpen}
          promptInput={promptInput}
          setPromptInput={setPromptInput}
          handleStartConversation={handleStartConversation}
        />
        <RecentTasks tasks={recentTasks} />
      </header>

      {courses.length === 0 ? (
        <EmptyState
          promptInput={promptInput}
          setPromptInput={setPromptInput}
          handleStartConversation={handleStartConversation}
          onOpenDialog={() => setIsDialogOpen(true)}
        />
      ) : (
        <div ref={resourcesRef}>
          <CourseList courses={courses} />
        </div>
      )}

      <ScrollToTopButton isVisible={showScrollTop && courses.length > 0} onClick={scrollToTop} />
    </div>
  );
};

export default CourseDashboard;
