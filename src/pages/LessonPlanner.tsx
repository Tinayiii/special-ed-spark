
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Loader2, Wand2 } from "lucide-react";

const LessonPlanner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setGeneratedPlan("");
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedPlan(`### 教学目标：
1. 知识与技能：认识并能正确、流利、有感情地朗读课文。
2. 过程与方法：通过小组合作、自主探究的方式，理解课文内容。
3. 情感态度与价值观：感受课文所表达的美好情感，激发学生热爱大自然的情感。

### 教学重难点：
重点：有感情地朗读课文。
难点：理解课文中蕴含的深刻道理。

### 教学过程：
一、导入新课（5分钟）
二、初读课文，整体感知（10分钟）
三、深入研读，合作探究（20分钟）
四、拓展延伸，布置作业（5分钟）`);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold font-display text-gray-800 mb-2">教案生成器</h1>
      <p className="text-lg text-muted-foreground mb-8">只需几步，即可获得一份为您量身打造的教案。</p>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>教学需求</CardTitle>
            <CardDescription>请填写以下信息，AI将为您生成教案。</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">学科</Label>
                <Input id="subject" placeholder="例如：语文" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">年级</Label>
                <Input id="grade" placeholder="例如：小学二年级" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="topic">课文/主题</Label>
                <Input id="topic" placeholder="例如：《小蝌蚪找妈妈》" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requirements">其他要求 (选填)</Label>
                <Textarea id="requirements" placeholder="例如：希望增加一些互动游戏环节" />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    智能生成教案
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>生成的教案</CardTitle>
            <CardDescription>AI为您生成的教学计划将显示在此处。</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
            {generatedPlan && (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans">{generatedPlan}</pre>
              </div>
            )}
            {!isLoading && !generatedPlan && (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <p>请在左侧填写信息以生成教案。</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LessonPlanner;
