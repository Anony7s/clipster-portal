
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Public routes that don't require authentication
  const publicRoutes = ['/auth'];

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  }

  if (!session && !publicRoutes.includes(location.pathname)) {
    // Redirect to the auth page if not authenticated
    toast({
      title: "Acesso restrito",
      description: "Faça login para acessar esta página",
    });
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (session && publicRoutes.includes(location.pathname)) {
    // Redirect to the home page if already authenticated and trying to access auth page
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
