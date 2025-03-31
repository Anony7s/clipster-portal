
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { FolderPlus, Plus, Folder } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Collection {
  id: string;
  name: string;
  description: string;
  clipsCount: number;
  cover: string;
}

// Placeholder cover images for collections
const coverImages = [
  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=2670&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2670&auto=format&fit=crop", 
  "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2670&auto=format&fit=crop"
];

const Collections = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [newCollection, setNewCollection] = useState({
    name: "",
    description: ""
  });
  
  const { data: collectionsData, isLoading, error } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Note: in a real implementation, you would have a collections table
      // This is a placeholder showing how to query and transform the data from Supabase
      const { data: clipsData, error: clipsError } = await supabase
        .from('clips')
        .select('game')
        .eq('user_id', userData.user.id);
      
      if (clipsError) throw clipsError;
      
      // Group clips by game to create "collections"
      const gameGroups: Record<string, number> = {};
      clipsData.forEach(clip => {
        if (gameGroups[clip.game]) {
          gameGroups[clip.game]++;
        } else {
          gameGroups[clip.game] = 1;
        }
      });
      
      // Transform game groups into collections
      const collections: Collection[] = [];
      let i = 0;
      
      for (const [game, count] of Object.entries(gameGroups)) {
        collections.push({
          id: (i + 1).toString(),
          name: game,
          description: `Seus clipes de ${game}`,
          clipsCount: count,
          cover: coverImages[i % coverImages.length]
        });
        i++;
      }
      
      return collections;
    },
    meta: {
      onError: (err: any) => {
        toast({
          title: "Erro ao carregar coleções",
          description: err.message || "Não foi possível carregar suas coleções.",
          variant: "destructive",
        });
      }
    }
  });
  
  useEffect(() => {
    if (collectionsData) {
      setCollections(collectionsData);
    }
  }, [collectionsData]);

  const handleAddCollection = () => {
    if (newCollection.name.trim() === "") {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a coleção.",
        variant: "destructive"
      });
      return;
    }
    
    const newCollectionData: Collection = {
      id: Date.now().toString(),
      name: newCollection.name,
      description: newCollection.description,
      clipsCount: 0,
      cover: coverImages[collections.length % coverImages.length]
    };
    
    setCollections([...collections, newCollectionData]);
    setNewCollection({ name: "", description: "" });
    
    toast({
      title: "Coleção criada",
      description: `A coleção "${newCollection.name}" foi criada com sucesso.`
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minhas Coleções</h1>
            <p className="text-muted-foreground mt-1">
              Organize seus clipes em coleções personalizadas
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nova Coleção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Nova Coleção</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nome
                  </label>
                  <Input
                    id="name"
                    value={newCollection.name}
                    onChange={(e) => setNewCollection({ ...newCollection, name: e.target.value })}
                    placeholder="Ex: Melhores Momentos"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Descrição (opcional)
                  </label>
                  <Input
                    id="description"
                    value={newCollection.description}
                    onChange={(e) => setNewCollection({ ...newCollection, description: e.target.value })}
                    placeholder="Uma breve descrição da coleção"
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button onClick={handleAddCollection}>Criar Coleção</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader className="py-3">
                  <div className="h-5 bg-muted animate-pulse rounded mb-2 w-3/4" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-60 border border-dashed rounded-lg p-8">
            <FolderPlus className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-center">Nenhuma coleção ainda</h3>
            <p className="text-muted-foreground text-center mt-1">Crie sua primeira coleção para organizar seus clipes</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <Card key={collection.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <div className="relative aspect-video overflow-hidden rounded-t-lg">
                  <img
                    src={collection.cover}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-white font-bold text-lg">{collection.name}</h3>
                    <p className="text-white/80 text-sm">{collection.clipsCount} clipes</p>
                  </div>
                </div>
                <CardContent className="pt-4">
                  <p className="text-muted-foreground text-sm line-clamp-2">{collection.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Collections;
