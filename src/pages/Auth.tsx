
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { ChevronRight, KeyRound, Mail, User } from "lucide-react";

const Auth = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("signin");
  const [animateCard, setAnimateCard] = useState(false);

  useEffect(() => {
    // Trigger animation when component mounts
    setAnimateCard(true);

    // Create star background
    const starsContainer = document.createElement("div");
    starsContainer.className = "absolute top-0 left-0 w-full h-full overflow-hidden -z-10";
    
    for (let i = 0; i < 100; i++) {
      const star = document.createElement("div");
      const size = Math.random() * 2;
      star.className = "absolute rounded-full bg-white opacity-70";
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animation = `twinkle ${5 + Math.random() * 10}s infinite`;
      starsContainer.appendChild(star);
    }

    document.getElementById("auth-container")?.appendChild(starsContainer);

    return () => {
      document.getElementById("auth-container")?.removeChild(starsContainer);
    };
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            email_confirmed: true
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Registro bem-sucedido",
        description: "Sua conta foi criada com sucesso. Você já pode fazer login.",
      });
      
      // Auto-switch to signin tab after successful signup
      setActiveTab("signin");
    } catch (error: any) {
      toast({
        title: "Erro no registro",
        description: error.message || "Ocorreu um erro durante o registro.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo de volta!",
      });

      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message || "Ocorreu um erro durante o login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      id="auth-container"
      className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background/95 to-background/80 p-4 relative overflow-hidden"
    >
      {/* Background animated gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20 animate-gradient-shift -z-10"></div>
      
      {/* Animated circles in background */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary/10 rounded-full filter blur-3xl animate-blob animation-delay-2000 -z-10"></div>
      <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full filter blur-3xl animate-blob animation-delay-4000 -z-10"></div>
      
      {/* Main card with entrance animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ 
          opacity: animateCard ? 1 : 0, 
          scale: animateCard ? 1 : 0.9,
          y: animateCard ? 0 : 20
        }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <Card className="backdrop-blur-sm border-white/20 shadow-xl bg-card/80">
          <CardHeader className="text-center pb-6">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-2">
                  <KeyRound className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Clip Manager
              </h2>
              <CardDescription className="mt-2 text-muted-foreground">
                Entre ou crie uma conta para gerenciar seus clipes
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary/20">Login</TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-primary/20">Cadastro</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn}>
                <CardContent className="space-y-4 pt-2">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email-signin">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password-signin">Senha</Label>
                      <button 
                        type="button" 
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={() => toast({ 
                          title: "Recuperação de senha", 
                          description: "Função será implementada em breve." 
                        })}
                      >
                        Esqueceu a senha?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-signin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </motion.div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all group"
                    disabled={loading}
                  >
                    {loading ? "Entrando..." : (
                      <span className="flex items-center">
                        Entrar 
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4 pt-2">
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="email-signup">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                        required
                      />
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password-signup">Senha</Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 transition-all focus:ring-2 focus:ring-primary/50"
                        required
                        minLength={6}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      A senha deve ter pelo menos 6 caracteres
                    </p>
                  </motion.div>
                </CardContent>
                
                <CardFooter>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all group"
                    disabled={loading}
                  >
                    {loading ? "Cadastrando..." : (
                      <span className="flex items-center">
                        Criar conta
                        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </TabsContent>
          </Tabs>
          
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Ao criar uma conta, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
