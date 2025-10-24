import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Please provide password' })
  @IsString({ message: 'Password should be a string' })
  @MinLength(6, { message: 'Password must be at least 6 charecters long' })
  password: string;
}
