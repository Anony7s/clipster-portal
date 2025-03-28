
import { useState } from "react";
import Layout from "@/components/Layout";
import { Flame, Calendar } from "lucide-react";
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

// Dados iniciais de exemplo para clipes recentes
const dummyRecentClips = [
  {
    id: "1",
    title: "Ace com a Jett",
    game: "Valorant",
    thumbnail: "/placeholder.svg",
    views: 42,
    date: "2023-11-28",
    duration: "00:38",
  },
  {
    id: "2",
    title: "Victory Royale no Fortnite",
    game: "Fortnite",
    thumbnail: "/placeholder.svg",
    views: 36,
    date: "2023-11-25",
    duration: "01:15",
  },
  {
    id: "3",
    title: "Combo incrível no Mortal Kombat",
    game: "Mortal Kombat 1",
    thumbnail: "/placeholder.svg",
    views: 29,
    date: "2023-11-20",
    duration: "00:32",
  },
  {
    id: "4",
    title: "Gol de bicicleta no FIFA",
    game: "EA FC 24",
    thumbnail: "/placeholder.svg",
    views: 31,
    date: "2023-11-15",
    duration: "00:25",
  },
  {
    id: "5",
    title: "Round perfeito no CS2",
    game: "Counter-Strike 2",
    thumbnail: "/placeholder.svg",
    views: 48,
    date: "2023-11-10",
    duration: "00:55",
  },
  {
    id: "6",
    title: "Vitória espetacular no Apex",
    game: "Apex Legends",
    thumbnail: "/placeholder.svg",
    views: 27,
    date: "2023-11-05",
    duration: "01:08",
  },
];

const Recentes = () => {
  const [recentClips, setRecentClips] = useState(dummyRecentClips);

  return (
    <Layout>
      <div className="container">
        <div className="flex items-center mb-6">
          <Flame className="h-6 w-6 mr-2 text-orange-500" />
          <h1 className="text-3xl font-bold">Clipes Recentes</h1>
        </div>

        <Tabs defaultValue="esta_semana" className="mb-6">
          <TabsList>
            <TabsTrigger value="esta_semana">Esta Semana</TabsTrigger>
            <TabsTrigger value="este_mes">Este Mês</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        {recentClips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentClips.map((clip) => (
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
          <Card className="text-center p-12 max-w-md mx-auto">
            <CardHeader>
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardTitle>Nenhum clipe recente</CardTitle>
              <CardDescription>
                Você não tem clipes recentes para exibir.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button asChild>
                <a href="/upload">Fazer upload de clipes</a>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Recentes;
