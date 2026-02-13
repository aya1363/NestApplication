import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { CouponEnum } from "../enums";

export interface ICoupon {
    _id?: Types.ObjectId;
    name: string
    slug: string
    image: string
    
    createdAt?: Date
    updatedAt?: Date
    freezedAt?: Date
    restoredAt?: Date
    startDate: Date
    endDate: Date

    usedBy: Types.ObjectId[] | IUser[];
    duration: number
    discount: number
    type:CouponEnum
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;


}