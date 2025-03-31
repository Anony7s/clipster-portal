
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Bookmark, Filter, Play, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface SavedClip {
  id: string;
  clip: {
    id: string;
    title: string;
    game: string;
    thumbnail_url: string;
    views: number;
    created_at: string;
    duration: string;
  }
}

const Bookmarks = () => {
  const [filterBy, setFilterBy] = useState<string>("recent");

  const { data: bookmarks, isLoading, error } = useQuery({
    queryKey: ['bookmarks', filterBy],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          id,
          clip_id,
          clip:clips (
            id,
            title,
            game,
            thumbnail_url,
            views,
            created_at,
            duration
          )
        `)
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
      
      // Transform the data to match our interface
      let result = data.map(item => ({
        id: item.id,
        clip: item.clip
      }));
      
      // Apply sorting based on filter
      if (filterBy === "oldest") {
        result = result.sort((a, b) => 
          new Date(a.clip.created_at).getTime() - new Date(b.clip.created_at).getTime()
        );
      } else if (filterBy === "game") {
        result = result.sort((a, b) => a.clip.game.localeCompare(b.clip.game));
      } else {
        // Default: most recent first
        result = result.sort((a, b) => 
          new Date(b.clip.created_at).getTime() - new Date(a.clip.created_at).getTime()
        );
      }
      
      return result;
    },
    meta: {
      onError: (err: any) => {
        toast({
          title: "Erro ao carregar clipes salvos",
          description: err.message || "Não foi possível carregar seus clipes salvos.",
          variant: "destructive",
        });
      }
    }
  });

  const handleFilter = (filter: string) => {
    setFilterBy(filter);
  };

  return (
    <Layout>
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Bookmark className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Clipes Salvos</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleFilter("recent")}>Mais recentes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter("oldest")}>Mais antigos</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilter("game")}>Por jogo</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
        ) : bookmarks && bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bookmarks.map((bookmark) => (
              <Card key={bookmark.id} className="overflow-hidden group">
                <Link to={`/clips/${bookmark.clip.id}`}>
                  <div className="relative aspect-video">
                    <img
                      src={bookmark.clip.thumbnail_url || "/placeholder.svg"}
                      alt={bookmark.clip.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Assistir
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {bookmark.clip.duration}
                    </div>
                  </div>
                </Link>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{bookmark.clip.title}</CardTitle>
                  <CardDescription>{bookmark.clip.game}</CardDescription>
                </CardHeader>
                <CardFooter className="py-2 text-xs text-muted-foreground">
                  <div className="flex justify-between w-full">
                    <span>{bookmark.clip.views} visualizações</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(bookmark.clip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 max-w-md mx-auto">
            <CardHeader>
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardTitle>Nenhum clipe salvo</CardTitle>
              <CardDescription>
                Você ainda não salvou nenhum clipe para assistir mais tarde.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button variant="default" asChild>
                <Link to="/">Explorar clipes</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Bookmarks;
