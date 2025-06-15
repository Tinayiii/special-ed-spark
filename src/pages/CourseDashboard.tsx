
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MessageSquare, BookOpen, Image as ImageIcon, FileText, Clock, Sparkles, ArrowRight, Send } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

const CourseDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Tables<'teaching_resources'>[]>([]);
  const [recentTasks, setRecentTasks] = useState<Tables<'teaching_resources'>[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [promptInput, setPromptInput] = useState("");

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchRecentTasks();
    }
  }, [user]);

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

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'lesson_plan':
        return <BookOpen className="h-5 w-5" />;
      case 'ppt_outline':
        return <FileText className="h-5 w-5" />;
      case 'image_group':
        return <ImageIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'lesson_plan':
        return '教案';
      case 'ppt_outline':
        return 'PPT大纲';
      case 'image_group':
        return '图片';
      default:
        return '资源';
    }
  };

  return (
    <div className="p-6 md:p-8 h-full bg-background">
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-26 font-medium mb-2">课程看板</h1>
            <p className="text-muted-foreground">管理您的教学资源和开始新的任务</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                开始新任务
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  开始新的教学任务
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    请描述您想要创建的教学内容：
                  </label>
                  <Textarea
                    placeholder="例如：帮我创建一个关于春天的语文教案，适合二年级学生..."
                    value={promptInput}
                    onChange={(e) => setPromptInput(e.target.value)}
                    rows={4}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={handleStartConversation} disabled={!promptInput.trim()}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    开始对话
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 最近任务快速跳转 */}
        {recentTasks.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-medium mb-3 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              最近的任务
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentTasks.map((task) => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getResourceIcon(task.resource_type)}
                        <Badge variant="secondary" className="text-xs">
                          {getResourceTypeLabel(task.resource_type)}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-sm line-clamp-2">{task.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full" 
                      onClick={() => navigate('/chat', { state: { resumeTask: task.id } })}
                    >
                      继续任务
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </header>

      {courses.length === 0 ? (
        // 空状态 - 引导用户开始
        <div className="flex flex-col items-center justify-center text-center py-16">
          <Sparkles className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">欢迎来到特教之光</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            您还没有创建任何教学资源。让我来帮您开始第一个教学任务吧！
          </p>
          
          {/* New Conversation Input */}
          <div className="w-full max-w-xl mx-auto mb-12">
             <div className="relative">
                <Textarea
                  placeholder="可以直接向我提问，例如：帮我创建一个关于春天的语文教案..."
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  rows={3}
                  className="pr-24 text-base"
                />
                <Button 
                  onClick={handleStartConversation} 
                  disabled={!promptInput.trim()}
                  className="absolute bottom-2.5 right-2.5"
                  size="sm"
                >
                  <Send className="h-4 w-4 mr-2"/>
                  开始
                </Button>
             </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 max-w-4xl w-full">
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">1</div>
              <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={() => setIsDialogOpen(true)}>
                <CardHeader className="text-center p-4">
                  <BookOpen className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-base">创建教案</CardTitle>
                  <CardDescription className="text-xs">为您的课程设计专业教案</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-8 h-8 text-muted-foreground mx-4 my-2 md:my-0 rotate-90 md:rotate-0" />
            
            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">2</div>
              <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={() => setIsDialogOpen(true)}>
                <CardHeader className="text-center p-4">
                  <FileText className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-base">PPT大纲</CardTitle>
                  <CardDescription className="text-xs">生成课件演示大纲</CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Arrow */}
            <ArrowRight className="w-8 h-8 text-muted-foreground mx-4 my-2 md:my-0 rotate-90 md:rotate-0" />
            
            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-8 h-8 mb-2 rounded-full bg-primary text-primary-foreground font-bold text-sm">3</div>
              <Card className="hover:shadow-md transition-shadow cursor-pointer w-56" onClick={() => setIsDialogOpen(true)}>
                <CardHeader className="text-center p-4">
                  <ImageIcon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <CardTitle className="text-base">生成插图</CardTitle>
                  <CardDescription className="text-xs">为教学内容创建配图</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </div>
      ) : (
        // 有内容时的卡片展示
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">我的教学资源</h2>
            <p className="text-sm text-muted-foreground">共 {courses.length} 个资源</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(course.resource_type)}
                      <Badge variant="secondary">
                        {getResourceTypeLabel(course.resource_type)}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                  <CardDescription className="text-xs">
                    创建于 {new Date(course.created_at).toLocaleDateString('zh-CN')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      查看详情
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate('/chat', { state: { resumeTask: course.id } })}
                    >
                      继续编辑
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDashboard;
