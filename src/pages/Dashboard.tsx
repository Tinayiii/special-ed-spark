
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

// Mock data for courses
const mockCourses = [
  { id: 1, title: '《春天的识字课》', date: '2025-06-10', assets: { plans: 1, images: 5, files: 2 } },
  { id: 2, title: '《加减法入门》', date: '2025-06-08', assets: { plans: 1, images: 3, files: 1 } },
  { id: 3, title: '《认识图形》', date: '2025-05-25', assets: { plans: 2, images: 8, files: 4 } },
  { id: 4, title: '《古诗两首》', date: '2025-05-12', assets: { plans: 1, images: 4, files: 1 } },
];

const Dashboard = () => {
  return (
    <div className="p-6 md:p-8 h-full">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-8">
        <h1 className="text-34 font-medium leading-1.3 text-gray-800">我的看板</h1>
        <div className="flex items-center gap-4">
          <div className="relative flex-grow md:flex-grow-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索课程或素材..."
              className="w-full md:w-64 lg:w-80 pl-10"
            />
          </div>
          <Button asChild>
            <Link to="/lesson-planner">+ 新建课程</Link>
          </Button>
        </div>
      </header>
      
      <main>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockCourses.map((course) => (
            <Card key={course.id} className="flex flex-col hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="truncate">{course.title}</CardTitle>
                <CardDescription>创建于 {course.date}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-2">
                 <p className="text-sm text-muted-foreground">教案: {course.assets.plans}</p>
                 <p className="text-sm text-muted-foreground">图片素材: {course.assets.images}</p>
                 <p className="text-sm text-muted-foreground">教学文件: {course.assets.files}</p>
              </CardContent>
              <CardFooter>
                <Button variant="secondary" className="w-full">
                  打开课程
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
