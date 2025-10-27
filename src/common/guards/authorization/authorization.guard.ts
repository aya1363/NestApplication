import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { roleName } from 'src/common/decorators/role.type.decorator';
import { RoleEnum } from 'src/common/enums';
//import { Observable } from 'rxjs';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
  ) { }

  canActivate(context: ExecutionContext): boolean {
    // 🔹 Get token type metadata if provided by decorator
      const accessRoles: RoleEnum[] =
      this.reflector.getAllAndOverride<RoleEnum[]>(roleName, [
      context.getHandler(),
      context.getClass(),
    ]) ?? [];
    // console.log(context,tokenType);
    

    let role: RoleEnum = RoleEnum.user
   
    
    switch (context.getType()) {
      case 'http': {
      role = context.switchToHttp().getRequest().credentials.user.role;
      break;
      }
        
        

      
      // case 'rpc': { ... }
      // case 'ws': { ... }

      default: {
        break;
      }
    }
    console.log({accessRoles ,role});
    
    return accessRoles.includes(role);

  }
}