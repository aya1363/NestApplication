
import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const User = createParamDecorator(
    (data: unknown, context: ExecutionContext) => {
        let req: any;
    switch (context.getType()) {
        case 'http': {
        
        req = context.switchToHttp().getRequest()
            break;
        }

        
         // case 'rpc': { ... }
         // case 'ws': { ... }

        default:
            throw new UnauthorizedException('Unsupported request context');
    }

        return req.credentials.user;
},
);