import { Request, Response, NextFunction, RequestHandler } from 'express'
import { ParamsDictionary } from 'express-serve-static-core'
import { AuthRequest } from '../../auth'

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://yumi77965.online'
];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
  preflightContinue: false
};

// Shared interfaces
interface User {
  id: string
  isPaid?: boolean
}

interface ExtendedUser extends User {
  isPaid?: boolean
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatRequest {
  message?: string
  messages?: ChatMessage[]
  mode: 'agent' | 'assistant'
  provider?: 'openai' | 'qwen' | 'claude'
  model?: string
}

// Type-safe route handler that ensures void return type
export type SafeRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Type-safe authenticated route handler
export type SafeAuthenticatedHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Helper function to wrap route handlers and ensure void return
export const wrapHandler = <T>(handler: RequestHandler | ((req: Request, res: Response) => T | Promise<T> | void)): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (handler.length === 3) {
        // If handler takes 3 parameters, it's already a RequestHandler
        await (handler as RequestHandler)(req, res, next);
      } else {
        // If handler takes 2 parameters, it's our simplified handler
        const result = await Promise.resolve((handler as (req: Request, res: Response) => T | Promise<T> | void)(req, res));
        if (result !== undefined && !res.headersSent) {
          res.json(result);
        }
      }
    } catch (error) {
      next(error);
    }
  };
};

// Helper function to wrap authenticated route handlers
export const wrapAuthHandler = <T>(handler: ((req: AuthRequest, res: Response) => T | Promise<T> | void)): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await Promise.resolve(handler(req as AuthRequest, res));
      if (result !== undefined && !res.headersSent) {
        res.json(result);
      }
    } catch (error) {
      next(error);
    }
  };
};

// Request handler type for authenticated routes
export type AuthenticatedRequestHandler<P = ParamsDictionary, ResBody = any, ReqBody = any> = 
  (req: AuthRequest & Request<P, ResBody, ReqBody>, res: Response<ResBody>, next: NextFunction) => Promise<void> | void;

// Additional types for modules
export interface Figure {
  id: string;
  userId: string;
  title: string;
  type: string;
  caption?: string | null;
  source?: string | null;
  format: string;
  dataJson?: string | null;
  configJson?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Citation {
  id: string;
  userId?: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  url?: string;
  citationStyle: string;
  formattedCitation: string;
}

export interface Equation {
  id: string;
  userId: string;
  latex: string;
  description?: string;
  displayMode: boolean;
  number: number;
  createdAt: Date;
  updatedAt: Date;
}

export { User, ExtendedUser, ChatMessage } 