
import { useState } from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Upload, X, ImageIcon, FileImageIcon } from "lucide-react";

const uploadFormSchema = z.object({
  title: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  description: z.string().optional(),
  tags: z.array(z.string()).min(1, "Selecione pelo menos uma tag"),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

const UploadClip = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [availableTags] = useState([
    "Perfil", "Paisagem", "Animais", "Comida", "Arte", "Memes", "Abstrato", "Tecnologia", "Esportes"
  ]);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: [],
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image or gif
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Formato inválido",
        description: "Por favor, selecione uma imagem ou GIF.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const toggleTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    if (currentTags.includes(tag)) {
      form.setValue(
        "tags",
        currentTags.filter((t) => t !== tag)
      );
    } else {
      form.setValue("tags", [...currentTags, tag]);
    }
  };

  const onSubmit = async (values: UploadFormValues) => {
    if (!imageFile) {
      toast({
        title: "Imagem não selecionada",
        description: "Por favor, selecione uma imagem para upload.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);

      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Não autorizado",
          description: "Você precisa estar logado para fazer upload.",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // 2. Upload image to storage
      const fileExt = imageFile.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      const filePath = `images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      // 3. Get public URL
      const { data } = supabase.storage.from("images").getPublicUrl(filePath);

      // 4. Save image metadata to database
      const { error: insertError } = await supabase.from("images").insert({
        title: values.title,
        description: values.description || null,
        image_url: data.publicUrl,
        user_id: user.id,
        type: imageFile.type.includes("gif") ? "gif" : "image",
        tags: values.tags,
        likes: 0,
      });

      if (insertError) throw insertError;

      toast({
        title: "Upload concluído",
        description: "Sua imagem foi enviada com sucesso!",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro durante o upload.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Upload de Imagem</h1>

        <Card>
          <CardHeader>
            <CardTitle>Nova Imagem</CardTitle>
            <CardDescription>
              Compartilhe suas melhores imagens e GIFs com a comunidade.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="mx-auto max-h-80 max-w-full rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="py-8">
                      <div className="flex flex-col items-center">
                        <div className="mb-4">
                          {imageFile?.type.includes("gif") ? (
                            <FileImageIcon className="h-12 w-12 text-muted-foreground" />
                          ) : (
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          )}
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground">
                          Arraste e solte uma imagem ou GIF aqui, ou clique para
                          selecionar
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG ou GIF (máx. 5MB)
                        </p>
                        <Label htmlFor="image-upload">
                          <div className="mt-4 inline-flex cursor-pointer items-center justify-center rounded bg-primary px-3 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
                            <Upload className="mr-2 h-4 w-4" />
                            Selecionar Arquivo
                          </div>
                        </Label>
                      </div>
                    </div>
                  )}
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Digite um título para sua imagem"
                            {...field}
                          />
                        </FormControl>
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
                            placeholder="Adicione uma descrição (opcional)"
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
                    name="tags"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant={
                                  form.getValues("tags").includes(tag)
                                    ? "default"
                                    : "outline"
                                }
                                className="cursor-pointer"
                                onClick={() => toggleTag(tag)}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={uploading || !imageFile}
                  >
                    {uploading ? "Enviando..." : "Publicar Imagem"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UploadClip;
