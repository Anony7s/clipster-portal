
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ImageDetail from "./pages/ImageDetail";
import UploadClip from "./pages/UploadClip";
import Collections from "./pages/Collections";
import NotFound from "./pages/NotFound";
import Favorites from "./pages/Favorites";
import Settings from "./pages/Settings";
import Bookmarks from "./pages/Bookmarks";
import Recentes from "./pages/Recentes";
import Auth from "./pages/Auth";
import AuthGuard from "./components/AuthGuard";
import UserProfile from "./pages/UserProfile";
import AdminPanel from "./pages/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthGuard>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/image/:id" element={<ImageDetail />} />
            <Route path="/upload" element={<UploadClip />} />
            <Route path="/collections" element={<Collections />} />
            <Route path="/favoritos" element={<Favorites />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/recentes" element={<Recentes />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile/:id" element={<UserProfile />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthGuard>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
