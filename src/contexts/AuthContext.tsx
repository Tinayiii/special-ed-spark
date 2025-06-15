
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    isLoading: boolean;
    openAuthDialog: () => void;
    isAuthDialogOpen: boolean;
    setIsAuthDialogOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        };

        fetchSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (_event === 'SIGNED_IN' && session?.user) {
                setTimeout(() => {
                    handleUserProfile(session.user);
                }, 0);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const handleUserProfile = async (user: User) => {
        const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

        if (!data && user.email) {
            await supabase.from('profiles').insert({
                id: user.id,
                email: user.email,
            });
        }
    };

    const value = {
        user,
        session,
        isLoading: loading,
        openAuthDialog: () => setIsAuthDialogOpen(true),
        isAuthDialogOpen,
        setIsAuthDialogOpen,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
