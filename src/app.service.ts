import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Welcome to Nest_App! ⚡ Code. Create. Conquer. 💻🔥';
  }
}
