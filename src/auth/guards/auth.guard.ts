import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

interface Payload {
  sub: number;
  email: string;
  role: string;
}
interface AuthRequest extends Request {
  user?: Payload;
  /* interface Request {
  headers: IncomingHttpHeaders;
  body: any;
  params: any;
  query: any; */
  // ...but there's NO 'user' property here!
  //}
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthRequest>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('Token missing');
    }

    try {
      const secret = 'jwtsecret';
      if (!secret) throw new Error('JWT_SECRET not defined');

      const payload: Payload = await this.jwtService.verifyAsync(token, {
        secret,
      });

      if (!payload) {
        throw new NotFoundException('Invalid Token');
      }
      // assign payload safely
      request.user = payload;
    } catch (error) {
      if (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) return undefined;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
