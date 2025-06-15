
import { Tables } from "@/integrations/supabase/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";
import { getResourceIcon, getResourceTypeLabel } from "@/lib/resourceUtils";
import { useNavigate } from "react-router-dom";

interface RecentTasksProps {
  tasks: Tables<'teaching_resources'>[];
}

const RecentTasks = ({ tasks }: RecentTasksProps) => {
  const navigate = useNavigate();

  if (tasks.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-lg font-medium mb-3 flex items-center">
        <Clock className="mr-2 h-5 w-5" />
        最近的任务
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tasks.map((task) => (
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
  );
};

export default RecentTasks;
