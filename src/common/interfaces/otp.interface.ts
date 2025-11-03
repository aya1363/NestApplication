import { Types } from "mongoose";
import { OtpEnum } from "../enums";
import { IUser } from "./user.interface";

export interface IOtp {
    _id?: Types.ObjectId;
    code: string;
    expiredAt: Date;
    createdAT?: Date
    updatedAT?:Date
    createdBy: Types.ObjectId | IUser;
    type:OtpEnum
}