import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tokenName } from 'src/common/decorators';
import { tokenEnum } from 'src/common/enums';
import { TokenService } from 'src/common/services';



@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly reflector: Reflector,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 🔹 Get token type metadata if provided by decorator
    const tokenType: tokenEnum =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenEnum.access;
   // console.log(context,tokenType);
    
    let req: any;
    let authorization = '';

    // 🔹 Detect request type (HTTP / WS / RPC)
    switch (context.getType()) {
      case 'http': {
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;
      }

      
      // case 'rpc': { ... }
      // case 'ws': { ... }

      default:
        throw new UnauthorizedException('Unsupported request context');
    }

    if (!authorization) {
      throw new UnauthorizedException('Authorization header missing');
    }

    
    // 🔹 Decode and validate token
    const { decoded, user } = await this.tokenService.decodeToken({
      authorization,
      tokenType,
    });

    // 🔹 Attach user credentials to request
    req.credentials = { decoded, user };
    return true;
  }
}