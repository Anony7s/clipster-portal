
import { useState, useEffect, useRef } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageGrid from "@/components/ImageGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Image, Sparkles, TrendingUp, Clock, Star, UserPlus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { Input } from "@/components/ui/input";

const categories = [
  "Todos",
  "Perfil",
  "Paisagem",
  "Animais",
  "Comida",
  "Arte",
  "Memes",
  "Abstrato"
];

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string; 
  delay?: number;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  
  return (
    <motion.div
      ref={ref}
      initial={{ y: 50, opacity: 0 }}
      animate={isInView ? { y: 0, opacity: 1 } : { y: 50, opacity: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)" }}
      className="relative"
    >
      <Card className="p-6 flex flex-col items-center text-center h-full backdrop-blur-sm border-white/10 hover:border-primary/30 transition-colors duration-300">
        <div className="absolute -top-1 -right-1 w-20 h-20 bg-primary/5 rounded-full blur-xl"></div>
        <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/80 to-accent/80 blur-sm opacity-70 group-hover:opacity-100 transition-opacity"></div>
          <Icon className="h-6 w-6 text-primary relative z-10" />
        </div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </Card>
    </motion.div>
  );
};

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const headerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
  const headerScale = useTransform(scrollY, [0, 100], [1, 0.98]);
  
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
    };
    
    fetchUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsLoggedIn(!!session);
        setUser(session?.user || null);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 relative">
        {/* Hero section with animated background */}
        <motion.div 
          ref={headerRef}
          style={{ opacity: headerOpacity, scale: headerScale }}
          className="relative overflow-hidden rounded-xl mb-12"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 animate-gradient-shift"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 mix-blend-overlay"></div>
          
          <div className="relative z-10 px-6 py-16 md:py-24 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text text-transparent">
                Galeria de Imagens
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Encontre e compartilhe imagens e GIFs para seu perfil ou projetos
              </p>

              <div className="flex flex-wrap gap-3">
                {isLoggedIn ? (
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all group">
                    <Link to="/upload" className="flex items-center">
                      <PlusCircle className="mr-2" />
                      Upload de Imagem
                    </Link>
                  </Button>
                ) : (
                  <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all group">
                    <Link to="/auth" className="flex items-center">
                      <UserPlus className="mr-2" />
                      Criar Conta
                    </Link>
                  </Button>
                )}
                
                <Button variant="outline" size="lg" className="border-white/20 hover:bg-white/5 transition-all">
                  Explorar
                </Button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full max-w-md"
            >
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-xl blur-md opacity-75 group-hover:opacity-100 transition duration-200"></div>
                <Card className="p-5 backdrop-blur-sm bg-card/90 border-white/10 relative">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mr-1.5"></div>
                      <div className="h-2 w-2 rounded-full bg-yellow-500 mr-1.5"></div>
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder="Buscar imagens..."
                        className="pl-10 bg-background/50"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                          <Image className="h-6 w-6 text-muted-foreground/40" />
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          </div>
          
          {/* Animated wave at the bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-16 overflow-hidden">
            <svg className="absolute bottom-0 w-full h-24" 
                 xmlns="http://www.w3.org/2000/svg" 
                 viewBox="0 0 1440 120">
              <path 
                fill="hsl(260 30% 12%)" 
                fillOpacity="1" 
                d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,85.3C672,75,768,85,864,90.7C960,96,1056,96,1152,90.7C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
            </svg>
          </div>
        </motion.div>
        
        <div className="mb-8">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="mb-6 bg-muted/50 backdrop-blur-sm w-full md:w-auto justify-start overflow-x-auto">
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary/20">
                <TrendingUp className="mr-2 h-4 w-4" />
                Em Alta
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-primary/20">
                <Clock className="mr-2 h-4 w-4" />
                Recentes
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-primary/20">
                <Star className="mr-2 h-4 w-4" />
                Populares
              </TabsTrigger>
              {isLoggedIn && (
                <TabsTrigger value="following" className="data-[state=active]:bg-primary/20">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Meus Seguidos
                </TabsTrigger>
              )}
            </TabsList>
            
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 overflow-x-auto pb-2"
            >
              <div className="flex gap-2">
                {categories.map((category, index) => (
                  <motion.div
                    key={category}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Button
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(
                        category === "Todos" ? null : category
                      )}
                      className={selectedCategory === category ? 
                        "bg-gradient-to-r from-primary/80 to-accent/80 hover:from-primary/70 hover:to-accent/70 border-transparent" : 
                        "border-white/10 hover:border-primary/30 transition-colors"
                      }
                    >
                      {category}
                    </Button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            
            <TabsContent value="trending">
              <ImageGrid category={selectedCategory} layout="grid" />
            </TabsContent>
            
            <TabsContent value="new">
              <ImageGrid category={selectedCategory} layout="grid" />
            </TabsContent>
            
            <TabsContent value="popular">
              <ImageGrid category={selectedCategory} layout="grid" />
            </TabsContent>
            
            {isLoggedIn && (
              <TabsContent value="following">
                {isLoggedIn ? (
                  <ImageGrid layout="grid" />
                ) : (
                  <Card className="p-8 text-center border-white/10 backdrop-blur-sm">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <h3 className="text-xl font-semibold mb-2">Faça login para ver conteúdo dos seus seguidos</h3>
                      <p className="text-muted-foreground mb-6">
                        Você precisa estar logado para ver as imagens dos usuários que segue.
                      </p>
                      <Button asChild>
                        <Link to="/auth">Entrar</Link>
                      </Button>
                    </motion.div>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-24 mb-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Por que usar nossa plataforma?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-16">
            Descubra como podemos ajudá-lo a encontrar, gerenciar e compartilhar imagens incríveis
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon={Image}
            title="Milhares de Imagens"
            description="Acesse nossa biblioteca com milhares de imagens e GIFs para personalizar seu perfil."
            delay={0.1}
          />
          
          <FeatureCard
            icon={PlusCircle}
            title="Compartilhe suas Criações"
            description="Faça upload das suas próprias imagens e GIFs para compartilhar com a comunidade."
            delay={0.2}
          />
          
          <FeatureCard
            icon={Sparkles}
            title="Personalize seu Perfil"
            description="Use nossas imagens para personalizar seu perfil e destacar-se nas redes sociais."
            delay={0.3}
          />
        </div>
        
        {/* Call to action */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mt-24 mb-12 relative overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-accent/30"></div>
          <div className="relative z-10 flex flex-col items-center text-center py-16 px-6">
            <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg">
              Junte-se a milhares de usuários e comece a compartilhar suas imagens agora mesmo
            </p>
            <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all">
              <Link to={isLoggedIn ? "/upload" : "/auth"}>
                {isLoggedIn ? "Upload de Imagem" : "Criar Conta"}
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Index;
