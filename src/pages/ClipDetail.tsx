
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import VideoPlayer from "@/components/VideoPlayer";
import CommentSection from "@/components/CommentSection";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/use-toast";
import { Heart, Bookmark, Share, Calendar, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// This is a temporary function for view counting
// In a production environment, a proper database function would be used
const incrementViewCount = async (clipId: string) => {
  try {
    const { error } = await supabase.rpc('increment_view_count', { clip_id: clipId });
    if (error) throw error;
  } catch (error) {
    console.error("Error incrementing view count:", error);
  }
};

const ClipDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  
  const { data: clipData, isLoading, error } = useQuery({
    queryKey: ['clipDetail', id],
    queryFn: async () => {
      if (!id) throw new Error("ID do clipe não encontrado");
      
      // Check if user has liked this clip
      const { data: userData } = await supabase.auth.getUser();
      
      if (userData.user) {
        const { data: favData } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', userData.user.id)
          .eq('clip_id', id)
          .maybeSingle();
          
        if (userData.user && id) {
          // Verificar se o usuário tem este clip nos bookmarks
          const { data: bookmarkData } = await supabase
            .from('bookmarks')
            .select('id')
            .eq('user_id', userData.user.id)
            .eq('clip_id', id)
            .maybeSingle();
            
          setBookmarked(!!bookmarkData);
        }
        
        setLiked(!!favData);
      }
      
      // Increment view count
      await incrementViewCount(id);
      
      // Get clip details
      const { data: clipDetails, error: clipError } = await supabase
        .from('clips')
        .select(`
          *,
          clip_tags(tag)
        `)
        .eq('id', id)
        .single();
      
      if (clipError) throw clipError;
      
      // Get user details (mock for now)
      const userData2 = {
        id: "user123",
        username: "GamerPro99",
        avatar: "/placeholder.svg",
        followers: 245
      };
      
      // Load mock comments for now
      setComments([
        {
          id: "1",
          user: {
            username: "GamerFan54",
            avatar: "/placeholder.svg"
          },
          content: "Este clipe é incrível! Como você conseguiu fazer isso?",
          likes: 12,
          createdAt: "2 dias atrás"
        },
        {
          id: "2",
          user: {
            username: "ProGamer22",
            avatar: "/placeholder.svg"
          },
          content: "Muito bom! Que jogada impressionante.",
          likes: 5,
          createdAt: "1 dia atrás",
          replies: [
            {
              id: "2-1",
              user: {
                username: "GameMaster",
                avatar: "/placeholder.svg"
              },
              content: "Concordo totalmente, nunca vi nada parecido!",
              likes: 3,
              createdAt: "20 horas atrás"
            }
          ]
        }
      ]);
      
      return {
        ...clipDetails,
        tags: clipDetails.clip_tags ? clipDetails.clip_tags.map((t: any) => t.tag) : [],
        user: userData2
      };
    },
    meta: {
      onError: (err: any) => {
        toast({
          title: "Erro ao carregar clipe",
          description: err.message || "Não foi possível carregar os detalhes do clipe.",
          variant: "destructive",
        });
      }
    }
  });

  const handleLike = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast({
          title: "Autenticação necessária",
          description: "Você precisa estar logado para curtir clipes.",
          variant: "destructive",
        });
        return;
      }
      
      if (liked) {
        // Unlike
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('clip_id', id);
        
        if (error) throw error;
        
        setLiked(false);
        toast({
          title: "Removido dos favoritos",
          description: "Clipe removido dos seus favoritos com sucesso.",
        });
      } else {
        // Like
        const { error } = await supabase
          .from('favorites')
          .insert({
            user_id: userData.user.id,
            clip_id: id
          });
        
        if (error) throw error;
        
        setLiked(true);
        toast({
          title: "Adicionado aos favoritos",
          description: "Clipe adicionado aos seus favoritos com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao favoritar clipe:", error);
      toast({
        title: "Erro ao favoritar",
        description: error.message || "Não foi possível adicionar aos favoritos.",
        variant: "destructive",
      });
    }
  };

  const handleBookmark = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        toast({
          title: "Autenticação necessária",
          description: "Você precisa estar logado para salvar clipes.",
          variant: "destructive",
        });
        return;
      }
      
      if (bookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userData.user.id)
          .eq('clip_id', id);
        
        if (error) throw error;
        
        setBookmarked(false);
        toast({
          title: "Removido dos salvos",
          description: "Clipe removido dos seus salvos com sucesso.",
        });
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userData.user.id,
            clip_id: id
          });
        
        if (error) throw error;
        
        setBookmarked(true);
        toast({
          title: "Adicionado aos salvos",
          description: "Clipe adicionado aos seus salvos com sucesso.",
        });
      }
    } catch (error: any) {
      console.error("Erro ao salvar clipe:", error);
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar o clipe.",
        variant: "destructive",
      });
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(
      () => {
        toast({
          title: "Link copiado",
          description: "O link do clipe foi copiado para a área de transferência.",
        });
      },
      () => {
        toast({
          title: "Erro ao copiar link",
          description: "Não foi possível copiar o link para a área de transferência.",
          variant: "destructive",
        });
      }
    );
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container">
          <div className="aspect-video bg-muted animate-pulse rounded-lg mb-8" />
          <div className="mb-4 h-8 w-3/4 bg-muted animate-pulse rounded" />
          <div className="mb-8 h-4 w-1/2 bg-muted animate-pulse rounded" />
        </div>
      </Layout>
    );
  }

  if (!clipData) {
    return (
      <Layout>
        <div className="container text-center py-16">
          <h1 className="text-2xl font-bold mb-4">Clipe não encontrado</h1>
          <p className="text-muted-foreground">
            O clipe que você está procurando não existe ou foi removido.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Video Player */}
          <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
            <VideoPlayer src={clipData.video_url} poster={clipData.thumbnail_url} />
          </div>

          {/* Clip Title and Action Buttons */}
          <div>
            <h1 className="text-2xl font-bold mb-2">{clipData.title}</h1>
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {clipData.views || 0} visualizações
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {new Date(clipData.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={liked ? "default" : "outline"} 
                  size="sm"
                  onClick={handleLike}
                >
                  <Heart className={`h-4 w-4 mr-2 ${liked ? "fill-current" : ""}`} />
                  {liked ? "Curtido" : "Curtir"}
                </Button>
                <Button 
                  variant={bookmarked ? "secondary" : "outline"} 
                  size="sm"
                  onClick={handleBookmark}
                >
                  <Bookmark className={`h-4 w-4 mr-2 ${bookmarked ? "fill-current" : ""}`} />
                  {bookmarked ? "Salvo" : "Salvar"}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleShare}
                >
                  <Share className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </div>

          {/* Tags */}
          {clipData.tags && clipData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {clipData.tags.map((tag: string) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Description */}
          {clipData.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Descrição</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{clipData.description}</p>
              </CardContent>
            </Card>
          )}

          {/* Comments Section */}
          <CommentSection clipId={id!} comments={comments} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Uploader Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Criador</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={clipData.user.avatar} alt={clipData.user.username} />
                  <AvatarFallback>{clipData.user.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{clipData.user.username}</h3>
                  <p className="text-xs text-muted-foreground">{clipData.user.followers} seguidores</p>
                </div>
              </div>
              <Button className="w-full" variant="secondary">
                Seguir
              </Button>
            </CardContent>
          </Card>

          {/* Game Info */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Jogo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-muted rounded-md flex items-center justify-center">
                  {clipData.game.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold">{clipData.game}</h3>
                  <p className="text-xs text-muted-foreground">
                    {clipData.tags && clipData.tags.length > 0 ? `${clipData.tags.length} tags relacionadas` : "Sem tags relacionadas"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" size="sm">
                Ver mais clips de {clipData.game}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ClipDetail;
