import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: 'Please provide email' })
  @IsEmail({}, { message: 'Please provide a valid email' })
  email: string;

  @IsNotEmpty({ message: 'Please provide Name' })
  @IsString({ message: 'Name should be a string' })
  @MinLength(3, { message: 'Name must be at least 3 charecters long' })
  @MaxLength(50, { message: 'Name can not be longer then 50 charecters' })
  name: string;

  @IsNotEmpty({ message: 'Please provide password' })
  @MinLength(6, { message: 'Password must be at least 6 charecters long' })
  password: string;
}
