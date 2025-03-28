
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import ClipCard, { ClipData } from "@/components/ClipCard";
import GameCard, { GameData } from "@/components/GameCard";

// Mock data
const featuredClips: ClipData[] = [
  {
    id: "1",
    title: "Ace incrível no Valorant com a Jett",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Valorant+Ace",
    views: 12500,
    likes: 853,
    comments: 42,
    duration: "1:24",
    createdAt: "2 dias atrás",
    game: "Valorant",
    user: {
      username: "ProPlayer123",
      avatar: "",
    },
  },
  {
    id: "2",
    title: "Triple kill no último round para vencer a partida",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=CS:GO+Clutch",
    views: 8300,
    likes: 502,
    comments: 23,
    duration: "0:58",
    createdAt: "1 semana atrás",
    game: "CS:GO",
    user: {
      username: "GamerPro",
      avatar: "",
    },
  },
  {
    id: "3",
    title: "Jogada incrível com Yasuo - Pentakill",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=LoL+Pentakill",
    views: 32100,
    likes: 1245,
    comments: 87,
    duration: "1:12",
    createdAt: "3 dias atrás",
    game: "League of Legends",
    user: {
      username: "MidLaner",
      avatar: "",
    },
  },
  {
    id: "4",
    title: "Victory Royale com sniper no último círculo",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Fortnite+Victory",
    views: 15700,
    likes: 892,
    comments: 56,
    duration: "2:10",
    createdAt: "5 dias atrás",
    game: "Fortnite",
    user: {
      username: "FortniteKing",
      avatar: "",
    },
  },
  {
    id: "5",
    title: "Clutch 1v3 para ganhar o campeonato",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Apex+Clutch",
    views: 23400,
    likes: 1024,
    comments: 63,
    duration: "1:45",
    createdAt: "1 dia atrás",
    game: "Apex Legends",
    user: {
      username: "ApexPredator",
      avatar: "",
    },
  },
  {
    id: "6",
    title: "Melhor combo com Genji - Play of the Game",
    thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Overwatch+POTG",
    views: 9800,
    likes: 612,
    comments: 34,
    duration: "0:45",
    createdAt: "4 dias atrás",
    game: "Overwatch",
    user: {
      username: "GenjiMain",
      avatar: "",
    },
  },
];

const popularGames: GameData[] = [
  {
    id: "1",
    name: "Valorant",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Valorant",
    clipsCount: 1245,
  },
  {
    id: "2",
    name: "CS:GO",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=CS:GO",
    clipsCount: 983,
  },
  {
    id: "3",
    name: "Fortnite",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Fortnite",
    clipsCount: 1782,
  },
  {
    id: "4",
    name: "League of Legends",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=LoL",
    clipsCount: 2341,
  },
  {
    id: "5",
    name: "Apex Legends",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Apex",
    clipsCount: 876,
  },
  {
    id: "6",
    name: "Overwatch",
    image: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Overwatch",
    clipsCount: 543,
  },
];

const Index = () => {
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  return (
    <Layout>
      <div className="flex flex-col space-y-8">
        <section className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Clipster</h1>
              <p className="text-muted-foreground mt-1">Descubra, compartilhe e comente os melhores momentos dos seus jogos favoritos</p>
            </div>
            <Button className="bg-primary" asChild>
              <a href="/upload">Upload de Clipe</a>
            </Button>
          </div>

          <Tabs defaultValue="trending" className="w-full">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="trending">Em Alta</TabsTrigger>
                <TabsTrigger value="games">Jogos</TabsTrigger>
                <TabsTrigger value="followed">Seguindo</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <Button
                  variant={layout === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("grid")}
                  className="px-3"
                >
                  Grid
                </Button>
                <Button
                  variant={layout === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setLayout("list")}
                  className="px-3"
                >
                  Lista
                </Button>
              </div>
            </div>

            <TabsContent value="trending" className="space-y-6">
              {layout === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {featuredClips.map((clip) => (
                    <ClipCard key={clip.id} clip={clip} layout={layout} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredClips.map((clip) => (
                    <ClipCard key={clip.id} clip={clip} layout={layout} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="games" className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="followed" className="space-y-4">
              <div className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Nenhum criador seguido ainda</h3>
                <p className="text-muted-foreground mb-4">Siga seus criadores favoritos para ver seus clipes aqui</p>
                <Button asChild>
                  <a href="/trending">Encontrar Criadores</a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
