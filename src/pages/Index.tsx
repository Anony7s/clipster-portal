
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { ArrowRight, Upload, Play, Calendar } from "lucide-react";

// Interface para o tipo de clipe
interface Clip {
  id: string;
  title: string;
  description?: string;
  game: string;
  thumbnail: string;
  views: number;
  date: string;
  duration: string;
  tags?: string[];
}

const Index = () => {
  const [recentClips, setRecentClips] = useState<Clip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulando o carregamento de clipes do localStorage ou de uma API
    const loadClips = () => {
      setIsLoading(true);
      
      try {
        // Verificar se há clipes salvos no localStorage
        const savedClips = localStorage.getItem("uploadedClips");
        let clips: Clip[] = [];
        
        if (savedClips) {
          clips = JSON.parse(savedClips);
          
          // Ordenar por data (mais recentes primeiro)
          clips.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }
        
        setRecentClips(clips);
        
        if (clips.length === 0) {
          // Adicionar alguns clipes de exemplo se não houver clipes salvos
          setRecentClips([
            {
              id: "demo1",
              title: "Vitória incrível no Battle Royale",
              game: "Fortnite",
              thumbnail: "/placeholder.svg",
              views: 42,
              date: "2023-12-01",
              duration: "01:24",
              tags: ["vitória", "battle-royale", "squad"]
            },
            {
              id: "demo2",
              title: "Clutch de última hora",
              game: "Valorant",
              thumbnail: "/placeholder.svg",
              views: 36,
              date: "2023-11-28",
              duration: "00:45",
              tags: ["clutch", "ace", "spike"]
            }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar clipes:", error);
        toast({
          title: "Erro ao carregar clipes",
          description: "Não foi possível carregar seus clipes. Por favor, tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClips();
  }, []);

  return (
    <Layout>
      <div className="container">
        {/* Hero section */}
        <section className="mb-12">
          <div className="rounded-xl bg-gradient-to-r from-purple-900/40 to-blue-900/40 p-8 relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Sua Plataforma Pessoal de Clipes</h1>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl">
                Guarde, organize e reviva seus melhores momentos nos jogos em um só lugar.
              </p>
              <Button asChild size="lg">
                <Link to="/upload">
                  <Upload className="h-5 w-5 mr-2" />
                  Fazer Upload
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Recent clips section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Clipes Recentes</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/recentes">
                Ver todos <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video bg-muted animate-pulse" />
                  <CardHeader className="py-3">
                    <div className="h-5 bg-muted animate-pulse rounded mb-2 w-3/4" />
                    <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : recentClips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentClips.map((clip) => (
                <Card key={clip.id} className="overflow-hidden group">
                  <Link to={`/clips/${clip.id}`}>
                    <div className="relative aspect-video">
                      <img 
                        src={clip.thumbnail} 
                        alt={clip.title} 
                        className="object-cover w-full h-full" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Assistir
                        </Button>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                        {clip.duration}
                      </div>
                    </div>
                  </Link>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base">{clip.title}</CardTitle>
                    <CardDescription>{clip.game}</CardDescription>
                  </CardHeader>
                  {clip.tags && clip.tags.length > 0 && (
                    <CardContent className="py-0">
                      <div className="flex flex-wrap gap-1">
                        {clip.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {clip.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{clip.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  )}
                  <CardFooter className="py-2 text-xs text-muted-foreground">
                    <div className="flex justify-between w-full">
                      <span>{clip.views} visualizações</span>
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(clip.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center p-12 max-w-lg mx-auto">
              <CardHeader>
                <CardTitle>Nenhum clipe encontrado</CardTitle>
                <CardDescription>
                  Você ainda não possui nenhum clipe em sua biblioteca.
                </CardDescription>
              </CardHeader>
              <CardFooter className="justify-center">
                <Button asChild>
                  <Link to="/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Fazer upload do seu primeiro clipe
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default Index;
