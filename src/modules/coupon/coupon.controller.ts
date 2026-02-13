import { Controller, Get, Post, Body, Patch, Param, Delete, UsePipes, ValidationPipe, UseInterceptors, UploadedFile, ParseFilePipe, Query } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { CouponParamsDto, UpdateCouponDto } from './dto/update-coupon.dto';
import {
  Auth, cloudFileUpload, fileValidation,
  GetAllResponse, GetAllSearchQueryDto, ICoupon, IResponse, successResponse, User
} from '../../common';
import { endPoint } from './coupon.authorization';
import type{ UserDocument } from '../../DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { CouponResponse } from './entities/coupon.entity';

@UsePipes(new ValidationPipe({whitelist:true , forbidNonWhitelisted:true}))
@Controller('coupon')
export class CouponController {
  constructor(private readonly couponService: CouponService,
  ) { }
  @UseInterceptors(FileInterceptor('attachment',
      cloudFileUpload({validation:fileValidation.image })
    )) 
  @Auth(endPoint.create)
  @Post()
  async create(@Body() createCouponDto: CreateCouponDto,
    @User() user: UserDocument,
    @UploadedFile(ParseFilePipe ) file:Express.Multer.File
  ):Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.create(createCouponDto, user, file);
    return successResponse<CouponResponse>({data:{coupon}})
  }

  @Auth(endPoint.create)
  @Patch(':couponId')
  async update(@User() user:UserDocument,
    @Param() params:CouponParamsDto,
    @Body() updateCouponDto: UpdateCouponDto,
  
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.update(params.couponId, updateCouponDto, user);
    return successResponse <CouponResponse>({data:{coupon}})
  }

  @UseInterceptors(
    FileInterceptor(
      'attachment',
      cloudFileUpload({ validation: fileValidation.image }),
    ))
  @Auth(endPoint.create)
  @Patch(':couponId/asset')
  async updateAsset(

    @UploadedFile(new ParseFilePipe()) file: Express.Multer.File,
    @Param() params: CouponParamsDto,
    @User() user: UserDocument,
  ): Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.updateAsset(params.couponId, user, file);
    return successResponse<CouponResponse>({ data: { coupon } });
  }
  @Auth(endPoint.create)
  @Delete(':couponId/freeze')
  async freeze(@Param() params: CouponParamsDto,
    @User() user: UserDocument):Promise<IResponse>{
    await this.couponService.freeze(params.couponId, user);
    return successResponse()
  }

    @Auth(endPoint.create)
  @Patch(':couponId/restore')
  async restore(@Param() params: CouponParamsDto,
    @User() user: UserDocument):Promise<IResponse<CouponResponse>>{
    const coupon = await this.couponService.restore(params.couponId, user);
    return successResponse <CouponResponse>({data:{coupon}})
  }
  @Auth(endPoint.create)
  @Delete(':couponId/remove')
  async remove(@Param() params: CouponParamsDto,
@User() user: UserDocument  ):Promise<IResponse> {
    await this.couponService.remove(params.couponId, user);
    return successResponse()
  }



  @Get()
  async findAll(
    @Query() query:GetAllSearchQueryDto
):Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query);
    return successResponse <GetAllResponse<ICoupon>>({data:{result}})
  }
  @Auth(endPoint.create)
  @Get('/archive')
  async findAllArchives(
    @Query() query:GetAllSearchQueryDto
):Promise<IResponse<GetAllResponse<ICoupon>>> {
    const result = await this.couponService.findAll(query , true );
    return successResponse <GetAllResponse<ICoupon>>({data:{result}})
  }

  @Get('/:couponId')
  async findOne(@Param() params: CouponParamsDto
  )
    : Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId);
    return successResponse <CouponResponse>({data:{coupon}})
  }
    @Auth(endPoint.create)
  @Get('/:couponId/archive')
  async findOneArchive(@Param() params: CouponParamsDto
  )
    : Promise<IResponse<CouponResponse>> {
    const coupon = await this.couponService.findOne(params.couponId , true);
    return successResponse <CouponResponse>({data:{coupon}})
  }
}
