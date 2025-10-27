import { MongooseModule, Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

@Schema({
  strictQuery: true,
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})
export class Token {
  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  jti: string;
  @Prop({
    type: Date,
    required: true,
  })
  expiredAt: Date;

  @Prop({
    type: Date,
  })
  confirmedAt: Date;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
  })
  createdBy: Types.ObjectId;
}

export const tokenSchema = SchemaFactory.createForClass(Token);

export type TokenDocument = HydratedDocument<Token>;
export const TokenModel = MongooseModule.forFeature([
  { name: Token.name, schema: tokenSchema },
]);
