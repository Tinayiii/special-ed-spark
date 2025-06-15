
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getResourceIcon, getResourceTypeLabel } from "@/lib/resourceUtils";
import { useNavigate } from "react-router-dom";

interface CourseListProps {
  courses: Tables<'teaching_resources'>[];
}

const CourseList = ({ courses }: CourseListProps) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default CourseList;
