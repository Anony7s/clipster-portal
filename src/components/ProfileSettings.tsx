
import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon, CameraIcon } from "lucide-react";

// Form validation schema
const profileFormSchema = z.object({
  username: z.string().min(3, {
    message: "O nome de usuário deve ter pelo menos 3 caracteres.",
  }),
  bio: z.string().optional(),
  website: z.string().url({ message: "Informe uma URL válida" }).optional().or(z.literal('')),
  avatar_url: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export const ProfileSettings = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [savedImages, setSavedImages] = useState<{id: string, url: string, title: string}[]>([]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      bio: "",
      website: "",
      avatar_url: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Fetch profile data
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('username, avatar_url, bio, website')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          form.reset({
            username: profile.username || "",
            bio: profile.bio || "",
            website: profile.website || "",
            avatar_url: profile.avatar_url || "",
          });
          
          if (profile.avatar_url) {
            setAvatarPreview(profile.avatar_url);
          }
        }

        // Fetch saved images
        const { data: savedImagesData } = await supabase
          .from('saved_images')
          .select('id, image_url, title')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (savedImagesData) {
          setSavedImages(savedImagesData.map((img: any) => ({
            id: img.id,
            url: img.image_url,
            title: img.title
          })));
        }
      }
    };
    
    fetchProfile();
  }, [form]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (values: ProfileFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      let avatarUrl = values.avatar_url;
      
      // Upload the avatar if a new file was selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
        
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = data.publicUrl;
      }
      
      // Update the profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          bio: values.bio,
          website: values.website,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso.",
      });
      
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao atualizar o perfil.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeSavedImage = async (imageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('saved_images')
        .delete()
        .eq('id', imageId)
        .eq('user_id', user.id);
      
      if (error) throw error;

      // Update the local state
      setSavedImages(savedImages.filter(img => img.id !== imageId));
      
      toast({
        title: "Imagem removida",
        description: "A imagem foi removida da sua coleção.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao remover a imagem.",
        variant: "destructive",
      });
    }
  };

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="profile">Perfil</TabsTrigger>
        <TabsTrigger value="gallery">Minhas Imagens</TabsTrigger>
      </TabsList>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize suas informações de perfil e avatar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center mb-6">
                  <Avatar className="w-24 h-24 mb-4">
                    <AvatarImage src={avatarPreview || ""} />
                    <AvatarFallback>
                      {form.getValues("username")?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      id="avatar"
                      accept="image/*"
                      className="max-w-60"
                      onChange={handleFileChange}
                    />
                  </div>
                </div>
                
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome de usuário</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome de usuário" {...field} />
                      </FormControl>
                      <FormDescription>
                        Este é o nome que será exibido para outros usuários.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Biografia</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Conte um pouco sobre você..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://seusite.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Atualizando..." : "Atualizar Perfil"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="gallery">
        <Card>
          <CardHeader>
            <CardTitle>Minhas Imagens Salvas</CardTitle>
            <CardDescription>
              Gerencie as imagens e GIFs que você salvou.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {savedImages.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {savedImages.map(image => (
                  <div key={image.id} className="relative group">
                    <img 
                      src={image.url} 
                      alt={image.title} 
                      className="w-full h-40 object-cover rounded-md"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-md flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          variant="destructive"
                          size="sm"
                          onClick={() => removeSavedImage(image.id)}
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                    <p className="mt-1 text-sm font-medium truncate">{image.title}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mb-4" />
                <p>Você ainda não salvou nenhuma imagem.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/'}
                >
                  Explorar Imagens
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProfileSettings;
