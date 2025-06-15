
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Wand2, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import LessonPlanDialog from "@/components/LessonPlanDialog";

const LessonPlanner = () => {
  const { user, profile, openAuthDialog } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [formData, setFormData] = useState({
    topic: "",
    grade: "",
    objective: "",
    additionalRequirements: ""
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      openAuthDialog();
      return;
    }

    if (!formData.topic || !formData.grade || !formData.objective) {
      toast.error("请填写完整的教学信息");
      return;
    }

    setIsLoading(true);
    setGeneratedPlan("");
    
    const subject = profile?.subject || '通用';
    const textbook_edition = profile?.textbook_edition || '通用版本';
    const teaching_object = profile?.teaching_object || '学生';
    const long_term_goal = profile?.long_term_goal || '提升学科素养';

    try {
      const { data: functionData, error: functionError } = await supabase.functions.invoke('generate-lesson-plan', {
        body: {
          topic: formData.topic,
          grade: formData.grade,
          objective: formData.objective,
          subject,
          textbook_edition,
          teaching_object,
          long_term_goal
        },
      });

      if (functionError) throw functionError;

      const { lessonPlan } = functionData;
      
      // Save to database
      const { data: resourceData, error: resourceError } = await supabase
        .from('teaching_resources')
        .insert({
          user_id: user.id,
          title: `《${formData.topic}》教案设计`,
          content: lessonPlan,
          resource_type: 'lesson_plan',
          metadata: {
            ...formData,
            subject,
            textbook_edition,
            teaching_object,
            long_term_goal
          } as any,
        })
        .select()
        .single();

      if (resourceError) throw resourceError;

      setGeneratedPlan(lessonPlan);
      toast.success("专业教案生成成功！");
      
    } catch (error: any) {
      console.error('Error generating lesson plan:', error);
      toast.error(`生成教案失败：${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold font-display text-gray-800">专业教案生成器</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          基于专业教育理论，为您生成结构完整、逻辑清晰的11部分标准教案
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>教学信息填写</CardTitle>
            <CardDescription>
              请完整填写教学信息，系统将根据教育学原理为您生成专业教案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">课程主题/课题名称 *</Label>
                <Input 
                  id="topic" 
                  placeholder="例如：《小蝌蚪找妈妈》" 
                  value={formData.topic}
                  onChange={(e) => handleInputChange('topic', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade">年级/学段 *</Label>
                <Input 
                  id="grade" 
                  placeholder="例如：小学二年级" 
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="objective">本次课教学目标 *</Label>
                <Textarea 
                  id="objective" 
                  placeholder="例如：能够理解课文内容，掌握生字词，培养阅读理解能力..."
                  value={formData.objective}
                  onChange={(e) => handleInputChange('objective', e.target.value)}
                  className="min-h-[100px]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">特殊要求 (选填)</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="例如：希望增加互动游戏环节，注重实践操作，考虑学生认知特点..."
                  value={formData.additionalRequirements}
                  onChange={(e) => handleInputChange('additionalRequirements', e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    正在生成专业教案...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    生成专业教案
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>教案预览</CardTitle>
            <CardDescription>
              生成的专业教案将在此显示，包含完整的11个标准部分
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">正在按照专业教学设计理论生成教案...</p>
              </div>
            )}
            
            {generatedPlan && (
              <div className="space-y-4">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans text-sm max-h-96 overflow-y-auto">
                    {generatedPlan.substring(0, 800)}
                    {generatedPlan.length > 800 && "..."}
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPlanDialog(true)}
                  className="w-full"
                  variant="outline"
                >
                  查看完整教案
                </Button>
              </div>
            )}
            
            {!isLoading && !generatedPlan && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-4">
                <BookOpen className="h-12 w-12" />
                <div className="text-center">
                  <p className="font-medium">专业教案结构预览</p>
                  <p className="text-sm mt-2">
                    生成的教案将包含：学习内容分析、学情分析、教学目标、教学重难点、教学策略、教学环境准备、教学过程、板书设计、作业布置、教学评价、教学反思
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <LessonPlanDialog
        open={showPlanDialog}
        onOpenChange={setShowPlanDialog}
        planContent={generatedPlan}
      />
    </div>
  );
};

export default LessonPlanner;
