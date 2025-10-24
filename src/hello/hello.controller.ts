import { Controller, Get, Param, Query } from '@nestjs/common';
import { HelloService } from './hello.service';
import { UserService } from 'src/user/user.service';
import { ConfigService } from '@nestjs/config';

@Controller('hello')
export class HelloController {
  constructor(
    private readonly helloService: HelloService,
    private readonly userServices: UserService,
    private readonly configService: ConfigService,
  ) {}
  @Get('users')
  getName() {
    return this.userServices.getAllUsers();
  }

  @Get('users/:id')
  getParName(@Param('id') id: number) {
    return this.userServices.getOneUser(id);
  }

  @Get('user')
  getQueryName(@Query('id') id: number) {
    return this.userServices.welcomeUser(id);
  }
}
