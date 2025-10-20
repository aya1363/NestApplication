import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import {  confirmEmailBodyDto, loginBodyDto, resendConfirmEmailBodyDto, SignupBodyDto } from './dto';
import { OtpRepository, TokenRepository, UserDocument, UserRepository } from 'src/DB';
import { compareHash,generateOtp, OtpEnum, ProviderEnum, tokenService } from 'src/common';
import { Types } from 'mongoose';
import { loginCredentialsResponse } from 'src/common/entities';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly tokenService: tokenService,


  ) { }
  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data:[ {
        code: generateOtp(),
        expiredAt: new Date(Date.now() + 2 * 60 * 1000),
        createdBy: userId,
        type:OtpEnum.confirmEmail
      }]
    })
  }

  async signup(data:SignupBodyDto) :Promise<string>{
    const { userName, email, password, confirmPassword ,gender } = data
    const checkUserExist = await this.userRepository.findOne({filter:{email}})
    if (checkUserExist) {
      throw new ConflictException('user Exist ')
    }
    const [user]= await this.userRepository.create({

        data:{userName ,email,password ,gender}
      }
    )
    if (!user) {
      throw new BadRequestException('fail to create this account ,please try again later ')
    }
    await this.createConfirmEmailOtp(user._id)

    return 'Done'
  }

  async confirmEmail(data:confirmEmailBodyDto) :Promise<string> {
    const { email , otp }: confirmEmailBodyDto = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt:{$exists:false}
      }, options: {
        populate:[{path:'otp',match:{type:OtpEnum.confirmEmail}}]
      }
    })
    if (!user) {
      throw new NotFoundException('fail to find matching account ')
    }
    if (!(user.otp?.length &&
      await compareHash({ plainText: otp, hashValue: user.otp[0].code }))) {
      throw new BadRequestException(`invalid otp` )
    }
    user.confirmedAt = new Date()
    await user.save();
    await this.otpRepository.deleteOne({
      filter: { _id: user.otp[0]._id }
    })

    return 'Done'
  }
  
    async resendConfirmEmail(data:resendConfirmEmailBodyDto) :Promise<string> {
    const { email }: resendConfirmEmailBodyDto = data;
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt:{$exists:false}
      }, options: {
        populate:[{path:'otp',match:{type:OtpEnum.confirmEmail}}]
      }
    })
    if (!user) {
      throw new NotFoundException('fail to find matching account ')
    }
    if (user.otp?.length) {
      throw new ConflictException(`sorry you have to wait until the existing one became expired ,please try again after  ${user.otp[0].expiredAt}` )
    }
    await this.createConfirmEmailOtp(user._id)
    return 'Done'
  }
  
     async login (data:loginBodyDto) :Promise<loginCredentialsResponse> {
    const { email ,password}: loginBodyDto = data;
        const user = await this.userRepository.findOne({
            filter:
            {
                email,
                confirmEmail: { $exists: true },
                confirmEmailOtp: { $exists: true }}}
        )
        if (!user) {
            throw new NotFoundException('In-valid login data')
    
        }
        if (!user.confirmedAt) {
            throw new BadRequestException('verify your account first')
        }
        const match = await compareHash({ plainText: password, hashValue: user.password })
        if (!match) {
            throw new NotFoundException('In-valid login data ')
        }
      return this.tokenService.getLoginCredentials(user as UserDocument)



}
}

