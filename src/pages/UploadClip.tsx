
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { 
  Upload, 
  UploadCloud, 
  X, 
  Play, 
  Video, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle
} from "lucide-react";
import Layout from "@/components/Layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const games = [
  { id: "valorant", name: "Valorant" },
  { id: "csgo", name: "CS:GO" },
  { id: "lol", name: "League of Legends" },
  { id: "fortnite", name: "Fortnite" },
  { id: "apex", name: "Apex Legends" },
  { id: "overwatch", name: "Overwatch" },
  { id: "rocket_league", name: "Rocket League" },
  { id: "cod", name: "Call of Duty" },
  { id: "minecraft", name: "Minecraft" },
  { id: "gta5", name: "GTA V" },
];

const formSchema = z.object({
  title: z.string().min(5, {
    message: "O título deve ter pelo menos 5 caracteres.",
  }).max(100, {
    message: "O título não pode ter mais de 100 caracteres.",
  }),
  description: z.string().max(500, {
    message: "A descrição não pode ter mais de 500 caracteres.",
  }).optional(),
  game: z.string({
    required_error: "Por favor selecione um jogo.",
  }),
  tags: z.string().optional(),
});

// Maximum file size: 50MB (decreased from 500MB)
const MAX_FILE_SIZE = 50 * 1024 * 1024;

const UploadClip = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [fileSizeError, setFileSizeError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      game: "",
      tags: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileSizeError(null);
    
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      if (!selectedFile.type.startsWith("video/")) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, selecione um arquivo de vídeo válido.",
          variant: "destructive",
        });
        return;
      }
      
      // Check file size - reduced to 50MB
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileSizeError(`O arquivo excede o tamanho máximo permitido de 50MB. Seu arquivo tem ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`);
        return;
      }
      
      setFile(selectedFile);
      
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      
      if (!selectedFile.type.startsWith("image/")) {
        toast({
          title: "Formato não suportado",
          description: "Por favor, selecione um arquivo de imagem válido.",
          variant: "destructive",
        });
        return;
      }
      
      setThumbnail(selectedFile);
      const url = URL.createObjectURL(selectedFile);
      setThumbnailPreview(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setFileSizeError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim()) && tags.length < 10) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const getVideoDuration = async (videoFile: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const duration = video.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        resolve(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      };
      video.src = URL.createObjectURL(videoFile);
    });
  };

  const simulateProgressUpdate = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 10;
      if (progress > 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(Math.floor(progress));
    }, 300);
    
    return interval;
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um vídeo para upload.",
        variant: "destructive",
      });
      return;
    }
    
    if (fileSizeError) {
      toast({
        title: "Erro de tamanho de arquivo",
        description: fileSizeError,
        variant: "destructive",
      });
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Start progress simulation
    const progressInterval = simulateProgressUpdate();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const videoFileName = `${user.id}/${uuidv4()}-${file.name}`;
      let thumbnailFileName = null;
      
      // Upload video file
      const videoUpload = await supabase.storage
        .from('clip_videos')
        .upload(videoFileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (videoUpload.error) {
        console.error("Erro no upload do vídeo:", videoUpload.error);
        throw new Error(`Erro ao fazer upload do vídeo: ${videoUpload.error.message}`);
      }
      
      const { data: videoUrl } = supabase.storage
        .from('clip_videos')
        .getPublicUrl(videoFileName);
      
      // Upload thumbnail if provided
      let thumbnailUrl = null;
      if (thumbnail && thumbnail.size < 5 * 1024 * 1024) { // 5MB max for thumbnails
        thumbnailFileName = `${user.id}/${uuidv4()}-${thumbnail.name}`;
        
        const thumbnailUpload = await supabase.storage
          .from('clip_thumbnails')
          .upload(thumbnailFileName, thumbnail, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (thumbnailUpload.error) {
          console.error("Erro no upload da thumbnail:", thumbnailUpload.error);
          // Continue even if thumbnail upload fails
        } else {
          const { data: thumbUrl } = supabase.storage
            .from('clip_thumbnails')
            .getPublicUrl(thumbnailFileName);
          
          thumbnailUrl = thumbUrl.publicUrl;
        }
      }
      
      // Get video duration
      const duration = await getVideoDuration(file);
      
      // Insert clip data into database
      const { error: insertError } = await supabase
        .from('clips')
        .insert({
          user_id: user.id,
          title: values.title,
          description: values.description || null,
          game: values.game,
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl.publicUrl,
          duration: duration,
        });
      
      if (insertError) throw insertError;
      
      // Fetch the created clip to get its ID
      const { data: clipData, error: fetchError } = await supabase
        .from('clips')
        .select('id')
        .eq('user_id', user.id)
        .eq('title', values.title)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Insert tags if any
      if (tags.length > 0 && clipData) {
        const tagInserts = tags.map(tag => ({
          clip_id: clipData.id,
          tag: tag.toLowerCase()
        }));
        
        const { error: tagError } = await supabase
          .from('clip_tags')
          .insert(tagInserts);
        
        if (tagError) {
          console.error("Erro ao adicionar tags:", tagError);
          // Continue even if tag insertion fails
        }
      }
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      toast({
        title: "Upload concluído com sucesso!",
        description: "Seu clipe foi enviado e já está disponível.",
      });
      
      // Create a notification for the user
      await supabase.rpc('create_notification', {
        p_user_id: user.id,
        p_message: `Seu clipe "${values.title}" foi carregado com sucesso!`,
        p_type: 'success'
      });
      
      // Navigate to home after successful upload
      setTimeout(() => {
        navigate("/");
      }, 1500);
      
    } catch (error: any) {
      clearInterval(progressInterval);
      console.error("Erro ao fazer upload:", error);
      
      toast({
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao enviar seu clipe. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload de Novo Clipe</h1>
          <p className="text-muted-foreground mt-1">Compartilhe seus melhores momentos com a comunidade</p>
        </div>

        {fileSizeError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro de tamanho de arquivo</AlertTitle>
            <AlertDescription>{fileSizeError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Vídeo</CardTitle>
              <CardDescription>Faça upload do seu clipe (máx. 50MB)</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-1">Arraste e solte seu vídeo aqui</p>
                  <p className="text-xs text-muted-foreground mb-3">MP4, MOV, WEBM até 50MB</p>
                  <Button size="sm" className="mt-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Selecionar Arquivo
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="video/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    {preview && (
                      <video 
                        src={preview} 
                        className="w-full h-full object-cover" 
                        controls
                      />
                    )}
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium truncate">{file.name}</p>
                    <p>{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardHeader>
              <CardTitle>Thumbnail</CardTitle>
              <CardDescription>Opcional - Use uma imagem personalizada</CardDescription>
            </CardHeader>
            <CardContent>
              {!thumbnail ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => thumbnailInputRef.current?.click()}
                >
                  <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Upload de thumbnail personalizada</p>
                  <Button size="sm" variant="outline">
                    Selecionar Imagem
                  </Button>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleThumbnailChange}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={thumbnailPreview} 
                      alt="Thumbnail" 
                      className="w-full h-full object-cover" 
                    />
                    <Button 
                      variant="destructive" 
                      size="icon" 
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={handleRemoveThumbnail}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Detalhes do Clipe</CardTitle>
              <CardDescription>Preencha as informações sobre seu clipe</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input placeholder="Um título descritivo para seu clipe" {...field} />
                        </FormControl>
                        <FormDescription>
                          Um bom título ajuda seu clipe a ser descoberto
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Conte mais sobre esse momento..."
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Descreva o que acontece no clipe e por que ele é incrível
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="game"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Jogo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o jogo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <ScrollArea className="h-80">
                              {games.map((game) => (
                                <SelectItem key={game.id} value={game.id}>
                                  {game.name}
                                </SelectItem>
                              ))}
                            </ScrollArea>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Categorizar pelo jogo correto aumenta a visibilidade
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Adicionar tag..."
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleKeyDown}
                      />
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={handleAddTag}
                        disabled={!currentTag.trim() || tags.includes(currentTag.trim()) || tags.length >= 10}
                      >
                        Adicionar
                      </Button>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className="flex items-center gap-1 hover:bg-secondary/20"
                          >
                            {tag}
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-3 w-3 rounded-full"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              <X className="h-2 w-2" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <FormDescription>
                      Até 10 tags para ajudar outros a encontrar seu clipe
                    </FormDescription>
                  </FormItem>

                  {isUploading ? (
                    <div className="space-y-4">
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-center text-sm">
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        <span>Enviando... {uploadProgress}%</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end space-x-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => navigate("/")}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        disabled={!file || !!fileSizeError}
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Publicar Clipe
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default UploadClip;
