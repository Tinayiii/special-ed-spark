
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const Settings = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-34 font-medium leading-1.3 text-gray-800">设置</h1>
        <p className="text-xl text-muted-foreground mt-2">在这里管理您的教学偏好，这些信息将被用于生成更个性化的内容。</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>个人教学信息</CardTitle>
          <CardDescription>这些信息将会被AI优先参考，以提供更精准的辅助。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="teaching-object">教学对象</Label>
              <Input id="teaching-object" placeholder="例如：小学二年级，有学习障碍的学生" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textbook-version">教材版本</Label>
              <Input id="textbook-version" placeholder="例如：人教版、苏教版" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">授课科目</Label>
              <Input id="subject" placeholder="例如：语文、数学" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-term-goal">长期教学目标</Label>
              <Textarea id="long-term-goal" placeholder="描述该科目的长期教学目标..." className="min-h-[100px]" />
            </div>
            <div className="flex justify-end">
              <Button type="submit">保存设置</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
