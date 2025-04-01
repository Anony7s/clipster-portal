
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import ImageGrid from "@/components/ImageGrid";
import { typedSupabase as supabase } from "@/types/supabase";
import { 
  User, 
  Calendar, 
  MapPin, 
  Link as LinkIcon,
  Grid,
  Bookmark,
  Heart
} from "lucide-react";

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({
    totalImages: 0,
    totalLikes: 0,
    followers: 0,
    following: 0
  });
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
        
        if (!id) return;
        
        setIsCurrentUser(user?.id === id);
        
        // Get profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .single();
          
        if (profileError) throw profileError;
        
        setProfile(profileData);
        
        // Get stats
        const { data: imagesCount } = await supabase
          .from('images')
          .select('id', { count: 'exact' })
          .eq('user_id', id);
          
        // Get total likes for user
        const { data: likesData } = await supabase
          .rpc('get_user_total_likes', { user_id: id });
          
        setStats({
          totalImages: imagesCount?.length || 0,
          totalLikes: likesData?.[0]?.total_likes || 0,
          followers: 0, // To be implemented with a followers table
          following: 0  // To be implemented with a followers table
        });
        
        // Check if current user is following this profile
        if (user && user.id !== id) {
          // To be implemented with a followers table
          setIsFollowing(false);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);
  
  const handleFollow = async () => {
    // To be implemented with a followers table
    setIsFollowing(!isFollowing);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Skeleton className="h-32 w-32 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-48 mb-4" />
              <div className="flex gap-4 mb-4">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-16 w-full max-w-md" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!profile) return null;
  
  return (
    <Layout>
      <div className="container px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-8">
          <Avatar className="h-32 w-32">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback className="text-3xl">
              {profile.username?.[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold">{profile.username}</h1>
              
              {!isCurrentUser && currentUser && (
                <Button 
                  onClick={handleFollow}
                  variant={isFollowing ? "outline" : "default"}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </Button>
              )}
              
              {isCurrentUser && (
                <Button asChild variant="outline">
                  <Link to="/configuracoes">Editar Perfil</Link>
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-6 mb-6">
              <div className="text-center">
                <p className="font-bold">{stats.totalImages}</p>
                <p className="text-sm text-muted-foreground">Imagens</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{stats.totalLikes}</p>
                <p className="text-sm text-muted-foreground">Curtidas</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{stats.followers}</p>
                <p className="text-sm text-muted-foreground">Seguidores</p>
              </div>
              <div className="text-center">
                <p className="font-bold">{stats.following}</p>
                <p className="text-sm text-muted-foreground">Seguindo</p>
              </div>
            </div>
            
            {profile.bio && (
              <p className="mb-4 max-w-2xl">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center text-muted-foreground">
                <User className="mr-1 h-4 w-4" />
                Membro desde {new Date(profile.created_at).toLocaleDateString()}
              </div>
              
              {profile.website && (
                <a 
                  href={profile.website} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-primary hover:underline"
                >
                  <LinkIcon className="mr-1 h-4 w-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="images">
          <TabsList className="mb-8">
            <TabsTrigger value="images" className="flex items-center">
              <Grid className="mr-1 h-4 w-4" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center">
              <Bookmark className="mr-1 h-4 w-4" />
              Salvos
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center">
              <Heart className="mr-1 h-4 w-4" />
              Curtidos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="images">
            <ImageGrid userId={id} layout="grid" />
          </TabsContent>
          
          <TabsContent value="saved">
            {isCurrentUser ? (
              <ImageGrid userId={id} layout="grid" />
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-semibold mb-2">Conteúdo privado</h3>
                <p className="text-muted-foreground">
                  As imagens salvas deste usuário são privadas.
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="liked">
            <ImageGrid userId={id} layout="grid" />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default UserProfile;
