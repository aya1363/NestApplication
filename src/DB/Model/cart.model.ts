import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { ICart, ICartProduct } from "src/common";

@Schema({
    timestamps: true, strict: true,
    strictQuery: true,
})
export class CartProduct implements ICartProduct{
    

    @Prop({
        type: Number,
        required:true
    })
    quantity: number;
    @Prop({
        type: Types.ObjectId,
        ref: 'Product',
        required:true
    })
    product: Types.ObjectId 

    
}
@Schema({
    timestamps: true, strict: true, strictQuery: true,
    toJSON: { virtuals: true }, toObject: { virtuals: true }
})
export class Cart implements ICart{
    @Prop([CartProduct])
    products: ICartProduct[];
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true,
        unique:true
    })
    createdBy: Types.ObjectId 
    ;
    
}
export type CartProductDocument = HydratedDocument<CartProduct>

export type CartDocument = HydratedDocument<Cart>
const cartSchema = SchemaFactory.createForClass(Cart)
export const CartModel = MongooseModule.forFeature([
    { name: Cart.name , schema:cartSchema}
])
