import { JwtPayload } from "jsonwebtoken";
import type{ UserDocument } from "src/DB/Model";
import { tokenEnum } from "../enums";
import { Types } from "mongoose";
import { IUser } from "./user.interface";


export interface IToken {
    _id?: Types.ObjectId;
    jti: string;
    expiredAt: Date;
    createdAT?: Date
    updatedAT?:Date
    confirmedAt?: Date;
    createdBy: Types.ObjectId | IUser;
}
export interface ICredentials{
    user: UserDocument;
    decoded:JwtPayload
}

export interface IAuthRequest {
    credentials: ICredentials;
    tokenType:tokenEnum
}