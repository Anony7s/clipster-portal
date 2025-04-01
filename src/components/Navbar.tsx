
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Upload,
  Menu,
  X,
  UserCircle,
  LogOut
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import NotificationsPanel from "./NotificationsPanel";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', user.id)
          .single();
          
        if (profile) {
          setAvatarUrl(profile.avatar_url);
          setUsername(profile.username || 'Perfil');
        }
      }
    };
    
    fetchUser();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        
        // If auth state changes, refetch profile
        if (session?.user) {
          fetchUser();
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
      
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message || "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <SidebarTrigger>
            <Button variant="ghost" size="icon">
              <Menu size={20} className="sidebar-open-icon" />
              <X size={20} className="sidebar-close-icon" />
            </Button>
          </SidebarTrigger>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-md flex items-center justify-center font-bold">P</span>
            <span className="font-bold text-lg hidden md:inline-block">PhotoBank</span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Pesquisar imagens..." 
              className="pl-10 bg-muted/50 border-muted" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {/* Mobile Search Toggle */}
        <div className="flex md:hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSearchOpen(!searchOpen)}
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground">
            <Link to="/upload">
              <Upload className="h-5 w-5" />
            </Link>
          </Button>
          
          <NotificationsPanel />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-8 w-8 cursor-pointer">
                  <AvatarImage src={avatarUrl || ""} />
                  <AvatarFallback className="bg-primary text-xs">
                    {username?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to={`/profile/${user.id}`} className="flex items-center">
                    <UserCircle className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/configuracoes" className="flex items-center">
                    Configurações
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} className="flex items-center text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" size="sm">
              <Link to="/auth">Entrar</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {searchOpen && (
        <div className="p-2 border-b border-border md:hidden">
          <form onSubmit={handleSearch} className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Pesquisar imagens..." 
              className="pl-10 bg-muted/50 border-muted w-full" 
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onBlur={() => setSearchOpen(false)}
            />
          </form>
        </div>
      )}
    </header>
  );
};

export default Navbar;
