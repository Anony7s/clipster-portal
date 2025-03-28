
import { Link } from "react-router-dom";
import { 
  Sidebar as SidebarComponent, 
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { 
  Home, 
  Flame, 
  Gamepad2, 
  Bookmark, 
  Heart, 
  Settings,
  FolderPlus,
  Upload,
  LogOut
} from "lucide-react";

// Jogos favoritos do usuário
const myGames = [
  { id: "1", name: "Fortnite" },
  { id: "2", name: "Valorant" },
  { id: "3", name: "League of Legends" },
  { id: "4", name: "CS:GO" },
  { id: "5", name: "Apex Legends" },
];

const Sidebar = () => {
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    window.location.href = "/";
  };

  return (
    <SidebarComponent>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Meu Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/">
                    <Home size={20} />
                    <span>Início</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/trending">
                    <Flame size={20} />
                    <span>Recentes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/upload">
                    <Upload size={20} />
                    <span>Upload</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/collections">
                    <FolderPlus size={20} />
                    <span>Coleções</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/bookmarks">
                    <Bookmark size={20} />
                    <span>Salvos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Meus Jogos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myGames.map((game) => (
                <SidebarMenuItem key={game.id}>
                  <SidebarMenuButton asChild>
                    <Link to={`/games/${game.id}`}>
                      <span>{game.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Minha Conta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/favorites">
                    <Heart size={20} />
                    <span>Favoritos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/settings">
                    <Settings size={20} />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={handleLogout}>
                  <LogOut size={20} />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="px-3 py-2">
        <div className="text-xs text-muted-foreground">
          © 2023 Minha Plataforma de Clipes
        </div>
      </SidebarFooter>
    </SidebarComponent>
  );
};

export default Sidebar;
