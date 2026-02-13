import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import {
  BrandModel, BrandRepository, CategoryModel,
  CategoryRepository,
  ProductModel, ProductRepository,
  
} from 'src/DB';
import { S3Service } from 'src/common';


@Module({
  imports:[ProductModel,CategoryModel,BrandModel],
  controllers: [ProductController],
  providers: [ProductService,
    CategoryRepository,
    BrandRepository,
    ProductRepository,
    S3Service  ],
})
export class ProductModule {}
