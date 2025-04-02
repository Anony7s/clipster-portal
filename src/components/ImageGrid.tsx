import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Bookmark, Share2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface ImageData {
  id: string;
  title: string;
  image_url: string;
  type: "image" | "gif";
  tags: string[];
  user_id: string;
  created_at: string;
  likes: number;
  username?: string;
  avatar_url?: string;
}

interface ImageGridProps {
  category?: string;
  layout?: "grid" | "masonry";
  limit?: number;
  userId?: string;
  filterType?: "saved" | "liked";
}

const ImageGrid = ({ category, layout = "grid", limit = 20, userId, filterType }: ImageGridProps) => {
  const [images, setImages] = useState<ImageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [savedImageIds, setSavedImageIds] = useState<string[]>([]);
  const [likedImageIds, setLikedImageIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        let imagesData: any[] = [];
        
        if (filterType === 'saved' && user) {
          const { data: savedData, error: savedError } = await supabase
            .from('saved_images')
            .select('image_id, image_url, title, created_at')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
            
          if (savedError) throw savedError;
          
          if (savedData && savedData.length > 0) {
            imagesData = await Promise.all(savedData.map(async (item) => {
              const { data: imageData } = await supabase
                .from('images')
                .select('*')
                .eq('id', item.image_id)
                .single();
                
              return imageData || { 
                id: item.image_id,
                image_url: item.image_url,
                title: item.title,
                created_at: item.created_at,
                likes: 0,
                type: 'image',
                tags: []
              };
            }));
          }
        } else if (filterType === 'liked' && userId) {
          const { data: likedData, error: likedError } = await supabase
            .from('image_likes')
            .select('image_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);
            
          if (likedError) throw likedError;
          
          if (likedData && likedData.length > 0) {
            const imageIds = likedData.map(item => item.image_id);
            
            const { data: imagesResult, error: imagesError } = await supabase
              .from('images')
              .select('*')
              .in('id', imageIds);
              
            if (imagesError) throw imagesError;
            
            if (imagesResult) {
              imagesData = imagesResult;
            }
          }
        } else {
          let query = supabase
            .from('images')
            .select(`
              id, 
              title, 
              image_url, 
              type,
              tags,
              user_id, 
              created_at, 
              likes
            `)
            .order('created_at', { ascending: false })
            .limit(limit);
            
          if (category) {
            query = query.contains('tags', [category]);
          }
          
          if (userId && !filterType) {
            query = query.eq('user_id', userId);
          }
          
          const { data: fetchedImages, error } = await query;
          
          if (error) throw error;
          
          if (fetchedImages) {
            imagesData = fetchedImages;
          }
        }
        
        if (imagesData.length > 0) {
          const imageWithUserDetails = await Promise.all(imagesData.map(async (image: any) => {
            if (!image) return null;
            
            const { data: userData } = await supabase
              .from('profiles')
              .select('username, avatar_url')
              .eq('id', image.user_id)
              .single();
              
            return {
              ...image,
              username: userData?.username || "Usuário",
              avatar_url: userData?.avatar_url || null
            };
          }));
          
          setImages(imageWithUserDetails.filter(Boolean));
        } else {
          setImages([]);
        }
        
        if (user) {
          const { data: savedData } = await supabase
            .from('saved_images')
            .select('image_id')
            .eq('user_id', user.id);
            
          if (savedData) {
            setSavedImageIds(savedData.map((item: any) => item.image_id));
          }
          
          const { data: likedData } = await supabase
            .from('image_likes')
            .select('image_id')
            .eq('user_id', user.id);
            
          if (likedData) {
            setLikedImageIds(likedData.map((item: any) => item.image_id));
          }
        }
      } catch (error) {
        console.error('Error fetching images:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as imagens.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchImages();
  }, [category, limit, userId, filterType, toast]);
  
  const handleLike = async (imageId: string) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para curtir imagens.",
      });
      return;
    }
    
    const isLiked = likedImageIds.includes(imageId);
    
    try {
      if (isLiked) {
        await supabase
          .from('image_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', imageId);
          
        setLikedImageIds(likedImageIds.filter(id => id !== imageId));
        
        await supabase.rpc('decrement_image_likes', { image_id: imageId });
        
        setImages(images.map(img => 
          img.id === imageId ? { ...img, likes: img.likes - 1 } : img
        ));
      } else {
        await supabase
          .from('image_likes')
          .insert({
            user_id: user.id,
            image_id: imageId
          });
          
        setLikedImageIds([...likedImageIds, imageId]);
        
        await supabase.rpc('increment_image_likes', { image_id: imageId });
        
        setImages(images.map(img => 
          img.id === imageId ? { ...img, likes: img.likes + 1 } : img
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao curtir a imagem.",
        variant: "destructive",
      });
    }
  };
  
  const handleSave = async (imageId: string, imageUrl: string, title: string) => {
    if (!user) {
      toast({
        title: "Faça login",
        description: "Você precisa estar logado para salvar imagens.",
      });
      return;
    }
    
    const isSaved = savedImageIds.includes(imageId);
    
    try {
      if (isSaved) {
        await supabase
          .from('saved_images')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', imageId);
          
        setSavedImageIds(savedImageIds.filter(id => id !== imageId));
        
        toast({
          title: "Imagem removida",
          description: "A imagem foi removida da sua coleção.",
        });
      } else {
        await supabase
          .from('saved_images')
          .insert({
            user_id: user.id,
            image_id: imageId,
            image_url: imageUrl,
            title: title
          });
          
        setSavedImageIds([...savedImageIds, imageId]);
        
        toast({
          title: "Imagem salva",
          description: "A imagem foi adicionada à sua coleção.",
        });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a imagem.",
        variant: "destructive",
      });
    }
  };
  
  const downloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-muted animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold mb-2">Nenhuma imagem encontrada</h3>
        <p className="text-muted-foreground mb-6">
          {filterType === 'saved'
            ? "Você ainda não salvou nenhuma imagem."
            : filterType === 'liked'
            ? "Você ainda não curtiu nenhuma imagem."
            : userId
            ? "Você ainda não fez upload de imagens."
            : "Nenhuma imagem disponível para esta categoria."}
        </p>
        {userId && !filterType && (
          <Button asChild>
            <Link to="/upload">Fazer Upload</Link>
          </Button>
        )}
      </div>
    );
  }

  if (layout === "masonry") {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
        {images.map(image => (
          <div key={image.id} className="break-inside-avoid mb-4">
            <ImageCard 
              image={image} 
              onLike={handleLike}
              onSave={handleSave}
              onDownload={downloadImage}
              isLiked={likedImageIds.includes(image.id)}
              isSaved={savedImageIds.includes(image.id)}
              isAuthenticated={!!user}
            />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map(image => (
        <ImageCard 
          key={image.id} 
          image={image} 
          onLike={handleLike}
          onSave={handleSave}
          onDownload={downloadImage}
          isLiked={likedImageIds.includes(image.id)}
          isSaved={savedImageIds.includes(image.id)}
          isAuthenticated={!!user}
        />
      ))}
    </div>
  );
};

interface ImageCardProps {
  image: ImageData;
  onLike: (id: string) => void;
  onSave: (id: string, url: string, title: string) => void;
  onDownload: (url: string, filename: string) => void;
  isLiked: boolean;
  isSaved: boolean;
  isAuthenticated: boolean;
}

const ImageCard = ({ 
  image, 
  onLike, 
  onSave, 
  onDownload,
  isLiked,
  isSaved,
  isAuthenticated 
}: ImageCardProps) => {
  const { toast } = useToast();
  
  return (
    <Card className="overflow-hidden group">
      <Link to={`/image/${image.id}`} className="block overflow-hidden">
        <div className="relative">
          <img 
            src={image.image_url}
            alt={image.title}
            className="w-full aspect-square object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {image.type === "gif" && (
            <Badge className="absolute top-2 right-2">GIF</Badge>
          )}
        </div>
      </Link>
      
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <Link to={`/profile/${image.user_id}`} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={image.avatar_url || ""} />
              <AvatarFallback>{image.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium truncate">{image.username}</span>
          </Link>
          
          <div className="text-xs text-muted-foreground">
            {new Date(image.created_at).toLocaleDateString()}
          </div>
        </div>
        
        <h3 className="font-medium mb-2 truncate">{image.title}</h3>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 ${isLiked ? 'text-red-500' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onLike(image.id);
              }}
            >
              <Heart className="h-4 w-4 mr-1" />
              <span>{image.likes}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className={`px-2 ${isSaved ? 'text-primary' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                onSave(image.id, image.image_url, image.title);
              }}
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2"
              onClick={(e) => {
                e.preventDefault();
                onDownload(image.image_url, `${image.title}.${image.type === 'gif' ? 'gif' : 'jpg'}`);
              }}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="px-2"
              onClick={(e) => {
                e.preventDefault();
                navigator.clipboard.writeText(window.location.origin + `/image/${image.id}`);
                toast({
                  title: "Link copiado",
                  description: "O link para esta imagem foi copiado para sua área de transferência.",
                });
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ImageGrid;
