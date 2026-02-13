import { Types } from "mongoose";
import { IUser } from "./user.interface";
import { OrderStatusEnum, PaymentEnumType } from "../enums";
import { ICoupon } from "./coupon.interface";
import { IProduct } from "./product.interface";

export class IOrderProduct {
    _id?: Types.ObjectId;
    productId: Types.ObjectId | IProduct
    quantity: number
    finalPrice:number
    unitPrice:number
    createdAt?: Date
    updatedAt?: Date ;
}

export class IOrder{
    _id?: Types.ObjectId;
    orderId:string
    address: string
    phone: string
    note?: string
    cancelReason?:string
    status: OrderStatusEnum
    payment: PaymentEnumType
    coupon?: Types.ObjectId | ICoupon
    products:IOrderProduct[]
    discount?: number
    total: number
    subTotal: number
    paidAt: Date
    paymentIntent?:string
    createdAt?: Date
    updatedAt?: Date
    freezedAt?: Date
    restoredAt?:Date
    createdBy: Types.ObjectId | IUser;
    updatedBy?: Types.ObjectId | IUser;
}