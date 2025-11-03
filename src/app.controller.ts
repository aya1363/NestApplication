import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { S3Service } from './common';
import type { Response } from 'express';
import { pipeline } from "node:stream";
import { promisify } from "node:util";

const createS3WriteStream = promisify(pipeline);

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly s3Service: S3Service
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('/upload/pre-signed/*path')
  async getPreSignedUrl(
    @Query() query: {
      download?: 'true' | 'false';
      fileName?: string
    },
    @Param() params:{path:string[]}
  ) {
    const { download, fileName } = query
    const { path } = params
    const Key = path.join('/')
    const url = await this.s3Service.createGetPreSignUploadUrl({
      Key,
      download,
      downloadName: fileName
    })
    return {message:'done',data:{url}}
  }

    @Get("/upload/*path")
      async GetAssetUrl(
  
        @Param() params: { path: string[] },
        @Res({passthrough:true}) res:Response
  )  {
      const { path } = params as unknown as { path: string[] };
      const Key = path.join("/");
      const s3Response = await this.s3Service.getFile({ Key });
      console.log(s3Response.Body);

      if (!s3Response?.Body) {
        throw new BadRequestException("fail to fetch this asset");
      }
      res.setHeader("Access-Control-Allow-Origin", "*"); 
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader( "Access-Control-Expose-Headers","Content-Disposition, Content-Type");
      res.setHeader("Content-Type",s3Response.ContentType || "application/octet-stream" );
        return await createS3WriteStream(s3Response.Body as NodeJS.ReadableStream, res);
      }


}
