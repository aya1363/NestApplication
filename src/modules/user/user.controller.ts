import {
  Controller, Get, Headers, ParseFilePipe, Patch, Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth, fileValidation, RoleEnum, User } from 'src/common';
import type{ UserDocument } from 'src/DB/Model';
import { PreferredLanguageInterceptor } from 'src/common/interceptors';
import { delay, of ,Observable} from 'rxjs';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { localFileUpload } from 'src/common';
import type { IMulterFile } from 'src/common/interfaces';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }
@UseInterceptors(PreferredLanguageInterceptor)
@Auth([RoleEnum.admin ,RoleEnum.user])
  @Get()
profile(
    @Headers() header: any,
    @User() user: UserDocument): Observable<any> {
  console.log({user ,header});
  
  return of([{message:'done'}]).pipe(delay(200));
  }
  @UseInterceptors(FileInterceptor('profileImage',
    localFileUpload({folder:'User',validation:fileValidation.image})
  ))
  @Auth([RoleEnum.user])
  @Patch('profile-image')
  profileImage(@UploadedFile(new ParseFilePipe({fileIsRequired:true})) file:IMulterFile){
  
    console.log({file});
    


    return {message:'done' , file}
  }

  @UseInterceptors(FilesInterceptor('coverImages', 2,
      
    localFileUpload({folder:'User',validation:fileValidation.image})
  ))
  @Auth([RoleEnum.user])
  @Patch('cover-images')
  coverImages(@UploadedFiles(new ParseFilePipe({fileIsRequired:true})) files:Array<IMulterFile>){
  
    console.log({files});
    


    return {message:'done' , files}
  }
  @Post('list')
  list(): { message: string } {
  
    


    return {message:'done'}
  }


}
