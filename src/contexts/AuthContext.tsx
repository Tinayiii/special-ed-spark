import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: (Tables<'profiles'> & { full_name?: string; avatar_url?: string; }) | null;
    isLoading: boolean;
    openAuthDialog: () => void;
    isAuthDialogOpen: boolean;
    setIsAuthDialogOpen: (isOpen: boolean) => void;
    refreshProfile: () => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<(Tables<'profiles'> & { full_name?: string; avatar_url?: string; }) | null>(null);
    const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleUserProfile = async (user: User) => {
        const { data } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();

        if (!data && user.email) {
            await supabase.from('profiles').insert({
                id: user.id,
                email: user.email,
            });
        }
    };
    
    const fetchProfile = async (userId: string) => {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', userId).single();
        setProfile(profileData as any);
    };

    useEffect(() => {
        const fetchSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                await fetchProfile(currentUser.id);
            }
            setLoading(false);
        };

        fetchSessionAndProfile();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (currentUser) {
                if (_event === 'SIGNED_IN') {
                    await handleUserProfile(currentUser);
                }
                await fetchProfile(currentUser.id);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const refreshProfile = () => {
        if (user) {
            fetchProfile(user.id);
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setProfile(null);
        // 可选：window.location.href = '/';
    };

    const value = {
        user,
        session,
        profile,
        isLoading: loading,
        openAuthDialog: () => setIsAuthDialogOpen(true),
        isAuthDialogOpen,
        setIsAuthDialogOpen,
        refreshProfile,
        logout,
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
