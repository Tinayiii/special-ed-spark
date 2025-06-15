
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, PlusCircle } from "lucide-react";

const courses = [
  {
    id: 'C001',
    name: '二年级语文 - 春天的识字课',
    lessonPlans: 3,
    images: 12,
    files: 5,
    lastModified: '2025-06-14',
  },
  {
    id: 'C002',
    name: '三年级数学 - 认识分数',
    lessonPlans: 2,
    images: 8,
    files: 3,
    lastModified: '2025-06-12',
  },
  {
    id: 'C003',
    name: '一年级美术 - 色彩的魔力',
    lessonPlans: 5,
    images: 25,
    files: 2,
    lastModified: '2025-06-10',
  },
  {
    id: 'C004',
    name: '四年级英语 - My Family',
    lessonPlans: 1,
    images: 10,
    files: 4,
    lastModified: '2025-06-09',
  },
];

const CourseDashboard = () => {
  return (
    <div className="p-6 md:p-8 h-full flex flex-col bg-background">
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-26 font-medium">课程看板</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="搜索我的电子资产..." className="pl-9 w-64" />
          </div>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            新建课程单元
          </Button>
        </div>
      </header>
      
      <div className="border rounded-lg overflow-hidden flex-grow">
          <div className="relative w-full overflow-auto h-full">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-[40%]">课程单元</TableHead>
                    <TableHead>教案</TableHead>
                    <TableHead>图片</TableHead>
                    <TableHead>文件</TableHead>
                    <TableHead>最后修改</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.lessonPlans} 份</TableCell>
                      <TableCell>{course.images} 张</TableCell>
                      <TableCell>{course.files} 个</TableCell>
                      <TableCell>{course.lastModified}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          进入
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
          </div>
      </div>
    </div>
  );
};

export default CourseDashboard;
