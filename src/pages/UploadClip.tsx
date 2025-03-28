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
  Loader2 
} from "lucide-react";
import Layout from "@/components/Layout";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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

const UploadClip = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
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
      
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho máximo permitido é 500MB.",
          variant: "destructive",
        });
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
      
      const url = URL.createObjectURL(selectedFile);
      setThumbnail(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnail(null);
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um vídeo para upload.",
        variant: "destructive",
      });
      return;
    }
    
    const tagString = tags.join(",");
    
    const uploadData = {
      ...values,
      tags: tags,
      fileName: file.name,
      fileSize: file.size,
    };
    
    setIsUploading(true);
    
    const simulateUpload = () => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) {
          progress = 100;
          clearInterval(interval);
          
          setTimeout(() => {
            saveClipToStorage(uploadData);
            setIsUploading(false);
            setUploadProgress(0);
            toast({
              title: "Upload concluído com sucesso!",
              description: "Seu clipe foi enviado e está sendo processado.",
            });
            navigate("/");
          }, 500);
        }
        setUploadProgress(Math.floor(progress));
      }, 300);
    };
    
    simulateUpload();
  };

  const saveClipToStorage = (uploadData: any) => {
    try {
      const clipId = `clip_${Date.now()}`;
      
      const newClip = {
        id: clipId,
        title: uploadData.title,
        description: uploadData.description || "",
        game: uploadData.game,
        thumbnail: thumbnail || "/placeholder.svg",
        views: 0,
        date: new Date().toISOString(),
        duration: "00:30",
        tags: uploadData.tags,
      };
      
      const existingClipsJSON = localStorage.getItem("uploadedClips");
      let existingClips = existingClipsJSON ? JSON.parse(existingClipsJSON) : [];
      
      existingClips = [newClip, ...existingClips];
      
      localStorage.setItem("uploadedClips", JSON.stringify(existingClips));
      
      console.log("Clip saved to localStorage:", newClip);
    } catch (error) {
      console.error("Error saving clip to localStorage:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar seu clipe. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Upload de Novo Clipe</h1>
          <p className="text-muted-foreground mt-1">Compartilhe seus melhores momentos com a comunidade</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Vídeo</CardTitle>
              <CardDescription>Faça upload do seu clipe</CardDescription>
            </CardHeader>
            <CardContent>
              {!file ? (
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadCloud className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-1">Arraste e solte seu vídeo aqui</p>
                  <p className="text-xs text-muted-foreground mb-3">MP4, MOV, WEBM até 500MB</p>
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
                      src={thumbnail} 
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
                      <Button type="submit" disabled={!file}>
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
