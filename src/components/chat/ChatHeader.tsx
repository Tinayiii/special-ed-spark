
import { AuthButton } from '@/components/auth/AuthButton';

export const ChatHeader = () => {
    return (
        <header className="flex items-center justify-between p-4 border-b bg-card z-10">
            <h2 className="text-xl font-bold tracking-tight text-gray-800">特教之光 AI 助手</h2>
            <AuthButton />
        </header>
    );
};
