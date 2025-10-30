import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register.dto';
import { LoginUserDto } from './dto/login.dto';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from './guards/auth.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './entities/user.entity';
import { RolesGuard } from './guards/roles.guard';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
import { LoginHistory } from 'src/events/entity/login-history.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authServices: AuthService) {}

  @Post('user/register')
  async registerUser(@Body() data: RegisterUserDto) {
    return await this.authServices.userRegister(data);
  }

  @UseGuards(LoginThrottlerGuard)
  @Post('user/login')
  async userLogin(@Body() data: LoginUserDto) {
    return await this.authServices.loginUser(data);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }

  @Post('create-admin')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async createAdmin(@Body() data: RegisterUserDto) {
    return await this.authServices.adminRegister(data);
  }

  @Post('admin-login')
  async adminLogin(@Body() data: LoginUserDto) {
    return await this.authServices.loginAdmin(data);
  }

  @Get('user-history')
  @Roles(UserRole.ADMIN)
  @UseGuards(AuthGuard, RolesGuard)
  async getAllUserLoginHistory(
    @Query('id') id?: number,
  ): Promise<LoginHistory[]> {
    const userId = id ? Number(id) : undefined;
    return await this.authServices.getUserLoginHistory(userId);
  }
}
