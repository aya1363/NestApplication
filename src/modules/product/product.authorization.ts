import { RoleEnum } from "../../common";

export const endPoint = {
    create: [RoleEnum.admin, RoleEnum.superAdmin],
    wishlist:[RoleEnum.user]
}