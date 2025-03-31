
import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Flame, Calendar, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface Clip {
  id: string;
  title: string;
  game: string;
  thumbnail_url: string;
  views: number;
  created_at: string;
  duration: string;
}

const Recentes = () => {
  const [timeFilter, setTimeFilter] = useState<'esta_semana' | 'este_mes' | 'todos'>('esta_semana');

  const { data: clips, isLoading, error } = useQuery({
    queryKey: ['recentClips', timeFilter],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      let query = supabase
        .from('clips')
        .select('*')
        .order('created_at', { ascending: false });
      
      // Apply time filter
      const now = new Date();
      if (timeFilter === 'esta_semana') {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        query = query.gte('created_at', lastWeek.toISOString());
      } else if (timeFilter === 'este_mes') {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        query = query.gte('created_at', lastMonth.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      return data as Clip[];
    },
    meta: {
      onError: (err: any) => {
        toast({
          title: "Erro ao carregar clipes recentes",
          description: err.message || "Não foi possível carregar os clipes recentes.",
          variant: "destructive",
        });
      }
    }
  });

  return (
    <Layout>
      <div className="container">
        <div className="flex items-center mb-6">
          <Flame className="h-6 w-6 mr-2 text-orange-500" />
          <h1 className="text-3xl font-bold">Clipes Recentes</h1>
        </div>

        <Tabs 
          defaultValue="esta_semana" 
          value={timeFilter}
          onValueChange={(value) => setTimeFilter(value as 'esta_semana' | 'este_mes' | 'todos')}
          className="mb-6"
        >
          <TabsList>
            <TabsTrigger value="esta_semana">Esta Semana</TabsTrigger>
            <TabsTrigger value="este_mes">Este Mês</TabsTrigger>
            <TabsTrigger value="todos">Todos</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardHeader className="py-3">
                  <div className="h-5 bg-muted animate-pulse rounded mb-2 w-3/4" />
                  <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : clips && clips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clips.map((clip) => (
              <Card key={clip.id} className="overflow-hidden group">
                <Link to={`/clips/${clip.id}`}>
                  <div className="relative aspect-video">
                    <img
                      src={clip.thumbnail_url || "/placeholder.svg"}
                      alt={clip.title}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="secondary" size="sm">
                        <Play className="h-4 w-4 mr-2" />
                        Assistir
                      </Button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                      {clip.duration}
                    </div>
                  </div>
                </Link>
                <CardHeader className="py-3">
                  <CardTitle className="text-base">{clip.title}</CardTitle>
                  <CardDescription>{clip.game}</CardDescription>
                </CardHeader>
                <CardFooter className="py-2 text-xs text-muted-foreground">
                  <div className="flex justify-between w-full">
                    <span>{clip.views} visualizações</span>
                    <span className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      {new Date(clip.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center p-12 max-w-md mx-auto">
            <CardHeader>
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <CardTitle>Nenhum clipe recente</CardTitle>
              <CardDescription>
                Não há clipes recentes para exibir no período selecionado.
              </CardDescription>
            </CardHeader>
            <CardFooter className="justify-center">
              <Button asChild>
                <Link to="/upload">Fazer upload de clipes</Link>
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Recentes;
