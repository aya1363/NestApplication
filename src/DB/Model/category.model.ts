import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";
import {   ICategory } from "src/common";


@Schema({timestamps:true ,strictQuery:true ,strict:true})
export class Category implements ICategory {
    @Prop({
        type: String,
        required: true,
        unique: true,
        minLength: 2,
        maxLength:10000
    })
    name: string;
    @Prop({
        type: String,
        required: true,
    })
    assetFolderId: string;

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
    description?: string;

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

    @Prop([{
        type: Types.ObjectId,
        ref: 'Brand',
        required:false}])
    brands?: Types.ObjectId[]

    @Prop({ type: Date })
    freezedAt?: Date; 

    @Prop({
        type: Date,
    })
    restoredAt: Date 

    
}
export type CategoryDocument = HydratedDocument<Category>
export const categorySchema= SchemaFactory.createForClass(Category)


categorySchema.pre('save',  function (next) {
   // console.log(this);
    
        if (this.isModified('name')) {
        this.slug =  slugify(this.name)
    }
    next()
})
    
categorySchema.pre(['findOneAndUpdate','updateOne'],  function (next) {
    const update = this.getUpdate() as UpdateQuery<Category>
    if (update.name) {
        this.setUpdate({...update , slug:slugify(update.name)})
    }
    next()
})
    
categorySchema.pre(['findOne','find','findOneAndUpdate'],  function (next) {

    const query = this.getQuery()
    if (query.paranoid === false) {
        this.setQuery({...query})
    } else {
        this.setQuery({ ...query, freezedAt: { $exists: false } })
        
    }
    next()
    })

export const CategoryModel = MongooseModule.forFeature([{name:Category.name , schema:categorySchema}])