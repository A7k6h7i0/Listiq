import { Role } from '@prisma/client';
import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
      };
    }
  }
}

export interface AuthRequest extends Request {
  user?: Express.Request['user'];
}

export interface TokenPayload {
  id: string;
  email: string;
  role: Role;
}

export interface RefreshTokenPayload {
  id: string;
  email: string;
}
