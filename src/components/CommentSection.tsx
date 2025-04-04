
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HeartIcon, Flag, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export interface CommentData {
  id: string;
  user: {
    username: string;
    avatar: string;
  };
  content: string;
  likes: number;
  createdAt: string;
  replies?: CommentData[];
}

interface CommentSectionProps {
  clipId: string;
  comments: CommentData[];
}

const Comment = ({ comment }: { comment: CommentData }) => {
  const [liked, setLiked] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.user.avatar} />
          <AvatarFallback>{comment.user.username[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{comment.user.username}</span>
              <span className="text-xs text-muted-foreground">{comment.createdAt}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  <span>Reportar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <p className="mt-1 text-sm">{comment.content}</p>
          <div className="flex items-center gap-4 mt-2">
            <Button
              variant="ghost"
              size="sm"
              className={`px-2 py-1 h-auto text-xs ${liked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={() => setLiked(!liked)}
            >
              <HeartIcon className="h-3 w-3 mr-1" />
              <span>{comment.likes + (liked ? 1 : 0)}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="px-2 py-1 h-auto text-xs text-muted-foreground"
              onClick={() => setShowReplies(!showReplies)}
            >
              {comment.replies && comment.replies.length > 0
                ? showReplies
                  ? "Ocultar respostas"
                  : `Mostrar ${comment.replies.length} ${comment.replies.length === 1 ? 'resposta' : 'respostas'}`
                : "Responder"}
            </Button>
          </div>
          
          {showReplies && comment.replies && (
            <div className="mt-3 ml-2 pl-4 border-l border-border">
              {comment.replies.map((reply) => (
                <Comment key={reply.id} comment={reply} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ clipId, comments = [] }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async () => {
    if (newComment.trim()) {
      setIsSubmitting(true);
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) {
          toast({
            title: "Autenticação necessária",
            description: "Você precisa estar logado para comentar.",
            variant: "destructive",
          });
          return;
        }
        
        // Here you would normally send the comment to an API
        console.log("New comment on clip", clipId, ":", newComment);
        
        // Reset form
        setNewComment("");
        toast({
          title: "Comentário enviado",
          description: "Seu comentário foi enviado com sucesso.",
        });
      } catch (error: any) {
        toast({
          title: "Erro ao comentar",
          description: error.message || "Não foi possível enviar o comentário.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{comments.length} Comentários</h3>
      
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-end mt-2">
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? "Enviando..." : "Comentar"}
            </Button>
          </div>
        </div>
      </div>

      {comments.length > 0 ? (
        <div className="mt-6 space-y-6">
          {comments.map((comment) => (
            <Comment key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="mt-6 text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
