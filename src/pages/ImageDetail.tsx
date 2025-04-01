
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { typedSupabase as supabase } from "@/types/supabase";
import { 
  Heart, 
  Bookmark, 
  Download, 
  Share2, 
  MessageSquare, 
  User,
  Calendar,
  Tag
} from "lucide-react";

const ImageDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [image, setImage] = useState<any>(null);
  const [creator, setCreator] = useState<any>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Get image details
        if (!id) return;
        
        const { data: imageData, error: imageError } = await supabase
          .from('images')
          .select('*')
          .eq('id', id)
          .single();
          
        if (imageError) {
          throw imageError;
        }
        
        if (!imageData) {
          navigate('/');
          return;
        }
        
        setImage(imageData);
        
        // Get creator details
        const { data: creatorData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', imageData.user_id)
          .single();
          
        setCreator(creatorData || { username: 'Usuário' });
        
        // Check if user has liked/saved this image
        if (user) {
          const { data: likedData } = await supabase
            .from('image_likes')
            .select('id')
            .eq('user_id', user.id)
            .eq('image_id', id)
            .single();
            
          setIsLiked(!!likedData);
          
          const { data: savedData } = await supabase
            .from('saved_images')
            .select('id')
            .eq('user_id', user.id)
            .eq('image_id', id)
            .single();
            
          setIsSaved(!!savedData);
        }
      } catch (error) {
        console.error('Error fetching image details:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, navigate]);
  
  const handleLike = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir imagens.",
      });
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike image
        await supabase
          .from('image_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', id);
          
        // Update likes count
        await supabase.rpc('decrement_image_likes', { image_id: id });
        
        // Update local state
        setIsLiked(false);
        setImage({ ...image, likes: Math.max(0, image.likes - 1) });
      } else {
        // Like image
        await supabase
          .from('image_likes')
          .insert({
            user_id: user.id,
            image_id: id
          });
          
        // Update likes count
        await supabase.rpc('increment_image_likes', { image_id: id });
        
        // Update local state
        setIsLiked(true);
        setImage({ ...image, likes: image.likes + 1 });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para salvar imagens.",
      });
      return;
    }
    
    try {
      if (isSaved) {
        // Unsave image
        await supabase
          .from('saved_images')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', id);
          
        // Update local state
        setIsSaved(false);
        
        toast({
          title: "Imagem removida",
          description: "A imagem foi removida da sua coleção.",
        });
      } else {
        // Save image
        await supabase
          .from('saved_images')
          .insert({
            user_id: user.id,
            image_id: id,
            image_url: image.image_url,
            title: image.title
          });
          
        // Update local state
        setIsSaved(true);
        
        toast({
          title: "Imagem salva",
          description: "A imagem foi adicionada à sua coleção.",
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };
  
  const handleDownload = () => {
    if (!image) return;
    
    const link = document.createElement('a');
    link.href = image.image_url;
    link.download = `${image.title}.${image.type === 'gif' ? 'gif' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download iniciado",
      description: "O download da imagem começou.",
    });
  };
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copiado",
      description: "O link para esta imagem foi copiado para sua área de transferência.",
    });
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container max-w-5xl mx-auto px-4 py-8">
          <Skeleton className="h-96 w-full rounded-lg mb-6" />
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-20 w-full mt-4" />
            </div>
            <div className="md:w-1/3">
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!image) return null;
  
  return (
    <Layout>
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{image.title}</h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-1 h-4 w-4" />
              {new Date(image.created_at).toLocaleDateString()}
            </div>
            
            {image.type === "gif" && (
              <Badge>GIF</Badge>
            )}
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="relative bg-black/5 rounded-lg overflow-hidden">
              <img 
                src={image.image_url}
                alt={image.title}
                className="w-full h-auto object-contain mx-auto max-h-[600px]"
              />
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleLike}
                  variant={isLiked ? "default" : "outline"}
                  size="sm"
                  className={isLiked ? "text-white" : ""}
                >
                  <Heart className={`mr-1 h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  {image.likes} curtidas
                </Button>
                
                <Button 
                  onClick={handleSave}
                  variant={isSaved ? "default" : "outline"}
                  size="sm"
                >
                  <Bookmark className={`mr-1 h-4 w-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Salvo" : "Salvar"}
                </Button>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleDownload}
                  variant="outline"
                  size="sm"
                >
                  <Download className="mr-1 h-4 w-4" />
                  Baixar
                </Button>
                
                <Button 
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                >
                  <Share2 className="mr-1 h-4 w-4" />
                  Compartilhar
                </Button>
              </div>
            </div>
            
            {image.description && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2">Descrição</h3>
                <p className="text-muted-foreground">{image.description}</p>
              </div>
            )}
            
            {image.tags && image.tags.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold mb-2 flex items-center">
                  <Tag className="mr-1 h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {image.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:w-1/3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <Link 
                    to={`/profile/${image.user_id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={creator?.avatar_url || ""} />
                      <AvatarFallback>
                        {creator?.username?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {creator?.username || "Usuário"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Criador
                      </p>
                    </div>
                  </Link>
                  
                  {user && user.id !== image.user_id && (
                    <Button variant="outline" size="sm">
                      <User className="mr-1 h-4 w-4" />
                      Seguir
                    </Button>
                  )}
                </div>
                
                <div className="py-4 border-t">
                  <h3 className="font-semibold mb-4">Comentários</h3>
                  
                  <div className="flex items-center justify-center py-6 text-muted-foreground">
                    <div className="text-center">
                      <MessageSquare className="mx-auto h-8 w-8 mb-2 opacity-50" />
                      <p>Sem comentários ainda</p>
                      <p className="text-sm">Seja o primeiro a comentar</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ImageDetail;
