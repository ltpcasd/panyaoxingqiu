import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

interface JwtPayload {
  userId: string;
  openid: string;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('未提供认证令牌');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'panyaoxingqiu-jwt-secret-key-2024';
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret,
      });
      
      request['user'] = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('认证令牌无效或已过期');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

@Injectable()
export class OptionalJwtAuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (token) {
      try {
        const secret = this.configService.get<string>('JWT_SECRET') || 'panyaoxingqiu-jwt-secret-key-2024';
        const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret,
        });
        request['user'] = payload;
      } catch (error) {
        // 可选认证，失败不抛出异常
      }
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
