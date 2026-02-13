import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import { IProduct } from "src/common";

@Schema({
    timestamps: true, strictQuery: true, strict: true,
    toJSON: { virtuals: true }, toObject: { virtuals: true }
})
export class Product implements IProduct {
        @Prop({
        type: String,
        required: true,
        minLength: 2,
        maxLength:2000
    })
    name: string;
    

    @Prop({
        type: [String],
        required: true
    })
    images: string[];
        @Prop({
        type: String,
        required: true,
    })
    assetFolderId: string;

    @Prop({
        type: String,
        minLength: 2,
        maxLength: 5000,
        trim: true // removes extra spaces from beginning & end
    })
    description?: string 

    @Prop({
        type: Date,
        
    })
    restoredAt?: Date
    @Prop({
        type: Date,
        
    })
    freezedAt?: Date 
    
    @Prop({
    type: String,
    minLength: 2,
    maxLength:5000
    })
    slug: string;
    @Prop({
        type: Number,
        required: true,
    })
    salePrice: number;

    @Prop({
        type: Number,
        default:0,
    })
    discount: number;

    @Prop({
        type: Number,
        default:0,
    })
    soldItems: number;

    @Prop({
        type: Number,
        required: true,
    })
    stock: number;

    @Prop({
        type: Number,
        required: true,
    })
    originalPrice: number;

    @Prop({
        type: Types.ObjectId,
        ref: 'Category',
        required:true
    })
    category: Types.ObjectId;

    @Prop({
        type: Types.ObjectId,
        ref:'User'
    })
    updatedBy?: Types.ObjectId 

    @Prop({
        type: Types.ObjectId,
        ref: 'Brand',
        required: true
    })
    brand?: Types.ObjectId 

    @Prop({
        type:Types.ObjectId,
        ref: 'User',
        required:true
    })
    createdBy: Types.ObjectId 

    
}

export type ProductDocument = HydratedDocument<Product>
export const ProductSchema= SchemaFactory.createForClass(Product)

ProductSchema.virtual('brandDetails', {
    ref: 'Brand',
    localField: 'brand',
    foreignField: '_id',
    justOne: true,
});

ProductSchema.virtual('categoryDetails', {
    ref: 'Category',
    localField: 'category',
    foreignField: '_id',
    justOne: true,
});
ProductSchema.pre('save',  function (next) {
   // console.log(this);
    
        if (this.isModified('name')) {
        this.slug =  slugify(this.name)
    }
    next()
})
    
ProductSchema.pre(['findOneAndUpdate','updateOne'],  function (next) {
    const update = this.getUpdate() as UpdateQuery<Product>
    if (update.name) {
        this.setUpdate({...update , slug:slugify(update.name , { lower: true, strict: true })})
    }
    next()
})
    
ProductSchema.pre(['findOne','find','findOneAndUpdate'],  function (next) {

    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({...query})
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
        
    }
    next()
    })

export const ProductModel = MongooseModule.forFeature([{name:Product.name , schema:ProductSchema}])