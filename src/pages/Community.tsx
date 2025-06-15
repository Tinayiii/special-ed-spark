
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Heart, Share2 } from "lucide-react";

const communityResources = [
  {
    id: 1,
    title: "小学数学趣味教案",
    author: "王老师",
    description: "一套包含互动游戏和趣味练习的小学二年级数学教案。",
    likes: 128,
    downloads: 54,
    tags: ["数学", "小学", "游戏化教学"],
    imageUrl: "/placeholder.svg"
  },
  {
    id: 2,
    title: "春天主题美术课素材",
    author: "李老师",
    description: "包含春季花卉、动物的高清图片素材，可用于美术课堂创作。",
    likes: 256,
    downloads: 112,
    tags: ["美术", "素材", "春天"],
    imageUrl: "/placeholder.svg"
  },
  {
    id: 3,
    title: "互动式语文识字卡片",
    author: "张老师",
    description: "专为一年级学生设计的互动识字卡片，支持在线点击发音。",
    likes: 301,
    downloads: 150,
    tags: ["语文", "识字", "互动"],
    imageUrl: "/placeholder.svg"
  },
    {
    id: 4,
    title: "科学小实验：火山爆发",
    author: "赵老师",
    description: "一个安全、有趣的家庭科学实验，模拟火山爆发的过程。",
    likes: 189,
    downloads: 98,
    tags: ["科学", "实验", "中学"],
    imageUrl: "/placeholder.svg"
  },
  {
    id: 5,
    title: "英语启蒙歌曲集",
    author: "陈老师",
    description: "一组适合幼儿英语启蒙的原创歌曲，配有动画MV。",
    likes: 450,
    downloads: 230,
    tags: ["英语", "幼儿", "歌曲"],
    imageUrl: "/placeholder.svg"
  },
  {
    id: 6,
    title: "编程入门：Scratch创意项目",
    author: "周老师",
    description: "带领孩子们用Scratch创建第一个动画故事，培养逻辑思维。",
    likes: 210,
    downloads: 105,
    tags: ["编程", "Scratch", "创意"],
    imageUrl: "/placeholder.svg"
  }
];

const Community = () => {
  return (
    <div className="flex-1 p-8 overflow-auto bg-background">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">社区资源共享</h1>
        <p className="text-muted-foreground mt-2">发现、分享和使用来自特教同行的优秀教学资源。</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communityResources.map((resource) => (
          <Card key={resource.id} className="flex flex-col transition-transform transform hover:-translate-y-1 hover:shadow-lg">
            <CardHeader className="p-0">
              <img src={resource.imageUrl} alt={resource.title} className="rounded-t-lg aspect-video object-cover" />
            </CardHeader>
            <CardContent className="flex-grow p-4">
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription className="text-sm mt-1">由 {resource.author} 分享</CardDescription>
              <p className="text-sm text-muted-foreground mt-2">{resource.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {resource.tags.map(tag => (
                  <span key={tag} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{tag}</span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4" />
                  <span>{resource.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>{resource.downloads}</span>
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Community;
