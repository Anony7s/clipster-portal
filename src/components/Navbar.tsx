
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Bell, 
  Search, 
  Upload,
  Menu,
  X
} from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";

const Navbar = () => {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4 lg:gap-6">
          <SidebarTrigger className="md:hidden">
            {({ open }) => (
              <Button variant="ghost" size="icon">
                {open ? <X size={20} /> : <Menu size={20} />}
              </Button>
            )}
          </SidebarTrigger>
          
          <Link to="/" className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground w-8 h-8 rounded-md flex items-center justify-center font-bold">C</span>
            <span className="font-bold text-lg hidden md:inline-block">Clipster</span>
          </Link>
        </div>

        {/* Desktop Search */}
        <div className="hidden md:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Pesquisar clipes..." 
              className="pl-10 bg-muted/50 border-muted" 
            />
          </div>
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
          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Bell className="h-5 w-5" />
          </Button>
          <Avatar className="h-8 w-8">
            <AvatarImage src="" />
            <AvatarFallback className="bg-primary text-xs">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Mobile Search Expanded */}
      {searchOpen && (
        <div className="p-2 border-b border-border md:hidden">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Pesquisar clipes..." 
              className="pl-10 bg-muted/50 border-muted w-full" 
              autoFocus
              onBlur={() => setSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
