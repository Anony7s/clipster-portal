
import { useState } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { HeartIcon, MessageSquare, Share2 } from "lucide-react";

export interface ClipData {
  id: string;
  title: string;
  thumbnail: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  createdAt: string;
  game: string;
  user: {
    username: string;
    avatar: string;
  };
}

interface ClipCardProps {
  clip: ClipData;
  layout?: "grid" | "list";
}

const ClipCard = ({ clip, layout = "grid" }: ClipCardProps) => {
  const [liked, setLiked] = useState(false);

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked(!liked);
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (layout === "list") {
    return (
      <Card className="clip-card hover:bg-card/80 transition-all mb-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to={`/clips/${clip.id}`} className="relative sm:w-64 h-48 overflow-hidden rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none">
            <img 
              src={clip.thumbnail} 
              alt={clip.title} 
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1 rounded">
              {clip.duration}
            </div>
            <Badge className="absolute top-2 left-2" variant="secondary">
              {clip.game}
            </Badge>
          </Link>
          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <Link to={`/clips/${clip.id}`} className="text-lg font-semibold line-clamp-2 mb-2 hover:text-primary">
                {clip.title}
              </Link>
              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
                <span>{formatViews(clip.views)} visualizações</span>
                <span>•</span>
                <span>{clip.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={clip.user.avatar} />
                  <AvatarFallback>{clip.user.username[0]}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">{clip.user.username}</span>
              </div>
            </div>
            <div className="flex items-center mt-4 gap-2">
              <Button 
                onClick={toggleLike} 
                variant="ghost" 
                size="sm" 
                className={`${liked ? 'text-red-500' : 'text-muted-foreground'}`}
              >
                <HeartIcon className="h-4 w-4 mr-1" /> {clip.likes + (liked ? 1 : 0)}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" /> {clip.comments}
              </Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="clip-card hover:bg-card/80 transition-all h-full">
      <Link to={`/clips/${clip.id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img 
            src={clip.thumbnail} 
            alt={clip.title} 
            className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1 rounded">
            {clip.duration}
          </div>
          <Badge className="absolute top-2 left-2" variant="secondary">
            {clip.game}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold line-clamp-2 mb-2">{clip.title}</h3>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={clip.user.avatar} />
              <AvatarFallback>{clip.user.username[0]}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">{clip.user.username}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs mt-2">
            <span>{formatViews(clip.views)} visualizações</span>
            <span>•</span>
            <span>{clip.createdAt}</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              onClick={toggleLike} 
              variant="ghost" 
              size="sm" 
              className={`${liked ? 'text-red-500' : 'text-muted-foreground'} px-2`}
            >
              <HeartIcon className="h-4 w-4 mr-1" /> {clip.likes + (liked ? 1 : 0)}
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground px-2">
              <MessageSquare className="h-4 w-4 mr-1" /> {clip.comments}
            </Button>
          </div>
          <Button variant="ghost" size="icon" className="text-muted-foreground h-8 w-8">
            <Share2 className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
};

export default ClipCard;
