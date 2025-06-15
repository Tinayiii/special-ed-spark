
import { useParams, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, FileText, Download, Image as ImageIcon, BookOpen, FileArchive } from "lucide-react";

// Mock data, in a real application this would come from an API or shared state.
const coursesData = [
  {
    id: "C001",
    name: "春天的识字课",
    subject: "语文",
    grade: "二年级",
    lessonPlans: 3,
    images: 12,
    files: 5,
    lastModified: "2025-06-14",
  },
  {
    id: "C002",
    name: "认识分数",
    subject: "数学",
    grade: "三年级",
    lessonPlans: 2,
    images: 8,
    files: 3,
    lastModified: "2025-06-12",
  },
  {
    id: "C003",
    name: "色彩的魔力",
    subject: "美术",
    grade: "一年级",
    lessonPlans: 5,
    images: 25,
    files: 2,
    lastModified: "2025-06-10",
  },
  {
    id: "C004",
    name: "My Family",
    subject: "英语",
    grade: "四年级",
    lessonPlans: 1,
    images: 10,
    files: 4,
    lastModified: "2025-06-09",
  },
  {
    id: "C005",
    name: "夏天的故事",
    subject: "语文",
    grade: "二年级",
    lessonPlans: 4,
    images: 15,
    files: 6,
    lastModified: "2025-06-15",
  },
];

const courseDetailsData: { [key: string]: any } = {
  "C001": {
    outline: `### 教学目标：\n1. 认识10个生字，会写“春、天、花、草”4个字。\n2. 正确、流利地朗读课文，背诵课文。\n3. 感受春天的美丽，热爱大自然。\n\n### 教学过程：\n- **一、情境导入**\n- **二、识字与写字**\n- **三、朗读感悟**\n- **四、拓展延伸**`,
    images: [
      "https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1458501537114-58c2c7b914a5?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1522204523234-8729aa6e3d54?q=80&w=800&auto=format&fit=crop",
    ],
    files: [
      { name: "《春天的识字课》教学PPT.pptx", icon: FileArchive },
      { name: "春天相关古诗词.docx", icon: FileText },
      { name: "课堂练习题.pdf", icon: FileText },
    ],
    nextStep: {
      title: "下一步：生成图片素材",
      description: "根据教案大纲，为“春天的识字课”生成匹配的教学图片。",
      buttonText: "开始生成图片",
      link: "/image-editor",
    }
  },
};

const CourseDetails = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const course = coursesData.find(c => c.id === courseId);
    // Use details for C001 as a fallback for demo purposes
    const details = courseId ? courseDetailsData[courseId] || courseDetailsData["C001"] : courseDetailsData["C001"];

    if (!course) {
        return <div className="p-8 text-center">课程未找到</div>;
    }

    return (
        <div className="p-6 md:p-8 h-full bg-background">
            <header className="mb-8">
                <p className="text-muted-foreground">{course.grade} / {course.subject}</p>
                <h1 className="text-4xl font-bold font-display">{course.name}</h1>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="flex items-center gap-3">
                                <BookOpen className="h-6 w-6 text-primary" />
                                <CardTitle>教案大纲</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                <pre className="whitespace-pre-wrap bg-muted p-4 rounded-lg font-sans">{details.outline}</pre>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                             <div className="flex items-center gap-3">
                                <ImageIcon className="h-6 w-6 text-primary" />
                                <CardTitle>教案图片</CardTitle>
                            </div>
                            <Button variant="outline" size="sm">上传图片</Button>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {details.images.map((src: string, index: number) => (
                                    <div key={index} className="aspect-video bg-muted rounded-lg overflow-hidden group relative">
                                        <img src={src} alt={`教案图片 ${index + 1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>文件</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {details.files.map((file: any, index: number) => (
                                    <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <file.icon className="h-5 w-5 text-muted-foreground" />
                                            <span className="text-sm font-medium">{file.name}</span>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>
                    <Card className="bg-secondary/50 border-secondary">
                        <CardHeader>
                            <CardTitle>Next Step</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-secondary-foreground/80 mb-4">{details.nextStep.description}</p>
                            <Button className="w-full" asChild>
                                <Link to={details.nextStep.link}>
                                    {details.nextStep.buttonText}
                                    <ArrowRight className="ml-2" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default CourseDetails;
