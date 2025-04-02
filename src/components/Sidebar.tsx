
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Image,
  Upload,
  FolderOpen,
  Heart,
  Settings,
  Bookmark,
  Clock,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { typedSupabase as supabase } from "@/types/supabase";

const Sidebar = () => {
  const location = useLocation();
  const { open, setOpen } = useSidebar();
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();

  useState(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao fazer logout.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Logout",
        description: "Logout efetuado com sucesso!",
      });
    }
  };

  const menuItems = [
    {
      path: "/",
      label: "Início",
      icon: Home,
    },
    {
      path: "/collections",
      label: "Coleções",
      icon: FolderOpen,
    },
    {
      path: "/upload",
      label: "Upload",
      icon: Upload,
    },
    {
      path: "/favoritos",
      label: "Favoritos",
      icon: Heart,
    },
    {
      path: "/bookmarks",
      label: "Bookmarks",
      icon: Bookmark,
    },
    {
      path: "/recentes",
      label: "Recentes",
      icon: Clock,
    },
    {
      path: "/configuracoes",
      label: "Configurações",
      icon: Settings,
    },
  ];

  const adminMenuItems = [
    {
      path: "/admin",
      label: "Admin Panel",
      icon: LayoutDashboard,
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <MenuIcon className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 pt-6">
        <div className="flex flex-col h-full">
          <SheetHeader className="px-6 pb-4">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>
              Navegue pelas opções do aplicativo.
            </SheetDescription>
          </SheetHeader>

          <div className="px-4 pb-4">
            {user ? (
              <Link to={`/profile/${user.id}`} className="flex items-center gap-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>{user?.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{user?.user_metadata?.username || user?.email}</span>
              </Link>
            ) : (
              <Link to="/auth" className="flex items-center gap-3 py-2 rounded-md hover:bg-secondary transition-colors">
                <User className="h-4 w-4" />
                <span className="text-sm font-medium">Entrar / Cadastrar</span>
              </Link>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div className="flex flex-col space-y-1 px-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 py-2 px-4 rounded-md hover:bg-secondary transition-colors ${location.pathname === item.path ? "bg-secondary text-foreground" : "text-muted-foreground"
                    }`}
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              {user?.app_metadata?.role === 'admin' && adminMenuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 py-2 px-4 rounded-md hover:bg-secondary transition-colors ${location.pathname === item.path ? "bg-secondary text-foreground" : "text-muted-foreground"
                    }`}
                  onClick={onClose}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
            </div>

            {user && (
              <div className="px-6 py-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Sidebar;

import { MenuIcon } from "lucide-react";
