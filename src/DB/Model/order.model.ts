import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { IOrder, IOrderProduct, } from "src/common";
import {OrderStatusEnum, PaymentEnumType} from 'src/common/enums'

@Schema({
    timestamps: true, strict: true,
    strictQuery: true,
})
export class OrderProduct implements IOrderProduct{
    

    @Prop({
        type: Number,
        required:true
    })
    quantity: number;
    @Prop({
        type: Number,
        required:true
    })

    finalPrice: number;

    @Prop({
        type: Number,
        required:true
    })
    unitPrice: number;

    @Prop({
        type: Types.ObjectId,
        ref: 'Product',
        required:true
    })
    productId: Types.ObjectId 

    
}
@Schema({
    timestamps: true, strict: true, strictQuery: true,
    toJSON: { virtuals: true }, toObject: { virtuals: true }
})
export class Order implements IOrder{
    @Prop([OrderProduct])
    products: IOrderProduct[]; 
    @Prop({
        type: String,
        maxLength: 1000,
        minLength:20,
        required: true,

    })
    address: string;
    @Prop({
        type: String,
        required: true,
    })
    phone: string;

    @Prop({
        type: String,
        maxLength: 1000,
        minLength:10,

    })
    note: string 

    @Prop({
        type: String,
        maxLength: 1000,
        minLength:20,
    })
    cancelReason: string 
    @Prop({
        type: Number,
        required: true,
    })
    total: number;

    @Prop({
        type: Number,
        required: true,
    })
        
    subTotal: number;
    @Prop({
        type: String,
        enum: PaymentEnumType,
        default:PaymentEnumType.cash
        
    })
    payment: PaymentEnumType;

    @Prop({
        type: String,
    })
    paymentIntent: string 


    @Prop({
        type: Number,
        default:0
    })
    discount: number 
    

    @Prop({
        type: Types.ObjectId,
        ref: 'Coupon',
        required:false
    })
    coupon: Types.ObjectId 

    
    @Prop({
        type: String,
        enum: OrderStatusEnum,
        default: function (this:Order) {
            return this.payment == PaymentEnumType.card ?
                OrderStatusEnum.Pending : OrderStatusEnum.placed
        }
    })
    status: OrderStatusEnum;
    @Prop({
        type:String ,
        required: true,
        unique:true
    })
    orderId: string;

    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        
    })
    updatedBy?: Types.ObjectId 
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
    
    })
    createdBy: Types.ObjectId 
        
    @Prop({
        type: Date,
    })
    freezedAt: Date 

    @Prop({
        type: Date,
    })
        
    paidAt: Date;
    @Prop({
        type:Date
    })
    restoredAt: Date 
    
}
export type OrderProductDocument = HydratedDocument<OrderProduct>

export type OrderDocument = HydratedDocument<Order>
const orderSchema = SchemaFactory.createForClass(Order)

orderSchema.pre('validate', function (next) {
    if (this.total != null && this.discount != null) {
        // If discount is percent (0.04) → subtract percent
        // If discount is fixed amount (50) → subtract directly
        if (this.discount < 1) {
            // percentage discount
            this.subTotal = this.total - (this.total * this.discount);
        } else {
            // fixed discount
            this.subTotal = this.total - this.discount;
        }
    }
    next();
}); 
orderSchema.pre('save',  function (next) {
    if (this.isModified('total')) {
        this.subTotal = this.total - ( this.total * this.discount)
    }
    next()
})
orderSchema.pre(['findOne','find','findOneAndUpdate'],  function (next) {

    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({...query})
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
        
    }
    next()
    })

export const OrderModel = MongooseModule.forFeature([
    { name: Order.name , schema:orderSchema}
])
