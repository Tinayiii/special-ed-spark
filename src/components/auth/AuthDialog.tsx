
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

export const AuthDialog = () => {
    const { isAuthDialogOpen, setIsAuthDialogOpen } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    const handleAuthAction = async (action: 'sign_in' | 'sign_up') => {
        setLoading(true);
        setError(null);
        setMessage(null);

        const methods = {
            sign_in: () => supabase.auth.signInWithPassword({ email, password }),
            sign_up: () => supabase.auth.signUp({ 
                email, 
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/chat`
                }
            }),
        };

        const { error: authError } = await methods[action]();

        if (authError) {
            setError(authError.message);
        } else {
            if (action === 'sign_up') {
                setMessage('注册成功！请检查您的邮箱以验证您的账户。');
            } else {
                setIsAuthDialogOpen(false);
            }
        }
        setLoading(false);
    };

    return (
        <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>登录</DialogTitle>
                    <DialogDescription>
                        登录以继续。
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); handleAuthAction('sign_in'); }}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email-signin">邮箱</Label>
                            <Input id="email-signin" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password-signin">密码</Label>
                            <Input id="password-signin" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full mt-2">{loading ? '处理中...' : '登录'}</Button>
                    </div>
                </form>
                {error && (
                    <Alert variant="destructive">
                        <Terminal className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                {message && (
                    <Alert>
                        <Terminal className="h-4 w-4" />
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}
            </DialogContent>
        </Dialog>
    );
};
