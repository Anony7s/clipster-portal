
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { toast } from "@/components/ui/use-toast";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import CommentSection, { CommentData } from "@/components/CommentSection";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const ClipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch clip details
  const { data: clipData, isLoading, error } = useQuery({
    queryKey: ['clip', id],
    queryFn: async () => {
      if (!id) throw new Error("Clip ID não especificado");
      
      // Get clip data
      const { data: clip, error: clipError } = await supabase
        .from('clips')
        .select('*')
        .eq('id', id)
        .single();
      
      if (clipError) throw clipError;
      
      // Get tags
      const { data: tagData, error: tagError } = await supabase
        .from('clip_tags')
        .select('tag')
        .eq('clip_id', id);
      
      if (tagError) throw tagError;
      
      // Fetch user data
      const { data: userData } = await supabase.auth.getUser();
      
      // Check if user has favorited this clip
      if (userData.user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('clip_id', id)
          .maybeSingle();
        
        setLiked(!!favData);
      }
      
      // Increment view count
      await supabase.rpc('increment_view_count', { clip_id: id });
      
      return {
        ...clip,
        tags: tagData.map(t => t.tag),
        user: {
          id: clip.user_id,
          username: "Usuário", // In a real app, you would fetch this from a profiles table
          avatar: "",
          followers: 0
        }
      };
    },
    retry: 1,
    onError: (err: any) => {
      toast({
        title: "Erro ao carregar clipe",
        description: err.message || "Não foi possível carregar os detalhes do clipe.",
        variant: "destructive",
      });
    }
  });

  // Fetch related clips
  const { data: relatedClips } = useQuery({
    queryKey: ['relatedClips', id],
    queryFn: async () => {
      if (!id || !clipData) return [];
      
      const { data: related, error: relatedError } = await supabase
        .from('clips')
        .select('*')
        .eq('game', clipData.game)
        .neq('id', id)
        .limit(3);
      
      if (relatedError) throw relatedError;
      
      return related.map(clip => ({
        id: clip.id,
        title: clip.title,
        thumbnail: clip.thumbnail_url || "/placeholder.svg",
        views: clip.views,
        likes: 0,
        comments: 0,
        duration: clip.duration,
        createdAt: clip.created_at,
        game: clip.game,
        user: {
          username: "Usuário",
          avatar: ""
        }
      }));
    },
    enabled: !!clipData,
  });

  // Toggle favorite status
  const favoriteMutation = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");
      
      if (liked) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('clip_id', id);
        
        if (error) throw error;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: userData.user.id,
            clip_id: id
          });
        
        if (error) throw error;
      }
      
      return !liked;
    },
    onSuccess: (newState) => {
      setLiked(newState);
      toast({
        title: newState ? "Adicionado aos favoritos" : "Removido dos favoritos",
        description: newState ? "Clip adicionado aos seus favoritos" : "Clip removido dos seus favoritos"
      });
    },
    onError: (err: any) => {
      toast({
        title: "Erro",
        description: err.message || "Ocorreu um erro ao atualizar os favoritos.",
        variant: "destructive"
      });
    }
  });

  // Format view count
  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (error || !clipData) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-96">
          <p>Erro ao carregar o clipe. Por favor, tente novamente.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col space-y-6 lg:flex-row lg:space-y-0 lg:space-x-6">
        <div className="flex-1 space-y-6">
          {/* Video Player */}
          <VideoPlayer src={clipData.video_url} poster={clipData.thumbnail_url || "/placeholder.svg"} />

          {/* Clip Info */}
          <div className="space-y-4">
            <h1 className="text-2xl font-bold">{clipData.title}</h1>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatViews(clipData.views)} visualizações</span>
                <span>•</span>
                <span>{new Date(clipData.created_at).toLocaleDateString()}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${liked ? 'text-red-500' : ''}`}
                  onClick={() => favoriteMutation.mutate()}
                  disabled={favoriteMutation.isPending}
                >
                  <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                  <span>Favoritar</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <MessageSquare className="h-5 w-5" />
                  <span>Comentar</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`flex items-center gap-1 ${saved ? 'text-primary' : ''}`}
                  onClick={() => setSaved(!saved)}
                >
                  <Bookmark className={`h-5 w-5 ${saved ? 'fill-current' : ''}`} />
                  <span>Salvar</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Share2 className="h-5 w-5" />
                  <span>Compartilhar</span>
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
            
            {/* Description */}
            <div className="bg-card rounded-lg p-4">
              <p className="whitespace-pre-line text-sm">{clipData.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                  {clipData.game}
                </Badge>
                {clipData.tags && clipData.tags.map(tag => (
                  <Badge key={tag} variant="outline" className="cursor-pointer hover:bg-secondary/30">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-80 space-y-6">
          <div>
            <h3 className="font-semibold text-lg mb-4">Clips relacionados</h3>
            <div className="space-y-4">
              {relatedClips && relatedClips.map(clip => (
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
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatViews(clip.views)} visualizações • {new Date(clip.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              
              {(!relatedClips || relatedClips.length === 0) && (
                <p className="text-sm text-muted-foreground">Nenhum clipe relacionado encontrado.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ClipDetail;
