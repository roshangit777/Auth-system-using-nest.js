import 'express';

declare module 'express' {
  export interface Request {
    user?: {
      sub: number;
      email: string;
      role: string;
    };
  }
}
