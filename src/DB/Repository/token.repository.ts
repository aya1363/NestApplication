import { Model } from 'mongoose';
import { DataBaseRepository } from './database.repository';
import { TokenDocument as TDocument, Token } from '../Model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenRepository extends DataBaseRepository<Token> {
  constructor(
    @InjectModel(Token.name)
    protected override readonly model: Model<TDocument>,
  ) {
    super(model);
  }
}
