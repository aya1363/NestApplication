import { SetMetadata } from "@nestjs/common"
import { tokenEnum } from "../enums"


export const tokenName = 'tokenType'
export const Token = (type:tokenEnum = tokenEnum.access) => {
    return SetMetadata(tokenName,type)
}