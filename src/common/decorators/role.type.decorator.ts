import { SetMetadata } from "@nestjs/common"
import { RoleEnum } from "../enums"


export const roleName = 'Role'
export const Roles = (accessRoles: RoleEnum[]) => {
    return SetMetadata(roleName, accessRoles)
}
