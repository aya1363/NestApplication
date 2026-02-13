
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  
} from '@nestjs/common';
import {
  OAuth2Client,
  TokenPayload,
 
} from 'google-auth-library';

import { confirmEmailBodyDto, IGmail, loginBodyDto, resendConfirmEmailBodyDto, ResetPasswordDto, SendOtpDto, SignupBodyDto, VerifyOtpDto } from './dto/auth.dto';
import { compareHash, generateHash, generateOtp, OtpEnum, ProviderEnum, TokenService } from 'src/common';
import { Types } from 'mongoose';
import { loginCredentialsResponse } from '../../common';
import { OtpRepository, UserRepository } from '../../DB/Repository';
import { UserDocument } from '../../DB/Model';




@Injectable()
export class AuthenticationService {

        private async verifyGmailAccount(idToken:string):Promise<TokenPayload> {
        const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.WEB_CLIENT_ID?.split(',')|| [], 
  });
    const payload = ticket.getPayload();
        if (!payload?.email_verified) {
            throw new BadRequestException("fail to verify this google account");
        }
    return payload
}

  constructor(
    private readonly userRepository: UserRepository,
    private readonly otpRepository: OtpRepository,
    private readonly tokenService: TokenService,

  ) {
  }

  
  private async createConfirmEmailOtp(userId: Types.ObjectId) {
    await this.otpRepository.create({
      data: [
        {
          code: generateOtp(),
          expiredAt: new Date(Date.now() + 2 * 60 * 1000),
          createdBy: userId,
          type: OtpEnum.confirmEmail,
        },
      ],
    });
  }

  async signup(data: SignupBodyDto): Promise<string> {
    const { userName, email, password, confirmPassword, gender } = data;
    console.log(confirmPassword);

    const checkUserExist = await this.userRepository.findOne({
      filter: { email },
    });
    if (checkUserExist) {
      throw new ConflictException('user Exist ');
    }
    const [user] = await this.userRepository.create({
      data: { userName, email, password, gender },
    });
    if (!user) {
      throw new BadRequestException(
        'fail to create this account ,please try again later ',
      );
    }
    await this.createConfirmEmailOtp(user._id);

    return 'Done';
  }

    signupWithGmail = async (data: IGmail): Promise<loginCredentialsResponse>  => {

        const { idToken }:IGmail = data
        const { email, family_name, given_name,
        //    name ,
            picture }: TokenPayload
            = await this.verifyGmailAccount(idToken)
        
        const user = await this.userRepository.findOne({
            filter:{email }
        })
        if (user) {
            if (user.provider === ProviderEnum.GOOGLE) {
              //  return await  this.loginWithGmail(data)
            }
            throw new ConflictException(`Email exist with another provider :: ${user.provider}` )
        }
        const [newUser] = await this.userRepository.create({
            data: [{
                firstName: given_name as string
                , lastName: family_name as string ,
                profilePicture: picture as string,
                provider:ProviderEnum.GOOGLE,
                email,
                confirmedAt:new Date()
            }]
        }) || []
        if (! newUser) {
            throw new BadRequestException("fail to sign up with gmail ");
            
        }
      
      return this.tokenService.getLoginCredentials(newUser as UserDocument);

    }

        loginWithGmail = async (data: IGmail): Promise<loginCredentialsResponse>  => {

        const { idToken }:IGmail = data
        const { email}: TokenPayload
            = await this.verifyGmailAccount(idToken)
        
        const user = await this.userRepository.findOne({
            filter:{email ,provider:ProviderEnum.GOOGLE }
        })
        if (!user) {
            throw new NotFoundException(`not registered account or registered with another provider ` )
        }
    
        return this.tokenService.getLoginCredentials(user as UserDocument)

    }

  


    async confirmEmail(data: confirmEmailBodyDto): Promise<string> {
      const { email, otp }: confirmEmailBodyDto = data;
      const user = await this.userRepository.findOne({
        filter: {
          email,
          confirmedAt: { $exists: false },
        },
        options: {
          populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
        },
      });
      if (!user) {
        throw new NotFoundException('fail to find matching account ');
      }
      if (
        !(
          user.otp?.length &&
          (await compareHash({ plainText: otp, hashValue: user.otp[0].code }))
        )
    ) {
        throw new BadRequestException(`invalid otp`);
      }
      user.confirmedAt = new Date();
      await user.save();
      await this.otpRepository.deleteOne({
        filter: { _id: user.otp[0]._id },
      });

      return 'Done';
    }

    async resendConfirmEmail(data: resendConfirmEmailBodyDto): Promise<string> {
      const { email }: resendConfirmEmailBodyDto = data;
      const user = await this.userRepository.findOne({
        filter: {
          email,
          confirmedAt: { $exists: false },
        },
        options: {
          populate: [{ path: 'otp', match: { type: OtpEnum.confirmEmail } }],
        },
      });
      if (!user) {
        throw new NotFoundException('fail to find matching account ');
      }
      if (user.otp?.length) {
        throw new ConflictException(
          `sorry you have to wait until the existing one became expired ,please try again after  ${user.otp[0].expiredAt.toISOString()}`,
        );
      }
      await this.createConfirmEmailOtp(user._id);
      return 'Done';
  }

  async sendForgetPasswordOtp(data: SendOtpDto): Promise<string> {
    const {email} = data
    const user = await this.userRepository.findOne({
      filter: {
        email,
        confirmedAt: { $exists: true },
        provider:ProviderEnum.SYSTEM
      }
    });
    if (!user)
    { throw new NotFoundException('User not found') };


    await this.otpRepository.deleteMany({
      filter: { createdBy: user._id, type: OtpEnum.resetPassword },
    });

    const code =  generateOtp()

    await this.otpRepository.create({
      data: [
        {
          code ,
          expiredAt: new Date(Date.now() + 2 * 60 * 1000), 
          createdBy: user._id,
          type: OtpEnum.resetPassword,
        },
      ],
    });

  

    return 'Done';
  }


  async verifyForgetPasswordOtp(data: VerifyOtpDto): Promise<string> {
    const { email, otp } = data
    const user = await this.userRepository.findOne({
      filter: { email },
      options: {
        populate: [{ path: 'otp', match: { type: OtpEnum.resetPassword } }],
      },
    });

    if (!user) throw new NotFoundException('User not found');
    const userOtp = user.otp?.[0];
    if (!userOtp) throw new BadRequestException('No OTP found for this user');

  
    if (userOtp.expiredAt < new Date())
      throw new BadRequestException('OTP expired');

  
    const isValid = await compareHash({
      plainText: otp,
      hashValue: userOtp.code,
    });

    if (!isValid)
    { throw new BadRequestException('Invalid OTP') };

    return 'OTP verified successfully';
  }

  
async resetPassword(data: ResetPasswordDto): Promise<string> {
  const { email, newPassword, otp } = data;

  const user = await this.userRepository.findOne({
    filter: { email },
    options: {
      populate: [{ path: 'otp', match: { type: OtpEnum.resetPassword } }],
    },
  });
//console.log({hashedPass:user?.password});
  if (!user) throw new NotFoundException('User not found');

  const userOtp = user.otp?.[0];
  if (!userOtp) throw new BadRequestException('No OTP found');

  const isValid = await compareHash({
    plainText: otp,
    hashValue: userOtp.code,
  });

  if (!isValid) throw new UnauthorizedException('Invalid OTP');



  const isSamePassword = await compareHash({
    plainText: newPassword,
    hashValue: user.password,
  });
//console.log({isSamePassword});

  if (isSamePassword) {
    throw new BadRequestException('New password cannot be the same as the old password');
  }

  const updatedPassword = await generateHash({ plainText: newPassword });
  const updatedData = await this.userRepository.updateOne({
    filter: { email },
    update: {
      password :updatedPassword
    }
  })
  if (!updatedData) {
    throw new BadRequestException("can not update your data");
    
  }
  await this.otpRepository.deleteOne({ filter: { _id: userOtp._id } });

  return 'Password reset successfully 🎉';
}


  async login(data: loginBodyDto): Promise<loginCredentialsResponse> {
    const { email, password }: loginBodyDto = data;
    const user = await this.userRepository.findOne({
      filter: {

        email,
        confirmEmail: { $exists: true },
        confirmEmailOtp: { $exists: true },
      },
    });
    
    if (!user) {
      throw new NotFoundException('In-valid login data');
    }
    if (!user.confirmedAt) {
      throw new BadRequestException('verify your account first');
    }
    const match = await compareHash({
      plainText: password,
      hashValue: user.password,
    });
    if (!match) {
      throw new NotFoundException('In-valid login data ');
    }
    return this.tokenService.getLoginCredentials(user as UserDocument);
  }
}
