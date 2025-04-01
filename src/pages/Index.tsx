
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageGrid from "@/components/ImageGrid";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PlusCircle, Image, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

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

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
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
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Galeria de Imagens</h1>
            <p className="text-muted-foreground">
              Encontre e compartilhe imagens e GIFs para seu perfil ou projetos
            </p>
          </div>
          
          {isLoggedIn && (
            <Button asChild size="lg">
              <Link to="/upload" className="flex items-center">
                <PlusCircle className="mr-2" />
                Upload de Imagem
              </Link>
            </Button>
          )}
        </div>
        
        <div className="mb-8">
          <Tabs defaultValue="trending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="trending">Em Alta</TabsTrigger>
              <TabsTrigger value="new">Recentes</TabsTrigger>
              <TabsTrigger value="popular">Populares</TabsTrigger>
              {isLoggedIn && (
                <TabsTrigger value="following">Meus Seguidos</TabsTrigger>
              )}
            </TabsList>
            
            <div className="mb-6 overflow-x-auto pb-2">
              <div className="flex gap-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(
                      category === "Todos" ? null : category
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
            
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
                  <Card className="p-8 text-center">
                    <h3 className="text-xl font-semibold mb-2">Faça login para ver conteúdo dos seus seguidos</h3>
                    <p className="text-muted-foreground mb-6">
                      Você precisa estar logado para ver as imagens dos usuários que segue.
                    </p>
                    <Button asChild>
                      <Link to="/auth">Entrar</Link>
                    </Button>
                  </Card>
                )}
              </TabsContent>
            )}
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Image className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Milhares de Imagens</h3>
            <p className="text-muted-foreground">
              Acesse nossa biblioteca com milhares de imagens e GIFs para personalizar seu perfil.
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <PlusCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Compartilhe suas Criações</h3>
            <p className="text-muted-foreground">
              Faça upload das suas próprias imagens e GIFs para compartilhar com a comunidade.
            </p>
          </Card>
          
          <Card className="p-6 flex flex-col items-center text-center">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalize seu Perfil</h3>
            <p className="text-muted-foreground">
              Use nossas imagens para personalizar seu perfil e destacar-se nas redes sociais.
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
