import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFiles, ParseFilePipe, Query, Patch } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductAttachmentDto, UpdateProductDto } from './dto/update-product.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import {
  Auth, cloudFileUpload, GetAllSearchQueryDto,
  fileValidation, GetAllResponse, IProduct,
  IResponse, storageEnum,
  successResponse, User
} from '../../common';
import { endPoint } from './product.authorization';
import type{ UserDocument } from '../../DB';
import {  ProductResponse } from './entities/product.entity';
import { ProductParamsDto } from './dto/update-product.dto';



@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))

  
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}
  @UseInterceptors(
    FilesInterceptor('attachment', 5,
      cloudFileUpload({ validation: fileValidation.image , storageApproach:storageEnum.disk})))
  @Auth(endPoint.create)
  @Post()
  async create(
    @UploadedFiles(ParseFilePipe) files:Express.Multer.File[],
    @User() user:UserDocument,
    @Body() createProductDto: CreateProductDto):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.create(createProductDto, user, files);
    return successResponse <ProductResponse>({data:{product}})
  }




  @Auth(endPoint.create)
  @Patch(':productId')
  async update(@Param() params: ProductParamsDto,
    @Body() updateProductDto: UpdateProductDto,
  @User() user:UserDocument):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.update(
      params.productId, updateProductDto, user);
    return successResponse<ProductResponse>({data:{product:product!}})
  }

    @UseInterceptors(
    FilesInterceptor('attachment', 5,
      cloudFileUpload({ validation: fileValidation.image , storageApproach:storageEnum.disk})))
  @Auth(endPoint.create)
  @Patch(':productId/asset')
  async updateAsset(
    @UploadedFiles(new ParseFilePipe({fileIsRequired:true})) files:Express.Multer.File[],
    @Param() params: ProductParamsDto,
    @Body() updateProductAttachmentDto: UpdateProductAttachmentDto,
    @User() user:UserDocument):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.updateAsset(params.productId, updateProductAttachmentDto ,user , files);
    return successResponse <ProductResponse>({data:{product}})
  }
  
    @Auth(endPoint.create)
    @Delete(':productId/freeze')
    async freeze(@Param() params: ProductParamsDto,
      @User() user: UserDocument):Promise<IResponse>{
      await this.productService.freeze(params.productId, user);
      return successResponse()
    }
  
    @Auth(endPoint.create)
    @Patch(':productId/restore')
    async restore(@Param() params: ProductParamsDto,
      @User() user: UserDocument): Promise<IResponse<ProductResponse>> {
      const product = await this.productService.restore(params.productId, user);
      return successResponse<ProductResponse>({ data: { product } });
    }
  
    @Auth(endPoint.create)
    @Delete(':productId/remove')
    async remove(@Param() params: ProductParamsDto,
  @User() user: UserDocument  ) {
      await this.productService.remove(params.productId, user);
      return successResponse()
    }
  
  
  
    @Get()
    async findAll(
      @Query() query: GetAllSearchQueryDto)
      : Promise < IResponse < GetAllResponse<IProduct> >> {
      const result = await this.productService.findAll(query);
      return successResponse <GetAllResponse<IProduct>>({data:{result}})
    }
    @Auth(endPoint.create)
    @Get('/archive')
    async findAllArchives(
      @Query() query:GetAllSearchQueryDto
  ):Promise<IResponse<GetAllResponse<IProduct>>> {
      const result = await this.productService.findAll(query , true );
      return successResponse <GetAllResponse<IProduct>>({data:{result}})
    }
  
    @Get('/:productId')
    async findOne(@Param() params: ProductParamsDto
    )
      : Promise<IResponse<ProductResponse>> {
      const product  = await this.productService.findOne(params.productId);
      return successResponse <ProductResponse>({data:{product }})
    }
      @Auth(endPoint.create)
    @Get(':productId/archive')
    async findOneArchive(@Param() params: ProductParamsDto
    )
      : Promise<IResponse<ProductResponse>> {
      const product  = await this.productService.findOne(params.productId , true);
      return successResponse <ProductResponse>({data:{product }})
  }
      @Auth(endPoint.wishlist)
      @Patch(':productId/add-to-wishlist')
  async addToWishlist(
    @Param() params:ProductParamsDto,
    @User() user: UserDocument):Promise<IResponse<ProductResponse>> {
    const product = await this.productService.addToWishlist(user,params.productId);
    return successResponse <ProductResponse>({data:{product}})

  }
    @Auth(endPoint.wishlist)
    @Patch(':productId/remove-from-wishlist')
  async removeFromWishlist(
    @Param() params:ProductParamsDto,
    @User() user: UserDocument):Promise<IResponse> {
    await this.productService.removeFromWishlist(user,params.productId);
    return successResponse ()

  }


}
