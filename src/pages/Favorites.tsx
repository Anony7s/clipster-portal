
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Heart, Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface FavoriteClip {
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

const Favorites = () => {
  const { data: favorites, isLoading, error } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('favorites')
        .select(`
          id,
          clip_id,
          clips (
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
      
      return data.map(item => ({
        id: item.id,
        clip: item.clips
      }));
    },
    meta: {
      onError: (err: any) => {
        toast({
          title: "Erro ao carregar favoritos",
          description: err.message || "Não foi possível carregar seus favoritos. Por favor, tente novamente.",
          variant: "destructive",
        });
      }
    }
  });

  return (
    <Layout>
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-red-500" />
            <h1 className="text-3xl font-bold">Meus Favoritos</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Mais recentes</DropdownMenuItem>
              <DropdownMenuItem>Mais antigos</DropdownMenuItem>
              <DropdownMenuItem>Por jogo</DropdownMenuItem>
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
        ) : favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden group">
                <Link to={`/clips/${favorite.clip.id}`}>
                  <div className="relative aspect-video">
                    <img
                      src={favorite.clip.thumbnail_url || "/placeholder.svg"}
                      alt={favorite.clip.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        Assistir
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {favorite.clip.duration}
                    </div>
                  </div>
                </Link>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{favorite.clip.title}</CardTitle>
                  <CardDescription>{favorite.clip.game}</CardDescription>
                </CardHeader>
                <CardFooter className="py-2 text-xs text-muted-foreground">
                  <div className="flex justify-between w-full">
                    <span>{favorite.clip.views} visualizações</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(favorite.clip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 max-w-md mx-auto">
            <CardHeader>
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardTitle>Nenhum favorito ainda</CardTitle>
              <CardDescription>
                Você ainda não adicionou nenhum clipe aos seus favoritos.
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

export default Favorites;
