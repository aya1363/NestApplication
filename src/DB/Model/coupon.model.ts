import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { ICoupon } from "src/common";
import { CouponEnum } from "../../common/enums";



@Schema({
    timestamps: true, strictQuery: true, strict: true,
    toObject: { virtuals: true }, toJSON: { virtuals: true }
})
export class Coupon implements ICoupon {
    @Prop({
        type: String,
        required: true,
        unique: true,
        minLength: 2,
        maxLength:50
    })
    name: string;


    @Prop({
        type: String,
        minLength: 2,
        maxLength:5000
    })
    slug: string;



    @Prop({
        type: String,
        required: true
    })
    image: string;


    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        required: true
    })
    createdBy: Types.ObjectId;
    @Prop({
        type: Types.ObjectId,
        ref: 'User'

    })
    updatedBy?: Types.ObjectId
    
    @Prop({
        type: [{
            type: Types.ObjectId,
            ref: 'User'
        }],
    default: []
})
    usedBy: Types.ObjectId[] 
    @Prop({
        type: Number,
        default:1
    })
    duration: number;

    @Prop({
        type: Number,
        required:true
    })
    discount: number;

    @Prop({
        type: String,
        enum: CouponEnum,
        default:CouponEnum.PERCENT
        
    })
    type: CouponEnum;
    @Prop({
        type: Date,
        required:true
    })
    endDate: Date;
    @Prop({
        type: Date,
        required:true
    })
    startDate: Date;
    


    @Prop({ type: Date })
    freezedAt?: Date; 

    @Prop({
        type: Date,
    })
    restoredAt: Date 

    
}
export type CouponDocument = HydratedDocument<Coupon>
export const couponSchema = SchemaFactory.createForClass(Coupon)


couponSchema.pre('save',  function (next) {
   // console.log(this);
    
        if (this.isModified('name')) {
        this.slug =  slugify(this.name)
    }
    next()
})
    
couponSchema.pre(['findOneAndUpdate','updateOne'],  function (next) {
    const update = this.getUpdate() as UpdateQuery<Coupon>
    if (update.name) {
        this.setUpdate({...update , slug:slugify(update.name)})
    }
    next()
})
    
couponSchema.pre(['findOne','find','findOneAndUpdate'],  function (next) {

    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({...query})
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
        
    }
    next()
    })

export const CouponModel = MongooseModule.forFeature([{name:Coupon.name , schema:couponSchema}])