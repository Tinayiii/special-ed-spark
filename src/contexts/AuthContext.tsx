
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Tables<'profiles'> | null;
    isLoading: boolean;
    openAuthDialog: () => void;
    isAuthDialogOpen: boolean;
    setIsAuthDialogOpen: (isOpen: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
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

    useEffect(() => {
        const fetchSessionAndProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) {
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
                setProfile(profileData);
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
                // Fetch profile after any change
                const { data: profileData } = await supabase.from('profiles').select('*').eq('id', currentUser.id).single();
                setProfile(profileData);
            } else {
                setProfile(null);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        user,
        session,
        profile,
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
