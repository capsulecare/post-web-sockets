export interface User {
  id: string;
  name: string;
  avatar: string;
  title: string;
  verified?: boolean;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  createdAt: Date;
  reactions: Record<string, number>;
  userReaction?: string | null;
  replies?: Comment[];
}

export interface Post {
  id: string;
  author: User;
  content: string;
  tags: string[];
  createdAt: Date;
  reactions: Record<string, number>;
  userReaction: string | null;
  comments: Comment[];
  _lastUpdate?: number; // ✅ NUEVO: Campo para forzar re-renders
}

// Tipo para notificaciones de WebSocket
export interface NotificationReaction {
  targetId: string;
  targetType: 'POST' | 'COMMENT';
  reactionCounts: Record<string, number>;
  userReaction: string | null;
}