
import { useState } from "react";
import Layout from "@/components/Layout";
import { Heart, Filter } from "lucide-react";
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

// Dados iniciais de exemplo para favoritos
const dummyFavorites = [
  {
    id: "1",
    title: "Clutch 1v4 no Valorant",
    game: "Valorant",
    thumbnail: "/placeholder.svg",
    views: 24,
    date: "2023-09-15",
    duration: "00:42",
  },
  {
    id: "2",
    title: "Pentakill com a Jinx",
    game: "League of Legends",
    thumbnail: "/placeholder.svg",
    views: 18,
    date: "2023-08-22",
    duration: "00:31",
  },
];

const Favorites = () => {
  const [favorites, setFavorites] = useState(dummyFavorites);

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

        {favorites.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((clip) => (
              <Card key={clip.id} className="overflow-hidden group">
                <div className="relative aspect-video">
                  <img
                    src={clip.thumbnail}
                    alt={clip.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="sm">
                      Assistir
                    </Button>
                  </div>
                  <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                    {clip.duration}
                  </div>
                </div>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{clip.title}</CardTitle>
                  <CardDescription>{clip.game}</CardDescription>
                </CardHeader>
                <CardFooter className="py-2 text-xs text-muted-foreground">
                  <div className="flex justify-between w-full">
                    <span>{clip.views} visualizações</span>
                    <span>{new Date(clip.date).toLocaleDateString()}</span>
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
                <a href="/">Explorar clipes</a>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Favorites;
