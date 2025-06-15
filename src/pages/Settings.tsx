
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

const Settings = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [teachingObject, setTeachingObject] = useState('');
  const [textbookVersion, setTextbookVersion] = useState('');
  const [subject, setSubject] = useState('');
  const [longTermGoal, setLongTermGoal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setAvatarUrl(profile.avatar_url || null);
      setTeachingObject(profile.teaching_object || '');
      setTextbookVersion(profile.textbook_edition || '');
      setSubject(profile.subject || '');
      setLongTermGoal(profile.long_term_goal || '');
    }
  }, [profile]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    let uploadedAvatarUrl = profile?.avatar_url;

    if (avatarFile) {
      setIsUploading(true);
      const filePath = `${user.id}/${Date.now()}_${avatarFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        toast.error('头像上传失败: ' + uploadError.message);
        setIsSaving(false);
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      uploadedAvatarUrl = publicUrlData.publicUrl;
      setIsUploading(false);
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        avatar_url: uploadedAvatarUrl,
        teaching_object: teachingObject,
        textbook_edition: textbookVersion,
        subject: subject,
        long_term_goal: longTermGoal,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    setIsSaving(false);
    if (error) {
      toast.error('保存失败: ' + error.message);
    } else {
      toast.success('设置已保存！');
      refreshProfile();
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-34 font-medium leading-1.3 text-gray-800">设置</h1>
        <p className="text-xl text-muted-foreground mt-2">在这里管理你的教学偏好，这些信息将被用于生成更个性化的内容。</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>个人教学信息</CardTitle>
          <CardDescription>这些信息将会被AI优先参考，以提供更精准的辅助。</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSave}>
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                  <AvatarImage src={avatarUrl || undefined} alt="Avatar" />
                  <AvatarFallback>
                      <User className="h-10 w-10" />
                  </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                  <Label htmlFor="avatar-upload">用户头像</Label>
                  <Input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarChange} disabled={isSaving || isUploading}/>
                  <p className="text-xs text-muted-foreground">上传新头像，推荐 200x200 像素。</p>
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="full-name">昵称</Label>
                <Input id="full-name" placeholder="你的昵称" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="teaching-object">教学对象</Label>
              <Input id="teaching-object" placeholder="例如：小学二年级，有学习障碍的学生" value={teachingObject} onChange={(e) => setTeachingObject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="textbook-version">教材版本</Label>
              <Input id="textbook-version" placeholder="例如：人教版、苏教版" value={textbookVersion} onChange={(e) => setTextbookVersion(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">授课科目</Label>
              <Input id="subject" placeholder="例如：语文、数学" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="long-term-goal">长期教学目标</Label>
              <Textarea id="long-term-goal" placeholder="描述该科目的长期教学目标..." className="min-h-[100px]" value={longTermGoal} onChange={(e) => setLongTermGoal(e.target.value)} />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isUploading}>
                {isSaving ? '保存中...' : (isUploading ? '上传中...' : '保存设置')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
