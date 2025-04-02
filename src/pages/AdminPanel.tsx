
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Shield, Users, Image, ClipboardList } from "lucide-react";

const AdminPanel = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [images, setImages] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .rpc('is_admin', { user_id: user.id });
        
        if (error) throw error;
        
        setIsAdmin(data || false);
        
        if (data) {
          fetchUsers();
          fetchImages();
        }
      } catch (error: any) {
        console.error('Erro ao verificar status de administrador:', error);
        toast({
          title: 'Erro',
          description: 'Ocorreu um erro ao verificar suas permissões',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [toast]);

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, role, created_at, email:id(email)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de usuários',
        variant: 'destructive',
      });
    }
  };

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select(`
          id, 
          title, 
          image_url, 
          created_at, 
          likes, 
          user_id, 
          profiles:user_id (username)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setImages(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar imagens:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar a lista de imagens',
        variant: 'destructive',
      });
    }
  };

  const handleToggleAdmin = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      
      if (newRole === 'admin') {
        const { error } = await supabase.rpc('promote_to_admin', { target_user_id: userId });
        if (error) throw error;
      } else {
        const { error } = await supabase.rpc('demote_from_admin', { target_user_id: userId });
        if (error) throw error;
      }
      
      toast({
        title: 'Sucesso',
        description: `Usuário ${newRole === 'admin' ? 'promovido a administrador' : 'rebaixado para usuário normal'}`,
      });
      
      fetchUsers(); // Atualizar a lista após a mudança
    } catch (error: any) {
      console.error('Erro ao alterar cargo de usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Não foi possível alterar o cargo do usuário',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    try {
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);
      
      if (error) throw error;
      
      toast({
        title: 'Sucesso',
        description: 'Imagem excluída com sucesso',
      });
      
      fetchImages(); // Atualizar a lista após a exclusão
    } catch (error: any) {
      console.error('Erro ao excluir imagem:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a imagem',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8 flex items-center justify-center">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="container py-8">
          <Card>
            <CardHeader>
              <CardTitle>Acesso Negado</CardTitle>
              <CardDescription>
                Você não tem permissão para acessar o painel administrativo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Entre em contato com um administrador para obter acesso.</p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex items-center gap-2 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        </div>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-6">
            <TabsTrigger value="users">
              <Users className="h-4 w-4 mr-2" />
              Usuários
            </TabsTrigger>
            <TabsTrigger value="images">
              <Image className="h-4 w-4 mr-2" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="logs">
              <ClipboardList className="h-4 w-4 mr-2" />
              Logs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Usuários</CardTitle>
                <CardDescription>
                  Promova ou rebaixe usuários para controlar o acesso ao sistema.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Data de Cadastro</TableHead>
                        <TableHead>Cargo</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            {user.username || 'Sem nome'}
                          </TableCell>
                          <TableCell>{user.email?.email || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(user.created_at).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant={user.role === 'admin' ? "default" : "outline"}>
                              {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant={user.role === 'admin' ? "destructive" : "default"}
                              onClick={() => handleToggleAdmin(user.id, user.role)}
                            >
                              {user.role === 'admin' ? 'Rebaixar' : 'Promover'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="images">
            <Card>
              <CardHeader>
                <CardTitle>Gerenciamento de Imagens</CardTitle>
                <CardDescription>
                  Visualize e modere as imagens enviadas pelos usuários.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imagem</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Usuário</TableHead>
                        <TableHead>Curtidas</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {images.map((image) => (
                        <TableRow key={image.id}>
                          <TableCell>
                            <img 
                              src={image.image_url} 
                              alt={image.title} 
                              className="w-12 h-12 object-cover rounded-md" 
                            />
                          </TableCell>
                          <TableCell className="font-medium">{image.title}</TableCell>
                          <TableCell>{image.profiles?.username || 'Desconhecido'}</TableCell>
                          <TableCell>{image.likes}</TableCell>
                          <TableCell>{new Date(image.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteImage(image.id)}
                            >
                              Excluir
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Logs de Administração</CardTitle>
                <CardDescription>
                  Veja o histórico de ações realizadas por administradores.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Funcionalidade de logs ainda em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
