import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IBrand } from "src/common";


@Schema({timestamps:true ,strictQuery:true})
export class Brand implements IBrand {
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
        minLength: 2,
        maxLength: 50,
        required: true
    })
    slogan: string;

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

    @Prop({ type: Date })
    freezedAt?: Date; 

    @Prop({
        type: Date,
    })
    restoredAt: Date 

    
}
export type BrandDocument = HydratedDocument<Brand>
export const brandSchema = SchemaFactory.createForClass(Brand)


brandSchema.pre('save',  function (next) {
   // console.log(this);
    
        if (this.isModified('name')) {
        this.slug =  slugify(this.name)
    }
    next()
})
    
brandSchema.pre(['findOneAndUpdate','updateOne'],  function (next) {
    const update = this.getUpdate() as UpdateQuery<Brand>
    if (update.name) {
        this.setUpdate({...update , slug:slugify(update.name)})
    }
    next()
})
    
brandSchema.pre(['findOne','find','findOneAndUpdate'],  function (next) {

    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({...query})
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
        
    }
    next()
    })

export const BrandModel = MongooseModule.forFeature([{name:Brand.name , schema:brandSchema}])