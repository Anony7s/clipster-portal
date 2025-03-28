
import { useParams, Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark,
  Flag,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import CommentSection, { CommentData } from "@/components/CommentSection";
import ClipCard, { ClipData } from "@/components/ClipCard";
import { useState } from "react";

// Mock single clip data
const clipData = {
  id: "1",
  title: "Ace incrível no Valorant com a Jett",
  description: "Consegui esse Ace incrível jogando com a Jett em uma partida ranqueada. Usei a ultimate no momento perfeito para eliminar toda a equipe adversária!",
  videoUrl: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4", // Sample video
  thumbnail: "https://placehold.co/600x400/1e1a2b/8b5cf6?text=Valorant+Ace",
  views: 12500,
  likes: 853,
  comments: 42,
  saves: 126,
  shares: 37,
  duration: "1:24",
  createdAt: "2 dias atrás",
  game: "Valorant",
  tags: ["ace", "valorant", "jett", "fps"],
  user: {
    id: "u1",
    username: "ProPlayer123",
    avatar: "",
    followers: 2540,
  },
};

// Mock comments
const commentsData: CommentData[] = [
  {
    id: "c1",
    user: {
      username: "GamerFan",
      avatar: "",
    },
    content: "Essa jogada foi simplesmente incrível! Como você fez aquela última eliminação?",
    likes: 24,
    createdAt: "1 dia atrás",
    replies: [
      {
        id: "r1",
        user: {
          username: "ProPlayer123",
          avatar: "",
        },
        content: "Obrigado! Foi uma combinação de sorte e reflexos rápidos haha",
        likes: 8,
        createdAt: "1 dia atrás",
      }
    ]
  },
  {
    id: "c2",
    user: {
      username: "FPSExpert",
      avatar: "",
    },
    content: "Sua mira está excelente nesse clip. Quais configurações você usa?",
    likes: 16,
    createdAt: "2 dias atrás",
  },
  {
    id: "c3",
    user: {
      username: "JettMain",
      avatar: "",
    },
    content: "Vou tentar reproduzir essa jogada nas minhas partidas! Qual é a sua sensibilidade do mouse?",
    likes: 7,
    createdAt: "2 dias atrás",
  },
];

// Mock related clips
const relatedClips: ClipData[] = [
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
];

const ClipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [following, setFollowing] = useState(false);

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  return (
    <Layout>
      <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-6">
        <div className="flex-1 space-y-6">
          {/* Video Player */}
          <VideoPlayer src={clipData.videoUrl} poster={clipData.thumbnail} />

          {/* Clip Info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{clipData.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatViews(clipData.views)} visualizações</span>
                <span>•</span>
                <span>{clipData.createdAt}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}
                  onClick={() => setLiked(!liked)}
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  <span>{clipData.likes + (liked ? 1 : 0)}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-5 w-5" />
                  <span>{clipData.comments}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${saved ? 'text-primary' : ''}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                  <span>{clipData.saves + (saved ? 1 : 0)}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-5 w-5" />
                  <span>{clipData.shares}</span>
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Baixar</DropdownMenuItem>
                    <DropdownMenuItem>Copiar link</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Flag className="h-4 w-4 mr-2" />
                      <span>Reportar</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Separator />
            
            {/* Creator Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={clipData.user.avatar} />
                  <AvatarFallback>{clipData.user.username[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <Link to={`/user/${clipData.user.id}`} className="font-semibold hover:text-primary">
                    {clipData.user.username}
                  </Link>
                  <p className="text-sm text-muted-foreground">{clipData.user.followers} seguidores</p>
                </div>
              </div>
              <Button 
                variant={following ? "outline" : "default"}
                onClick={() => setFollowing(!following)}
              >
                {following ? "Seguindo" : "Seguir"}
              </Button>
            </div>
            
            {/* Description */}
            <div className="bg-card rounded-lg p-4">
              <p className="whitespace-pre-line text-sm">{clipData.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to={`/games/${clipData.game.toLowerCase()}`}>
                  <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                    {clipData.game}
                  </Badge>
                </Link>
                {clipData.tags.map(tag => (
                  <Link key={tag} to={`/tags/${tag}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-secondary/30">
                      #{tag}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
            
            {/* Comments */}
            <CommentSection comments={commentsData} clipId={id || ""} />
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Clips relacionados</h3>
            <div className="space-y-4">
              {relatedClips.map(clip => (
                <div key={clip.id} className="clip-card">
                  <Link to={`/clips/${clip.id}`} className="block group">
                    <div className="relative aspect-video overflow-hidden rounded-t-lg">
                      <img 
                        src={clip.thumbnail} 
                        alt={clip.title} 
                        className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1 rounded">
                        {clip.duration}
                      </div>
                    </div>
                    <div className="p-3">
                      <h4 className="font-medium line-clamp-2 text-sm">{clip.title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={clip.user.avatar} />
                          <AvatarFallback>{clip.user.username[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-muted-foreground">{clip.user.username}</span>
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatViews(clip.views)} visualizações • {clip.createdAt}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClipDetail;
