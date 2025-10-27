import { EventEmitter } from 'node:events'
import { sendEmail } from '../email/send.email'
import { emailVerification } from '../email/template/email.template'
import { emailVerificationRole } from './template/email.changeRole'
import { OtpEnum } from 'src/common/enums'
export const emailEvent = new EventEmitter()







emailEvent.on(OtpEnum.resetPassword, async (data): Promise<void> => {
  try {
    await sendEmail({
      to: data.to,
      subject: OtpEnum.resetPassword,
      html: await emailVerification({ otp: data.otp, title: data.title }),
    })
  } catch (error) {
    console.error(`Failed to send sendForgetPassword otp to ${data.to}`, error)
  }
})


emailEvent.on(OtpEnum.confirmEmail, async (data): Promise<void> => {
  try {
    await sendEmail({
      to: data.to,
      subject: OtpEnum.confirmEmail,
      html: await emailVerification({ otp: data.otp, title: data.title }),
    })
  } catch (error) {
    console.error(`Failed to send email confirmation otp to ${data.to}`, error)
  }
})

emailEvent.on('changeRole', async (data): Promise<void> => {
  try {
    await sendEmail({
      to: data.to,
      subject: data.subject ?? 'Chang Role',
      html: await emailVerificationRole({ message: data.message, title: data.title }),
    })
  } catch (error) {
    console.error(`Failed to send change role information to ${data.to}`, error)
  }
})
