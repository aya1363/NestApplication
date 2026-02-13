import { Types } from "mongoose";
import { GenderEnum, PreferredLanguage, ProviderEnum, RoleEnum } from "../enums";
import { OtpDocument } from "src/DB/Model";
import { IProduct } from "./product.interface";

export interface IUser{
    _id?: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
    firstName: string;
    lastName: string;
    userName?: string;
    email: string;
    confirmedAt?: Date;
    changeCredentialTime?: Date;
    password?: string;
    gender: GenderEnum;
    provider: ProviderEnum;
    role: RoleEnum
    preferredLanguage: PreferredLanguage
    profilePicture?: string
    wishlist?:Types.ObjectId[]| IProduct[];
    otp?:OtpDocument[]
        
    }
