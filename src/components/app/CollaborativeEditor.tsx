"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Users, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { pusherClient } from "@/lib/pusher";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; y: number };
}

interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  selection: { start: number; end: number };
  timestamp: Date;
}

interface CollaborativeEditorProps {
  documentId: string;
  initialContent: string;
  onContentChange: (content: string) => void;
  className?: string;
}

const USER_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
];

export function CollaborativeEditor({
  documentId,
  initialContent,
  onContentChange,
  className = ""
}: CollaborativeEditorProps) {
  const [content, setContent] = useState(initialContent);
  const [activeUsers, setActiveUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedText, setSelectedText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Generate a unique user ID and color
  const userId = useRef(`user-${Math.random().toString(36).substr(2, 9)}`);
  const userColor = useRef(USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)]);
  const userName = useRef(`User ${Math.floor(Math.random() * 1000)}`);

  // Connect to Pusher
  useEffect(() => {
    const channel = pusherClient.subscribe(`document-${documentId}`);

    // Handle user joined
    channel.bind('user-joined', (user: User) => {
      setActiveUsers(prev => {
        if (prev.find(u => u.id === user.id)) return prev;
        return [...prev, user];
      });

      if (user.id !== userId.current) {
        toast({
          title: "User Joined",
          description: `${user.name} joined the document`,
        });
      }
    });

    // Handle user left
    channel.bind('user-left', (user: User) => {
      setActiveUsers(prev => prev.filter(u => u.id !== user.id));

      if (user.id !== userId.current) {
        toast({
          title: "User Left",
          description: `${user.name} left the document`,
        });
      }
    });

    // Handle content updates
    channel.bind('content-updated', (data: { userId: string; content: string; cursor?: { x: number; y: number } }) => {
      if (data.userId !== userId.current) {
        setContent(data.content);
        onContentChange(data.content);

        // Update cursor position for other users
        if (data.cursor) {
          setActiveUsers(prev =>
            prev.map(user =>
              user.id === data.userId
                ? { ...user, cursor: data.cursor }
                : user
            )
          );
        }
      }
    });

    // Handle comments
    channel.bind('comment-added', (comment: Comment) => {
      setComments(prev => [...prev, comment]);

      if (comment.userId !== userId.current) {
        toast({
          title: "New Comment",
          description: `${comment.userName} added a comment`,
        });
      }
    });

    // Join the document
    channel.bind('pusher:subscription_succeeded', () => {
      setIsConnected(true);
      // Note: In a real app, you'd send this through a server action
      // For now, we'll just set the connection state
    });

    return () => {
      // Leave the document
      // Note: In a real app, you'd send this through a server action
      pusherClient.unsubscribe(`document-${documentId}`);
    };
  }, [documentId, onContentChange, toast]);

  // Handle content changes
  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    onContentChange(newContent);

    // Broadcast the change
    if (isConnected) {
      const cursor = textareaRef.current ? {
        x: textareaRef.current.selectionStart,
        y: textareaRef.current.selectionEnd,
      } : undefined;

      // Note: In a real app, you'd send this through a server action
      // For now, we'll just log the change
      console.log('Content updated:', { userId: userId.current, content: newContent, cursor });
    }
  }, [documentId, onContentChange, isConnected]);

  // Handle text selection
  const handleTextSelection = useCallback(() => {
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const selected = textareaRef.current.value.substring(start, end);
      setSelectedText(selected);
    }
  }, []);

  // Add comment
  const addComment = useCallback((commentText: string) => {
    if (!selectedText || !commentText.trim()) return;

    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: userId.current,
      userName: userName.current,
      text: commentText,
      selection: {
        start: textareaRef.current?.selectionStart || 0,
        end: textareaRef.current?.selectionEnd || 0,
      },
      timestamp: new Date(),
    };

    setComments(prev => [...prev, comment]);

    // Broadcast the comment
    if (isConnected) {
      // Note: In a real app, you'd send this through a server action
      // For now, we'll just log the comment
      console.log('Comment added:', comment);
    }
  }, [selectedText, documentId, isConnected]);

  return (
    <TooltipProvider>
      <div className={`space-y-4 ${className}`}>
        {/* Active Users */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Active Users ({activeUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 flex-wrap">
              {activeUsers.map((user) => (
                <Tooltip key={user.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className="text-xs"
                          style={{ backgroundColor: user.color, color: 'white' }}
                        >
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium">{user.name}</span>
                      {user.cursor && (
                        <div
                          className="w-1 h-4 animate-pulse"
                          style={{ backgroundColor: user.color }}
                        />
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{user.name} is editing</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Document Editor</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Connecting..."}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              onSelect={handleTextSelection}
              className="min-h-[300px] font-mono text-sm"
              placeholder="Start typing your contract content..."
            />

            {/* Comment Interface */}
            {selectedText && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  Selected: "{selectedText}"
                </p>
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Add a comment..."
                    className="flex-1 text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        const target = e.target as HTMLTextAreaElement;
                        addComment(target.value);
                        target.value = '';
                        setSelectedText('');
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder="Add a comment..."]') as HTMLTextAreaElement;
                      if (textarea) {
                        addComment(textarea.value);
                        textarea.value = '';
                        setSelectedText('');
                      }
                    }}
                  >
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Comments */}
        {comments.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Comments ({comments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div key={comment.id} className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback
                          className="text-xs"
                          style={{
                            backgroundColor: activeUsers.find(u => u.id === comment.userId)?.color || '#6B7280',
                            color: 'white'
                          }}
                        >
                          {comment.userName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{comment.userName}</span>
                      <span className="text-xs text-muted-foreground">
                        {comment.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{comment.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      On: "{content.substring(comment.selection.start, comment.selection.end)}"
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </TooltipProvider>
  );
}

