import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { BrandRepository } from 'src/DB/Repository';
import { BrandModel } from 'src/DB/Model';
import { S3Service } from 'src/common';

@Module({
  imports:[BrandModel],
  controllers: [BrandController],
  providers: [BrandService,
    BrandRepository,
    S3Service
  ],
})
export class BrandModule {}
