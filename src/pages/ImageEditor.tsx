
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Upload, Wand2, Loader2, Image as ImageIcon, Download } from "lucide-react";

const ImageEditor = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [modifiedImage, setModifiedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setModifiedImage(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalImage) return;
    setIsLoading(true);
    setModifiedImage(null);
    // Simulate AI image modification
    setTimeout(() => {
      // For now, we'll just use a placeholder image for the modified result
      setModifiedImage("https://images.unsplash.com/photo-1472396961693-142e6e269027?q=80&w=800");
      setIsLoading(false);
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold font-display text-gray-800 mb-2">智能插图修改</h1>
      <p className="text-lg text-muted-foreground mb-8">上传一张图片，描述您的想法，AI 将为您创作新的插图。</p>

      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left side: Controls */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="image-upload" className="mb-2 block">1. 上传插图</Label>
                <div className="flex items-center justify-center w-full">
                  <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-gray-100">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
                      <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">点击上传</span> 或拖拽文件</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG, or GIF</p>
                    </div>
                    <Input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modification-prompt">2. 描述您的修改想法</Label>
                <Textarea id="modification-prompt" placeholder="例如：把背景换成有长城的中国北方风光，再加一只熊猫。" rows={4} />
              </div>

              <Button type="submit" className="w-full" disabled={!originalImage || isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    创作中...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    开始智能创作
                  </>
                )}
              </Button>
            </form>

            {/* Right side: Image previews */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">原图</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {originalImage ? <img src={originalImage} alt="Original" className="object-contain max-h-full max-w-full" /> : <ImageIcon className="h-12 w-12 text-gray-400" />}
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold">修改后</h3>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  {isLoading && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                  {!isLoading && modifiedImage && <img src={modifiedImage} alt="Modified" className="object-contain max-h-full max-w-full" />}
                  {!isLoading && !modifiedImage && <p className="text-muted-foreground text-sm">这里将显示修改后的图片</p>}
                </div>
                {modifiedImage && !isLoading && (
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    下载图片
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageEditor;
