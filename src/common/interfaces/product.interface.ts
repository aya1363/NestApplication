import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";

export interface IProduct {
    _id?: Types.ObjectId;
    name: string
    slug: string
    description?: string
    images: string[]

    originalPrice: number
    discount: number
    salePrice: number

    stock: number
    soldItems: number
    assetFolderId:string

    category: Types.ObjectId | ICategory;
    brand?: Types.ObjectId | IBrand;


    createdAt?: Date
    updatedAt?: Date
    freezedAt?: Date
    restoredAt?:Date
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;


}