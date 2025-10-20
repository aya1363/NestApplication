import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { GenderEnum, generateHash, ProviderEnum, RoleEnum } from 'src/common';
import { OtpDocument } from './otp.model';

@Schema({
    strictQuery: true,
    timestamps: true,
    toJSON: { virtuals: true },
    toObject:{virtuals:true}
})
export class User {
    @Prop({
        type: String,
        required: true,
        minLength: 2,
        maxLength: 15,
        trim:true
    })
    firstName: string;
    @Prop({
        type: String,
        required: true,
        minLength: 2,
        maxLength: 15,
        trim:true
    })
    lastName: string;

    @Virtual({
        get: function(this:User) {
            return `${this.firstName} ${this.lastName}`
        },
        set: function (value:string) {
            const [firstName, lastName] = value.split(' ') || []
            this.set({firstName,lastName})
        }
    })
    userName: string;

    
    @Prop({
        type: String,
        required: true,
        unique: true
    })
    email: string;

    @Prop({
        type: Date,
    })
    confirmedAt: Date;

    @Prop({
        type: Date,
    })
    changeCredentialTime: Date;


    @Prop({
        type: String,
        required: true
    })
    password: string;
    @Prop({
        type: String,
        enum: GenderEnum,
        default:GenderEnum.Male
    })
    gender: GenderEnum;
    @Prop({
        type: String,
        enum: ProviderEnum,
        default: ProviderEnum.SYSTEM,
        required: function (this:User) {
            return this.provider === ProviderEnum.GOOGLE ? false : true;
        }
    })
    provider: ProviderEnum;

    @Prop({
        type: String,
        enum: RoleEnum,
        default:RoleEnum.user
    })
    role: RoleEnum
    
    @Virtual()
    otp:OtpDocument[]
    
}


const userSchema = SchemaFactory.createForClass(User)
userSchema.virtual('otp', {
    localField: '_id',
    foreignField: 'createdBy',
    ref:'Otp'
})
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await generateHash({plainText:this.password})
    }
    next()
})
export type UserDocument = HydratedDocument<User>
export const UserModel = MongooseModule.forFeature([{name:User.name ,schema:userSchema}])