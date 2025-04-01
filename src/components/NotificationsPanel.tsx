import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, X, Check, Info, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Notification {
  id: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
}

export const NotificationsPanel = () => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch notifications - disabled automatic refetching
  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        return [];
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Notification[];
    },
    refetchOnWindowFocus: false, // Disable automatic refetch on window focus
    refetchOnMount: true, // Only fetch once when component mounts
  });

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível marcar notificação como lida.",
        variant: "destructive",
      });
    }
  });

  // Delete notification
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível excluir a notificação.",
        variant: "destructive",
      });
    }
  });

  // Clear all notifications
  const clearAllNotifications = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userData.user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram removidas."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível limpar as notificações.",
        variant: "destructive",
      });
    }
  });

  // Count unread notifications
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // Icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'info':
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Notificações</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 h-[calc(100vh-12rem)] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Carregando notificações...</p>
            </div>
          ) : notifications && notifications.length > 0 ? (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className={`p-3 border rounded-md relative transition-colors ${
                  notification.read ? 'bg-background' : 'bg-muted/30'
                }`}
              >
                <div className="flex gap-3">
                  <div className="mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${notification.read ? 'text-muted-foreground' : 'font-medium'}`}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6" 
                        onClick={() => markAsRead.mutate(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteNotification.mutate(notification.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Bell className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Não há notificações para exibir</p>
            </div>
          )}
        </div>
        
        {notifications && notifications.length > 0 && (
          <SheetFooter className="mt-4">
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => clearAllNotifications.mutate()}
              disabled={clearAllNotifications.isPending}
            >
              {clearAllNotifications.isPending ? "Limpando..." : "Limpar todas notificações"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default NotificationsPanel;
