
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, PlusCircle } from "lucide-react";

const coursesData = [
  {
    id: "C001",
    name: "二年级语文 - 春天的识字课",
    subject: "语文",
    grade: "二年级",
    lessonPlans: 3,
    images: 12,
    files: 5,
    lastModified: "2025-06-14",
  },
  {
    id: "C002",
    name: "三年级数学 - 认识分数",
    subject: "数学",
    grade: "三年级",
    lessonPlans: 2,
    images: 8,
    files: 3,
    lastModified: "2025-06-12",
  },
  {
    id: "C003",
    name: "一年级美术 - 色彩的魔力",
    subject: "美术",
    grade: "一年级",
    lessonPlans: 5,
    images: 25,
    files: 2,
    lastModified: "2025-06-10",
  },
  {
    id: "C004",
    name: "四年级英语 - My Family",
    subject: "英语",
    grade: "四年级",
    lessonPlans: 1,
    images: 10,
    files: 4,
    lastModified: "2025-06-09",
  },
  {
    id: "C005",
    name: "二年级语文 - 夏天的故事",
    subject: "语文",
    grade: "二年级",
    lessonPlans: 4,
    images: 15,
    files: 6,
    lastModified: "2025-06-15",
  },
];

const CourseDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");

  const subjects = [...new Set(coursesData.map((c) => c.subject))];
  const grades = [...new Set(coursesData.map((c) => c.grade))].sort();

  const filteredCourses = coursesData.filter((course) => {
    const matchesSearch = course.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesSubject =
      selectedSubject === "all" || course.subject === selectedSubject;
    const matchesGrade =
      selectedGrade === "all" || course.grade === selectedGrade;
    return matchesSearch && matchesSubject && matchesGrade;
  });

  return (
    <div className="p-6 md:p-8 h-full flex flex-col bg-background">
      <header className="flex items-center justify-between mb-6 flex-shrink-0">
        <h1 className="text-26 font-medium">课程看板</h1>
        <div className="flex items-center gap-3">
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择科目" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有科目</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedGrade} onValueChange={setSelectedGrade}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="选择年级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有年级</SelectItem>
              {grades.map((grade) => (
                <SelectItem key={grade} value={grade}>
                  {grade}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索我的电子资产..."
              className="pl-9 w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
              {filteredCourses.map((course) => (
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
