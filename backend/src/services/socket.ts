import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../config/prisma';

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string };
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, role: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.data.user.id}`);

    socket.join(`user:${socket.data.user.id}`);

    socket.on('joinConversation', async (conversationId: string) => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });

      if (conversation && 
          (conversation.buyerId === socket.data.user.id || 
           conversation.sellerId === socket.data.user.id)) {
        socket.join(conversationId);
      }
    });

    socket.on('leaveConversation', (conversationId: string) => {
      socket.leave(conversationId);
    });

    socket.on('typing', (conversationId: string) => {
      socket.to(conversationId).emit('userTyping', {
        conversationId,
        userId: socket.data.user.id,
      });
    });

    socket.on('stopTyping', (conversationId: string) => {
      socket.to(conversationId).emit('userStoppedTyping', {
        conversationId,
        userId: socket.data.user.id,
      });
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.data.user.id}`);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitNewMessage = (conversationId: string, message: any) => {
  io.to(conversationId).emit('newMessage', message);
};

export const emitUserOnline = (userId: string) => {
  io.emit('userOnline', { userId });
};

export const emitUserOffline = (userId: string) => {
  io.emit('userOffline', { userId });
};
