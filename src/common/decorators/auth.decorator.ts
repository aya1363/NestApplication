
import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, tokenEnum } from '../enums';
import { AuthenticationGuard } from '../guards/authentication/authentication.guard';
import { AuthorizationGuard } from '../guards/authorization/authorization.guard';
import { Token } from './token.type.decorator';
import { Roles } from './role.type.decorator';

export function Auth(roles: RoleEnum[],type=tokenEnum.access) {
    return applyDecorators(
        Token(type),
        Roles(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}