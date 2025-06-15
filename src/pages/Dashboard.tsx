
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Book, Image as ImageIcon, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display text-gray-800">欢迎回来，老师！</h1>
        <p className="text-xl text-muted-foreground mt-2">准备好开启高效、智能的教学新篇章了吗？</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Book className="mr-3 h-7 w-7 text-primary" />
              教案生成器
            </CardTitle>
            <CardDescription className="pt-2">输入关键词，AI 就能为您量身定制个性化的教案，节省您宝贵的备课时间。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/lesson-planner">
                开始创作教案 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <ImageIcon className="mr-3 h-7 w-7 text-accent" />
              智能插图修改
            </CardTitle>
            <CardDescription className="pt-2">轻松修改课本插图的背景和细节，创作出更贴合教学情境的图片资源。</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/image-editor">
                编辑插图 <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
