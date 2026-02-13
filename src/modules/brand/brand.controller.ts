import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipe, UsePipes, ValidationPipe, Query } from '@nestjs/common';
import { BrandService } from './brand.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import {
  BrandParamsDto, GetAllBrandQueryDto,
  UpdateBrandDto
} from './dto/update-brand.dto';
import {
  Auth, cloudFileUpload, fileValidation,
  GetAllResponse, IBrand, IResponse, successResponse, User
} from '../../common';
import type{ UserDocument } from '../../DB/Model';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandResponse } from './entities/brand.entity';
import { endPoint } from './brand.authorization';
@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('brand')
export class BrandController {
  constructor(private readonly brandService: BrandService) {}
@UseInterceptors(FileInterceptor('attachment',cloudFileUpload({validation:fileValidation.image })))
@Auth(endPoint.create)
@Post('/')
  async create(
    @User() user:UserDocument,
    @Body() createBrandDto: CreateBrandDto,
    @UploadedFile(ParseFilePipe) file: Express.Multer.File):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.create(createBrandDto ,file ,user);
        return successResponse <BrandResponse>({data:{brand}})
  }

  @Auth(endPoint.create)
  @Patch(':brandId')
  async update(@User() user:UserDocument,
    @Param() params: BrandParamsDto,
    @Body() updateBrandDto: UpdateBrandDto,
  
  ):Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.update(params.brandId, updateBrandDto, user);
    return successResponse <BrandResponse>({data:{brand}})
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ))
  @Auth(endPoint.create)
  @Patch(':brandId/asset')
  async updateAsset(

    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Param() params: BrandParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.updateAsset(params.brandId, user, file);
    return successResponse<BrandResponse>({ data: { brand } });
  }
  @Auth(endPoint.create)
  @Delete(':brandId/freeze')
  async freeze(@Param() params: BrandParamsDto,
    @User() user: UserDocument):Promise<IResponse>{
    await this.brandService.freeze(params.brandId, user);
    return successResponse()
  }

    @Auth(endPoint.create)
  @Patch(':brandId/restore')
  async restore(@Param() params: BrandParamsDto,
    @User() user: UserDocument):Promise<IResponse<BrandResponse>>{
    const brand = await this.brandService.restore(params.brandId, user);
    return successResponse <BrandResponse>({data:{brand}})
  }
  @Auth(endPoint.create)
  @Delete(':brandId/remove')
  async remove(@Param() params: BrandParamsDto,
@User() user: UserDocument):Promise<IResponse> {
    await this.brandService.remove(params.brandId, user);
    return successResponse()
  }



  @Get()
  async findAll(
    @Query() query:GetAllBrandQueryDto
):Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query);
    return successResponse <GetAllResponse<IBrand>>({data:{result}})
  }
  @Auth(endPoint.create)
  @Get('/archive')
  async findAllArchives(
    @Query() query:GetAllBrandQueryDto
):Promise<IResponse<GetAllResponse<IBrand>>> {
    const result = await this.brandService.findAll(query , true );
    return successResponse <GetAllResponse<IBrand>>({data:{result}})
  }

  @Get('/:brandId')
  async findOne(@Param() params: BrandParamsDto
  )
    : Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId);
    return successResponse <BrandResponse>({data:{brand}})
  }
    @Auth(endPoint.create)
  @Get('/:brandId/archive')
  async findOneArchive(@Param() params: BrandParamsDto
  )
    : Promise<IResponse<BrandResponse>> {
    const brand = await this.brandService.findOne(params.brandId , true);
    return successResponse <BrandResponse>({data:{brand}})
  }
}

