import { Types } from "mongoose";
import { IUser } from "./user.interface";

export interface IBrand {
    _id?: Types.ObjectId;
    name: string
    slug: string
    slogan: string
    image :string
    createdAt?: Date
    updatedAt?: Date
    freezedAt?: Date
    restoredAt?:Date
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;


}