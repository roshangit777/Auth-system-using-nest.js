import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly configServices: ConfigService) {}

  @Get()
  getHello() {
    const name = this.configServices.get<string>('appName');
    return name;
  }
}
