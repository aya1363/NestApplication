import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import {  UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import {
  BrandRepository, CategoryRepository,
  ProductRepository,UserRepository
} from 'src/DB';
import type {
  CategoryDocument,
  ProductDocument, UserDocument,
} from 'src/DB';
import { FolderEnum, S3Service } from 'src/common';
import { randomUUID } from 'crypto';
import { Types } from 'mongoose';
import { Lean } from 'src/DB/Repository/database.repository';
import { GetAllSearchQueryDto } from 'src/common/dtos';

@Injectable()
export class ProductService {

  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly brandRepository: BrandRepository,
    private readonly userRepository:UserRepository,
    private readonly s3Service:S3Service
  ){}
  async create(createProductDto: CreateProductDto, user: UserDocument, files: Express.Multer.File[]):Promise<ProductDocument>{
    const { name , description , discount, stock ,originalPrice}= createProductDto
    const category = await this.categoryRepository.findOne({
      filter:{_id:createProductDto.category}
    })
  if (!category) {
    throw new NotFoundException('fail to find matching category') }
      const brand = await this.brandRepository.findOne({
      filter:{_id:createProductDto.brand}
    })
  if (!brand) {
      throw new NotFoundException('fail to find matching brand')
    }
    const assetFolderId = randomUUID()
    const images = await this.s3Service.uploadFiles({ files, path: `${FolderEnum.category}/${(createProductDto.category).toString()}/${FolderEnum.product}/${assetFolderId}` })
    const  salePrice = Number(
  (originalPrice - (originalPrice * (discount || 0) / 100))
    .toFixed(2))
    const [product] = await this.productRepository.create({
      data: [{
        images,
        category: category._id,
        brand: brand._id,
        name, description
        , discount, stock,
        salePrice,
        originalPrice, assetFolderId,
        createdBy:user._id
        
      }]
    })
    if (!product) {
      throw new BadRequestException('fail to create product instance')
    }
    return product;
  }



  async update(productId: Types.ObjectId
    , updateProductDto: UpdateProductDto,
    user:UserDocument
    ) {
      const product = await this.productRepository.findOne({
        filter:{_id:productId}
      })
      if (!product) {
            throw new NotFoundException('fail to find matching product')

      }
      if (updateProductDto.category) {
              const category = await this.categoryRepository.findOne({
                    filter:{_id:updateProductDto.category}
    })
              if (!category) {
                throw new NotFoundException('fail to find matching category')
      }
        updateProductDto.category =category._id
    }
  
      if (updateProductDto.brand) {
      const brand = await this.brandRepository.findOne({
        filter:{_id:updateProductDto.brand}
    })
              if (!brand) {
                throw new NotFoundException('fail to find matching brand')
      }
      updateProductDto.brand =brand._id
    }

    let salePrice = product.salePrice
    if (updateProductDto.originalPrice || updateProductDto.discount) {
      const originalPrice = updateProductDto.originalPrice ?? product.originalPrice
      const discount = updateProductDto.discount ?? product.discount
      const finalPrice = Number(
        (originalPrice - (originalPrice * (discount || 0) / 100)))
      salePrice = finalPrice > 0 ? salePrice : 1
      
    }
    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: {_id:productId},
      update: {
        ...updateProductDto,
        salePrice,
        updatedBy:user._id

      }
      })
    if (!UpdateProductDto) {
      throw new BadRequestException('fail to update product instance')
    }
    return updatedProduct;
    
  }

  async updateAsset(
    productId: Types.ObjectId,
    updateProductAttachmentDto:UpdateProductAttachmentDto,
    user: UserDocument,
    files?:Express.Multer.File[]
    ) {
      const product = await this.productRepository.findOne({
        filter: { _id: productId },
        options: {
          populate:[{path:'category'}]
        }
      })
      if (!product) {
            throw new NotFoundException('fail to find matching product')

    }
    let images:string[] = []
      if (files?.length) {
        images = await this.s3Service.uploadFiles({files,path:`${FolderEnum.category}/${(product.category as unknown as CategoryDocument).assetFolderId}/${FolderEnum.product}/${product.assetFolderId}`})
    }
    
    const removedImages = [...new Set(updateProductAttachmentDto.removedImages ?? []) ];


    const updatedProduct = await this.productRepository.findOneAndUpdate({
      filter: { _id: productId },
      update: [{
        $set: {
          images: {
            $setUnion: [
              {
                $setDifference: [
                '$images',removedImages
                ]
              },
              images
            ]
          }

        , updatedBy:user._id
        }
      }]
    });

    if (!updatedProduct) {
      throw new BadRequestException('fail to update product instance')
    }
    return updatedProduct;
    
  }
async freeze(
      productId: Types.ObjectId,
      user: UserDocument,
    ): Promise < string > {
      const product = await this.productRepository.findOneAndUpdate({
        filter: { _id: productId },
        update: {
          freezedAt: new Date(),
          $unset: { restoredAt: '' },
          updatedBy: user._id,
        },
        options: { new: true },
      });
      if(!product) {
        throw new NotFoundException('Fail to find matching product instance');
      }

  return 'Done';
    }
  
  async restore(
      productId: Types.ObjectId,
      user: UserDocument,
    ): Promise < ProductDocument | Lean < ProductDocument >> {
      const product = await this.productRepository.findOneAndUpdate({
        filter: {
          _id: productId,
          freezedAt: { $exists: true },
          paranoid: false, // ✅ skip paranoid hook
        },
        update: {
          restoredAt: new Date(),
          $unset: { freezedAt: '' },
          updatedBy: user._id,
        },
        options: { new: true },
      })


  if (!product) {
    throw new NotFoundException('Fail to restore matching product instance');
  }

  return product;
}


  async remove(productId: Types.ObjectId,
    user: UserDocument,
  ): Promise<string> {
    console.log(user.userName);
    
      const product = await this.productRepository.findOneAndDelete({
        filter: {
        _id: productId,
          freezedAt: { $exists: true },
          paranoid: false 
      }

      })
      if (!product) {

      throw new NotFoundException('fail to find matching  product instance ')
    }
    await this.s3Service.deleteListFolderByPrefix({
  path: `${FolderEnum.category}/${product.category.toString()}/${FolderEnum.product}/${product.assetFolderId}`,
});
    return 'Done';
  }


  
  async findAll(data: GetAllSearchQueryDto
    , archive: boolean = false): Promise<{
  currentPage: number | 'all';
  pages?: number;
  limit?: number;
  docsCount?: number;
  result: ProductDocument[] | Lean<ProductDocument>[];
}> {

    const { page, size , search }:GetAllSearchQueryDto = data;

    const result = await this.productRepository.paginate({
      filter: {
        ...(search ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { slug: { $regex: search, $options: 'i' } },
            {description:{$regex:search ,$options:'i'}},
          ]
        } : {}),
        ...(archive ? { paranoid: false, freezedAt: { $exists: true } } : {})
      },
        options: {
    populate: [
      { path: 'brand' },
      { path: 'category' }
    ]
  },
      page,
      size
    })
    return result;
  }

    async findOne(productId: Types.ObjectId, archive: boolean = false
    ):Promise<ProductDocument | Lean<ProductDocument>> {

      
    const product = await this.productRepository.findOne({
  filter: {
    _id: productId,
    ...(archive ? { paranoid: false, freezedAt: { $exists: true } } : {})
  },
  options: {
    populate: [
      { path: 'brand' },
      { path: 'category' }
    ]
  }
});
      if (!product) {
        throw new NotFoundException('fail to find matching product instance ')
      }
    return product;
  }

    async addToWishlist( user: UserDocument,
    productId: Types.ObjectId,
  )
    : Promise<ProductDocument> {
    const product = await this.productRepository.findOne({
      filter: { _Id: productId }
    })
    
    if (!product) {
      throw new NotFoundException('fail to find matching user cart')
      }
      await this.userRepository.updateOne({
        filter: {_id:user._id},
        update: {
          $addToSet:{wishlist:product._id}
        }
      })
  return product ;
  }
      async removeFromWishlist( user: UserDocument,
    productId: Types.ObjectId,
  )
    : Promise<string> {
  
      await this.userRepository.updateOne({
        filter: {_id:user._id},
        update: {
          $pull:{wishlist:Types.ObjectId.createFromHexString(productId as unknown as string)}
        }
      })
  return 'Done' ;
  }


}
